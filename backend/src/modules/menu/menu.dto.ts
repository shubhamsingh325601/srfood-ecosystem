import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

export const categoryIdParamSchema = z.object({ id: objectIdSchema });
export const menuItemIdParamSchema = z.object({ id: objectIdSchema });

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(60),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(500).optional(),
  imageUrl: z.string().url().optional(),
  icon: z.string().trim().max(10).optional(),
  displayOrder: z.number().int().optional(),
});
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

const customizationOptionSchema = z.object({
  label: z.string().trim().min(1).max(60),
  priceDeltaPaise: z.number().int().min(0),
});

const customizationGroupSchema = z.object({
  name: z.string().trim().min(1).max(60),
  isRequired: z.boolean().default(false),
  maxSelect: z.number().int().min(1).default(1),
  options: z.array(customizationOptionSchema).min(1),
});

export const createMenuItemSchema = z.object({
  categoryId: objectIdSchema,
  name: z.string().trim().min(2).max(120),
  shortDescription: z.string().trim().max(300).optional(),
  description: z.string().trim().max(2000).optional(),
  price: z.number().int().min(100, 'Price must be at least ₹1').max(999900, 'Price must be at most ₹9,999'),
  imageUrl: z.string().url().optional(),
  isVeg: z.boolean(),
  isBestseller: z.boolean().optional(),
  ingredients: z.array(z.string().trim()).optional(),
  isAvailable: z.boolean().optional(),
  customizations: z.array(customizationGroupSchema).optional(),
  prepTimeMinutes: z.number().int().min(1).max(180).optional(),
});
export type CreateMenuItemInput = z.infer<typeof createMenuItemSchema>;

export const updateMenuItemSchema = createMenuItemSchema.partial();
export type UpdateMenuItemInput = z.infer<typeof updateMenuItemSchema>;

export const setAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
});
export type SetAvailabilityInput = z.infer<typeof setAvailabilitySchema>;
