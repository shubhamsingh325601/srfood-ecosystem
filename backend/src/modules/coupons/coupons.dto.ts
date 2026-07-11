import { z } from 'zod';

import { CouponDiscountType } from '@/types/domain.types';

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

export const couponIdParamSchema = z.object({ id: objectIdSchema });

export const listCouponsSchema = z.object({
  active: z.coerce.boolean().optional(),
});
export type ListCouponsInput = z.infer<typeof listCouponsSchema>;

export const validateCouponSchema = z.object({
  code: z.string().trim().toUpperCase().min(1),
  subtotalPaise: z.number().int().positive(),
});
export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

export const createCouponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(30),
  description: z.string().trim().min(3).max(300),
  discountType: z.nativeEnum(CouponDiscountType),
  discountValue: z.number().positive(),
  maxDiscountPaise: z.number().int().positive().optional(),
  minOrderValuePaise: z.number().int().min(0).default(0),
  validFrom: z.coerce.date(),
  validUntil: z.coerce.date(),
  usageLimitTotal: z.number().int().positive().optional(),
  usageLimitPerUser: z.number().int().positive().default(1),
});
export type CreateCouponInput = z.infer<typeof createCouponSchema>;

export const updateCouponSchema = createCouponSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
