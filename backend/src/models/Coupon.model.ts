import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

import { CouponDiscountType } from '@/types/domain.types';

export interface CouponDocument {
  _id: Types.ObjectId;
  code: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  maxDiscountPaise?: number;
  minOrderValuePaise: number;
  validFrom: Date;
  validUntil: Date;
  usageLimitTotal?: number;
  usageLimitPerUser: number;
  usedCount: number;
  isActive: boolean;
  isDeleted: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<CouponDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true },
    discountType: { type: String, enum: Object.values(CouponDiscountType), required: true },
    discountValue: { type: Number, required: true, min: 1 },
    maxDiscountPaise: { type: Number },
    minOrderValuePaise: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    usageLimitTotal: { type: Number },
    usageLimitPerUser: { type: Number, default: 1 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

export const Coupon = model<CouponDocument>('Coupon', couponSchema);
