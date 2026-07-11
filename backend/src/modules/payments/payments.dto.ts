import { z } from 'zod';

export const orderIdParamSchema = z.object({
  orderId: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid order id'),
});
