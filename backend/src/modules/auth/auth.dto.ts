import { z } from 'zod';

const MOBILE_REGEX = /^[6-9]\d{9}$/;
const OTP_PURPOSES = ['REGISTER', 'LOGIN', 'FORGOT_PASSWORD', 'CHANGE_MOBILE', 'SENSITIVE_ACTION'] as const;

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters')
  .regex(/[a-zA-Z]/, 'Password must contain a letter')
  .regex(/[0-9]/, 'Password must contain a number');

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  mobile: z.string().trim().regex(MOBILE_REGEX, 'Mobile must be a valid 10-digit Indian number'),
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(200),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const sendOtpSchema = z.object({
  identifier: z.string().trim().min(3).max(200),
  purpose: z.enum(OTP_PURPOSES),
});
export type SendOtpInput = z.infer<typeof sendOtpSchema>;

export const verifyOtpSchema = z.object({
  identifier: z.string().trim().min(3).max(200),
  purpose: z.enum(OTP_PURPOSES),
  code: z.string().trim().length(6).regex(/^\d{6}$/),
});
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshInput = z.infer<typeof refreshSchema>;

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});
export type LogoutInput = z.infer<typeof logoutSchema>;

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(3).max(200),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  identifier: z.string().trim().min(3).max(200),
  code: z.string().trim().length(6).regex(/^\d{6}$/),
  newPassword: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
