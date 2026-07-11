import { z } from 'zod';

export const reportTypeParamSchema = z.object({
  type: z.enum(['orders', 'revenue', 'users']),
});
export type ReportType = z.infer<typeof reportTypeParamSchema>['type'];

export const reportQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type ReportQueryInput = z.infer<typeof reportQuerySchema>;
