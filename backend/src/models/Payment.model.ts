import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

import { PaymentMethod, PaymentStatus } from '@/types/domain.types';

export interface RefundRecord {
  refundId: string;
  amountPaise: number;
  reason: string;
  status: 'INITIATED' | 'PROCESSED' | 'FAILED';
  processedAt?: Date;
}

export interface PaymentDocument {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amountPaise: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  capturedAt?: Date;
  failureReason?: string;
  refunds: RefundRecord[];
  webhookEventIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<RefundRecord>(
  {
    refundId: { type: String, required: true },
    amountPaise: { type: Number, required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ['INITIATED', 'PROCESSED', 'FAILED'], required: true },
    processedAt: { type: Date },
  },
  { _id: false },
);

const paymentSchema = new Schema<PaymentDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    razorpayOrderId: { type: String, unique: true, sparse: true },
    razorpayPaymentId: { type: String, unique: true, sparse: true },
    razorpaySignature: { type: String },
    amountPaise: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    method: { type: String, enum: Object.values(PaymentMethod), required: true },
    status: { type: String, enum: Object.values(PaymentStatus), required: true, default: PaymentStatus.PENDING },
    capturedAt: { type: Date },
    failureReason: { type: String },
    refunds: { type: [refundSchema], default: [] },
    webhookEventIds: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const Payment = model<PaymentDocument>('Payment', paymentSchema);
