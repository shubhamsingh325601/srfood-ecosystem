import { Payment } from '@/models/Payment.model';
import type { PaymentMethod, PaymentStatus } from '@/types/domain.types';

export const paymentsRepository = {
  async create(data: { orderId: string; transactionRef?: string; amountPaise: number; method: PaymentMethod; status: PaymentStatus }) {
    return Payment.create(data);
  },

  async findByOrderId(orderId: string) {
    return Payment.findOne({ orderId });
  },

  async markCaptured(paymentId: string, utrReference?: string) {
    return Payment.findByIdAndUpdate(
      paymentId,
      { status: 'captured', utrReference, capturedAt: new Date() },
      { new: true },
    );
  },

  async markFailed(paymentId: string, failureReason: string) {
    return Payment.findByIdAndUpdate(paymentId, { status: 'failed', failureReason }, { new: true });
  },

  async addRefund(
    paymentId: string,
    refund: { refundId: string; amountPaise: number; reason: string; status: 'INITIATED' | 'PROCESSED' | 'FAILED'; processedAt?: Date },
    newStatus: PaymentStatus,
  ) {
    return Payment.findByIdAndUpdate(paymentId, { $push: { refunds: refund }, status: newStatus }, { new: true });
  },
};
