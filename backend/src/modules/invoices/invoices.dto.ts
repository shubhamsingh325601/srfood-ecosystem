import { z } from 'zod';

export const invoiceOrderIdParamSchema = z.object({
  orderId: z.string().trim().min(1),
});
