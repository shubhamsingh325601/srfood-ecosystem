import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

const customizationSelectionSchema = z.object({
  groupName: z.string().trim().min(1),
  optionLabel: z.string().trim().min(1),
});

const cartItemSchema = z.object({
  menuItemId: objectIdSchema,
  quantity: z.number().int().min(1).max(20),
  customizations: z.array(customizationSelectionSchema).default([]),
  specialNote: z.string().trim().max(300).optional(),
});

export const validateCartSchema = z.object({
  items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
  couponCode: z.string().trim().toUpperCase().optional(),
});
export type ValidateCartInput = z.infer<typeof validateCartSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
