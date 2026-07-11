import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

export const ratingIdParamSchema = z.object({ id: objectIdSchema });

export const createRatingSchema = z.object({
  orderId: objectIdSchema,
  menuItemId: objectIdSchema.optional(),
  rating: z.number().int().min(1).max(5),
  reviewText: z.string().trim().max(1000).optional(),
  photos: z.array(z.string().url()).max(5).optional(),
});
export type CreateRatingInput = z.infer<typeof createRatingSchema>;

export const updateRatingSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  reviewText: z.string().trim().max(1000).optional(),
});
export type UpdateRatingInput = z.infer<typeof updateRatingSchema>;

export const listRatingsSchema = z.object({
  menuItemId: objectIdSchema.optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});
export type ListRatingsInput = z.infer<typeof listRatingsSchema>;

export const moderateRatingSchema = z.object({
  isHidden: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});
export type ModerateRatingInput = z.infer<typeof moderateRatingSchema>;
