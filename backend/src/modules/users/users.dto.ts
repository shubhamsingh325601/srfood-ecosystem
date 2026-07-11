import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .regex(/[a-zA-Z]/)
  .regex(/[0-9]/);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
});
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const changeMobileSchema = z.object({
  newMobile: z.string().trim().regex(/^[6-9]\d{9}$/),
  otpCode: z.string().trim().length(6).regex(/^\d{6}$/),
});
export type ChangeMobileInput = z.infer<typeof changeMobileSchema>;

export const updatePreferencesSchema = z.object({
  dietaryTags: z.array(z.string().trim()).optional(),
  cuisinePreferences: z.array(z.string().trim()).optional(),
});
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;

export const updateNotificationSettingsSchema = z.object({
  smsEnabled: z.boolean().optional(),
  emailEnabled: z.boolean().optional(),
  promotionalEnabled: z.boolean().optional(),
});
export type UpdateNotificationSettingsInput = z.infer<typeof updateNotificationSettingsSchema>;

export const deleteAccountSchema = z.object({
  otpCode: z.string().trim().length(6).regex(/^\d{6}$/),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const userIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i),
});

export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().optional(),
});
export type ListUsersInput = z.infer<typeof listUsersSchema>;
