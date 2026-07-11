import { z } from 'zod';

export const notificationIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id'),
});

export const listNotificationsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  unreadOnly: z.coerce.boolean().optional(),
});
export type ListNotificationsInput = z.infer<typeof listNotificationsSchema>;
