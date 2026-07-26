import { z } from 'zod';

import { validateCartSchema } from '@/modules/cart/cart.dto';
import { OrderStatus, PaymentMethod } from '@/types/domain.types';


const SERVICEABLE_CITY = 'Kota';

export const deliveryAddressSchema = z
  .object({
    line: z.string().trim().min(5, 'Address must be at least 5 characters').max(200),
    landmark: z.string().trim().max(100).optional(),
    city: z.string().trim().max(60).default(SERVICEABLE_CITY),
    state: z.string().trim().max(60).default('Rajasthan'),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .refine((addr) => addr.city.toLowerCase() === SERVICEABLE_CITY.toLowerCase(), {
    message: `We currently deliver only in ${SERVICEABLE_CITY}`,
    path: ['city'],
  });

export const createOrderSchema = z.object({
  cart: validateCartSchema,
  paymentMethod: z.nativeEnum(PaymentMethod),
  customerName: z.string().trim().min(2, 'Name required').max(80),
  customerMobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, 'Valid mobile number required'),
  deliveryAddress: deliveryAddressSchema,
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

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

export const markPaidSchema = z.object({
  utrReference: z.string().trim().max(50).optional(),
});
export type MarkPaidInput = z.infer<typeof markPaidSchema>;

export const listAdminOrdersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  passengerId: z.string().trim().min(1).optional(),
});
export type ListAdminOrdersInput = z.infer<typeof listAdminOrdersSchema>;
