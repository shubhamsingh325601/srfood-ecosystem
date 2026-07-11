import { z } from 'zod';

export const dateRangeSchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
