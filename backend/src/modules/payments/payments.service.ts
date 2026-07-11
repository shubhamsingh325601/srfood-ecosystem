import { config } from '@/config/index';
import { PaymentMethod, PaymentStatus } from '@/types/domain.types';
import { BadRequestError, NotFoundError, UnauthorizedError } from '@/utils/errors';
import { logger } from '@/utils/logger';

import { paymentsRepository } from './payments.repository';
import { Razorpay, razorpayClient } from './razorpay.client';

interface RazorpayWebhookPayload {
  id: string;
  event: string;
  payload: {
    payment?: {
      entity: {
        id: string;
        order_id: string;
        amount: number;
        error_description?: string;
      };
    };
  };
}

export interface WebhookOutcome {
  orderId: string;
  status: 'CAPTURED' | 'FAILED';
  amountPaise: number;
  razorpayPaymentId: string;
}

export const paymentsService = {
  async createForOrder(orderId: string, amountPaise: number, method: PaymentMethod) {
    const razorpayOrder = await razorpayClient.orders.create({
      amount: amountPaise,
      currency: 'INR',
      receipt: orderId,
    });

    await paymentsRepository.create({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amountPaise,
      method,
      status: PaymentStatus.PENDING,
    });

    return { razorpayOrderId: razorpayOrder.id, amountPaise, currency: 'INR', keyId: config.razorpay.keyId };
  },

  async recordCodPayment(orderId: string, amountPaise: number) {
    return paymentsRepository.create({ orderId, amountPaise, method: PaymentMethod.COD, status: PaymentStatus.PENDING });
  },

  /** Verifies the HMAC signature per Razorpay's documented scheme (non-negotiable per CLAUDE.md §14) before trusting any webhook payload. */
  async verifyAndHandleWebhook(rawBody: string, signature: string | undefined): Promise<WebhookOutcome | null> {
    if (!signature || !Razorpay.validateWebhookSignature(rawBody, signature, config.razorpay.webhookSecret)) {
      throw new UnauthorizedError('Invalid webhook signature');
    }

    const event: RazorpayWebhookPayload = JSON.parse(rawBody);
    const paymentEntity = event.payload.payment?.entity;
    if (!paymentEntity) return null;

    const payment = await paymentsRepository.findByRazorpayOrderId(paymentEntity.order_id);
    if (!payment) {
      logger.warn('Webhook received for unknown razorpayOrderId', { razorpayOrderId: paymentEntity.order_id });
      return null;
    }

    const alreadyProcessed = await paymentsRepository.hasProcessedEvent(payment._id.toString(), event.id);
    if (alreadyProcessed) return null;

    if (event.event === 'payment.captured') {
      await paymentsRepository.markCaptured(payment._id.toString(), paymentEntity.id, event.id);
      return { orderId: payment.orderId.toString(), status: 'CAPTURED', amountPaise: paymentEntity.amount, razorpayPaymentId: paymentEntity.id };
    }

    if (event.event === 'payment.failed') {
      await paymentsRepository.markFailed(payment._id.toString(), paymentEntity.error_description ?? 'Payment failed', event.id);
      return { orderId: payment.orderId.toString(), status: 'FAILED', amountPaise: paymentEntity.amount, razorpayPaymentId: paymentEntity.id };
    }

    return null;
  },

  async getStatus(orderId: string) {
    const payment = await paymentsRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundError('Payment not found for this order');
    return payment;
  },

  async refund(orderId: string, amountPaise: number, reason: string) {
    const payment = await paymentsRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundError('Payment not found for this order');
    if (!payment.razorpayPaymentId) throw new BadRequestError('No captured payment to refund for this order');

    const refund = await razorpayClient.payments.refund(payment.razorpayPaymentId, { amount: amountPaise, notes: { reason } });

    const alreadyRefunded = payment.refunds.reduce((sum, r) => sum + r.amountPaise, 0) + amountPaise;
    const newStatus = alreadyRefunded >= payment.amountPaise ? PaymentStatus.REFUNDED : PaymentStatus.PARTIAL_REFUND;

    return paymentsRepository.addRefund(
      payment._id.toString(),
      { refundId: refund.id, amountPaise, reason, status: 'PROCESSED', processedAt: new Date() },
      newStatus,
    );
  },
};
