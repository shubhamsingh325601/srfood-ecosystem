import { z } from 'zod';

const MOBILE_REGEX = /^[6-9]\d{9}$/;

const passwordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(72, 'Password must be at most 72 characters');

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  mobile: z.string().trim().regex(MOBILE_REGEX, 'Mobile must be a valid 10-digit Indian number'),
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(200),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});
export type LogoutInput = z.infer<typeof logoutSchema>;
