import { z } from 'zod';

export const orderIdParamSchema = z.object({
  orderId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid order id'),
});

export const submitReferenceSchema = z.object({
  utr: z
    .string()
    .trim()
    .regex(/^[A-Za-z0-9]{4,40}$/, 'Invalid UPI transaction reference'),
});
export type SubmitReferenceInput = z.infer<typeof submitReferenceSchema>;
