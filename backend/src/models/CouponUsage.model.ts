import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface CouponUsageDocument {
  _id: Types.ObjectId;
  couponId: Types.ObjectId;
  userId: Types.ObjectId;
  orderId: Types.ObjectId;
  discountAppliedPaise: number;
  createdAt: Date;
}

const couponUsageSchema = new Schema<CouponUsageDocument>(
  {
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    discountAppliedPaise: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'couponUsages' },
);

couponUsageSchema.index({ couponId: 1, userId: 1 });

export const CouponUsage = model<CouponUsageDocument>('CouponUsage', couponUsageSchema);
