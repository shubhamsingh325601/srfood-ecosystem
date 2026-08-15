import { getModel } from '@/config/database';
import type { CouponDocument } from '@/models/Coupon.model';
import type { CouponUsageDocument } from '@/models/CouponUsage.model';

export const couponsRepository = {
  async listActive() {
    const Coupon = getModel<CouponDocument>('Coupon');
    const now = new Date();
    return Coupon.find({ isDeleted: false, isActive: true, validFrom: { $lte: now }, validUntil: { $gte: now } }).sort({
      createdAt: -1,
    });
  },

  async findByCode(code: string) {
    const Coupon = getModel<CouponDocument>('Coupon');
    return Coupon.findOne({ code: code.toUpperCase(), isDeleted: false });
  },

  async findById(id: string) {
    const Coupon = getModel<CouponDocument>('Coupon');
    return Coupon.findOne({ _id: id, isDeleted: false });
  },

  async countUsageByUser(couponId: string, userId: string) {
    const CouponUsage = getModel<CouponUsageDocument>('CouponUsage');
    return CouponUsage.countDocuments({ couponId, userId });
  },

  async recordUsage(couponId: string, userId: string, orderId: string, discountAppliedPaise: number) {
    const Coupon = getModel<CouponDocument>('Coupon');
    const CouponUsage = getModel<CouponUsageDocument>('CouponUsage');
    await Promise.all([
      CouponUsage.create({ couponId, userId, orderId, discountAppliedPaise }),
      Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } }),
    ]);
  },

  async create(data: Record<string, unknown>) {
    const Coupon = getModel<CouponDocument>('Coupon');
    return Coupon.create(data);
  },

  async update(id: string, data: Record<string, unknown>, updatedBy: string) {
    const Coupon = getModel<CouponDocument>('Coupon');
    return Coupon.findOneAndUpdate({ _id: id, isDeleted: false }, { ...data, updatedBy }, { new: true });
  },

  async softDelete(id: string, updatedBy: string) {
    const Coupon = getModel<CouponDocument>('Coupon');
    return Coupon.findOneAndUpdate({ _id: id, isDeleted: false }, { isDeleted: true, isActive: false, updatedBy }, { new: true });
  },

  async listAll(skip: number, limit: number) {
    const Coupon = getModel<CouponDocument>('Coupon');
    const [items, total] = await Promise.all([
      Coupon.find({ isDeleted: false }).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Coupon.countDocuments({ isDeleted: false }),
    ]);
    return { items, total };
  },
};