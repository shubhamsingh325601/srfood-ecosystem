import { z } from 'zod';

export const listAuditLogsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  entityType: z.string().trim().optional(),
  action: z.string().trim().optional(),
});
export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>;

export const updateUserRoleSchema = z.object({
  role: z.enum(['PASSENGER', 'SUPPORT_EXEC', 'ADMIN', 'SUPER_ADMIN']),
});
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
