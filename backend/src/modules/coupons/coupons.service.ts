import type { CouponDocument } from '@/models/Coupon.model';
import { CouponDiscountType } from '@/types/domain.types';
import { BadRequestError, NotFoundError } from '@/utils/errors';
import { buildPaginationMeta } from '@/utils/responseFormatter';

import type { CreateCouponInput, UpdateCouponInput } from './coupons.dto';
import { couponsRepository } from './coupons.repository';

export interface DiscountResult {
  discountPaise: number;
}

/** Pure computation reused by both `/coupons/validate` and Orders' server-side order creation — never trust a client-submitted discount amount. */
export function computeDiscount(coupon: Pick<CouponDocument, 'discountType' | 'discountValue' | 'maxDiscountPaise'>, subtotalPaise: number): number {
  if (coupon.discountType === CouponDiscountType.FLAT) {
    return Math.min(coupon.discountValue, subtotalPaise);
  }
  const raw = Math.round((subtotalPaise * coupon.discountValue) / 100);
  return coupon.maxDiscountPaise ? Math.min(raw, coupon.maxDiscountPaise) : raw;
}

async function assertUsable(coupon: CouponDocument, subtotalPaise: number, userId?: string): Promise<void> {
  const now = new Date();
  if (!coupon.isActive) throw new BadRequestError('This coupon is no longer active');
  if (coupon.validFrom > now || coupon.validUntil < now) throw new BadRequestError('This coupon has expired or is not yet valid');
  if (subtotalPaise < coupon.minOrderValuePaise) {
    throw new BadRequestError(`This coupon requires a minimum order value of ₹${coupon.minOrderValuePaise / 100}`);
  }
  if (coupon.usageLimitTotal && coupon.usedCount >= coupon.usageLimitTotal) {
    throw new BadRequestError('This coupon has reached its usage limit');
  }
  if (userId) {
    const usedByUser = await couponsRepository.countUsageByUser(coupon._id.toString(), userId);
    if (usedByUser >= coupon.usageLimitPerUser) {
      throw new BadRequestError('You have already used this coupon the maximum number of times');
    }
  }
}

export const couponsService = {
  async listActive() {
    return couponsRepository.listActive();
  },

  async validate(code: string, subtotalPaise: number, userId?: string): Promise<DiscountResult & { coupon: CouponDocument }> {
    const coupon = await couponsRepository.findByCode(code);
    if (!coupon) throw new NotFoundError('Coupon not found');
    await assertUsable(coupon, subtotalPaise, userId);
    return { discountPaise: computeDiscount(coupon, subtotalPaise), coupon };
  },

  async recordUsage(couponId: string, userId: string, orderId: string, discountAppliedPaise: number) {
    await couponsRepository.recordUsage(couponId, userId, orderId, discountAppliedPaise);
  },

  async listAll(page: number, limit: number) {
    const { items, total } = await couponsRepository.listAll((page - 1) * limit, limit);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async create(input: CreateCouponInput) {
    return couponsRepository.create(input);
  },

  async update(id: string, input: UpdateCouponInput, updatedBy: string) {
    const coupon = await couponsRepository.update(id, input, updatedBy);
    if (!coupon) throw new NotFoundError('Coupon not found');
    return coupon;
  },

  async delete(id: string, updatedBy: string) {
    const coupon = await couponsRepository.softDelete(id, updatedBy);
    if (!coupon) throw new NotFoundError('Coupon not found');
    return coupon;
  },
};
