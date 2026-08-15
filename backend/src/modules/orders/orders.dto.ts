import { z } from 'zod';

import { getCurrentAppFeatures } from '@/config/dbContext';
import { validateCartSchema } from '@/modules/cart/cart.dto';
import { OrderStatus, PaymentMethod } from '@/types/domain.types';

/** Built per-request (not module load) since trains/upiPayments availability depends on the requesting app (X-App-ID). */
export function buildCreateOrderSchema(features: { trains: boolean; upiPayments: boolean } = getCurrentAppFeatures()) {
  return z.object({
    cart: validateCartSchema,
    paymentMethod: features.upiPayments ? z.nativeEnum(PaymentMethod) : z.nativeEnum(PaymentMethod).default(PaymentMethod.COD),
    ...(features.trains
      ? {
          pnr: z.string().trim().regex(/^\d{10}$/, 'PNR must be exactly 10 digits').optional(),
          coach: z.string().trim().max(6).optional(),
          seat: z.string().trim().max(4).optional(),
          trainNumber: z.string().trim().regex(/^\d{4,5}$/).optional(),
          boardingStation: z.string().trim().max(60).optional(),
          deliveryStation: z.string().trim().min(2).max(60),
        }
      : {
          deliveryStation: z.string().trim().min(2).max(60),
          address: z.string().trim().min(5).max(300).optional(),
          landmark: z.string().trim().max(100).optional(),
        }),
  });
}

export type CreateOrderInput = {
  cart: import('@/modules/cart/cart.dto').ValidateCartInput;
  paymentMethod: PaymentMethod;
  deliveryStation: string;
  pnr?: string;
  coach?: string;
  seat?: string;
  trainNumber?: string;
  boardingStation?: string;
  address?: string;
  landmark?: string;
};

export const orderIdParamSchema = z.object({
  id: z.string().trim().min(1),
});

export const listOrdersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});
export type ListOrdersInput = z.infer<typeof listOrdersSchema>;

export const cancelOrderSchema = z.object({
  reason: z.string().trim().min(3).max(300),
});
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  note: z.string().trim().max(300).optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export const listAdminOrdersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  passengerId: z.string().trim().min(1).optional(),
});
export type ListAdminOrdersInput = z.infer<typeof listAdminOrdersSchema>;
