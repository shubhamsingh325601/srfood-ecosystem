import { randomUUID } from 'crypto';

import { config } from '@/config/index';
import { PaymentMethod, PaymentStatus } from '@/types/domain.types';
import { BadRequestError, ConflictError, NotFoundError } from '@/utils/errors';

import { paymentsRepository } from './payments.repository';
import { buildUpiLink } from './upi.util';

export const paymentsService = {
  async createForOrder(orderId: string, amountPaise: number, method: PaymentMethod) {
    const transactionRef = orderId;
    const upiLink = buildUpiLink({
      vpa: config.upi.vpa,
      payeeName: config.upi.payeeName,
      amountPaise,
      transactionRef,
      note: `SR Food order ${orderId}`,
    });

    await paymentsRepository.create({ orderId, transactionRef, amountPaise, method, status: PaymentStatus.PENDING });

    return {
      upiLink,
      payeeVpa: config.upi.vpa,
      payeeName: config.upi.payeeName,
      amountPaise,
      currency: 'INR',
      transactionRef,
    };
  },

  async recordCodPayment(orderId: string, amountPaise: number) {
    return paymentsRepository.create({ orderId, amountPaise, method: PaymentMethod.COD, status: PaymentStatus.PENDING });
  },

  /** Self-reported by the customer after paying via their UPI app — no gateway confirms this, so the caller (payments.controller) still moves the order forward on trust, per the product's trust-first-verify-after model (ADR 0003). */
  async recordSelfReportedPayment(orderId: string, utr: string) {
    const payment = await paymentsRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundError('Payment not found for this order');
    if (payment.status !== PaymentStatus.PENDING) throw new ConflictError('Payment for this order has already been resolved');

    return paymentsRepository.markCaptured(payment._id.toString(), utr);
  },

  /** Self-reported by the customer when they cancelled or the UPI app declined the payment — no gateway to confirm this either, so we just take their word for it and free the order up to retry. */
  async declinePayment(orderId: string) {
    const payment = await paymentsRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundError('Payment not found for this order');
    if (payment.status !== PaymentStatus.PENDING) throw new ConflictError('Payment for this order has already been resolved');

    return paymentsRepository.markFailed(payment._id.toString(), 'Customer reported payment as failed/cancelled');
  },

  async getStatus(orderId: string) {
    const payment = await paymentsRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundError('Payment not found for this order');
    return payment;
  },

  /** No gateway to call for a refund — records the intent; the actual UPI transfer back is done manually by admin outside the system. */
  async refund(orderId: string, amountPaise: number, reason: string) {
    const payment = await paymentsRepository.findByOrderId(orderId);
    if (!payment) throw new NotFoundError('Payment not found for this order');
    if (payment.status !== PaymentStatus.CAPTURED) throw new BadRequestError('No captured payment to refund for this order');

    const alreadyRefunded = payment.refunds.reduce((sum, r) => sum + r.amountPaise, 0) + amountPaise;
    const newStatus = alreadyRefunded >= payment.amountPaise ? PaymentStatus.REFUNDED : PaymentStatus.PARTIAL_REFUND;

    return paymentsRepository.addRefund(
      payment._id.toString(),
      { refundId: randomUUID(), amountPaise, reason, status: 'INITIATED' },
      newStatus,
    );
  },
};
