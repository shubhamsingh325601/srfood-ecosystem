import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

export const stationIdParamSchema = z.object({ id: objectIdSchema });

export const listStationsSchema = z.object({
  q: z.string().trim().max(100).optional(),
});
export type ListStationsInput = z.infer<typeof listStationsSchema>;

export const createStationSchema = z.object({
  name: z.string().trim().min(2).max(100),
  code: z.string().trim().toUpperCase().max(10).optional(),
});
export type CreateStationInput = z.infer<typeof createStationSchema>;

export const updateStationSchema = createStationSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateStationInput = z.infer<typeof updateStationSchema>;
