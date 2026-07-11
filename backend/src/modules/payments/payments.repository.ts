import { Payment } from '@/models/Payment.model';
import type { PaymentMethod, PaymentStatus } from '@/types/domain.types';

export const paymentsRepository = {
  async create(data: { orderId: string; razorpayOrderId?: string; amountPaise: number; method: PaymentMethod; status: PaymentStatus }) {
    return Payment.create(data);
  },

  async findByOrderId(orderId: string) {
    return Payment.findOne({ orderId });
  },

  async findByRazorpayOrderId(razorpayOrderId: string) {
    return Payment.findOne({ razorpayOrderId });
  },

  async hasProcessedEvent(paymentId: string, eventId: string) {
    return Payment.exists({ _id: paymentId, webhookEventIds: eventId });
  },

  async markCaptured(paymentId: string, razorpayPaymentId: string, eventId: string) {
    return Payment.findByIdAndUpdate(
      paymentId,
      {
        status: 'captured',
        razorpayPaymentId,
        capturedAt: new Date(),
        $addToSet: { webhookEventIds: eventId },
      },
      { new: true },
    );
  },

  async markFailed(paymentId: string, failureReason: string, eventId: string) {
    return Payment.findByIdAndUpdate(
      paymentId,
      { status: 'failed', failureReason, $addToSet: { webhookEventIds: eventId } },
      { new: true },
    );
  },

  async addRefund(
    paymentId: string,
    refund: { refundId: string; amountPaise: number; reason: string; status: 'INITIATED' | 'PROCESSED' | 'FAILED'; processedAt?: Date },
    newStatus: PaymentStatus,
  ) {
    return Payment.findByIdAndUpdate(paymentId, { $push: { refunds: refund }, status: newStatus }, { new: true });
  },
};
