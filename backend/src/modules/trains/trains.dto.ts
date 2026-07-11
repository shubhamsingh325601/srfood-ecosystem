import { z } from 'zod';

export const searchTrainsSchema = z.object({
  query: z.string().trim().min(2).max(60),
});
export type SearchTrainsInput = z.infer<typeof searchTrainsSchema>;

export const pnrParamSchema = z.object({
  pnr: z.string().trim().regex(/^\d{10}$/, 'PNR must be exactly 10 digits'),
});

export const trainNumberParamSchema = z.object({
  number: z.string().trim().regex(/^\d{4,5}$/, 'Train number must be 4-5 digits'),
});
