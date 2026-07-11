import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { adminController } from './admin.controller';
import { listAuditLogsSchema } from './admin.dto';

export const adminRoutes = Router();

/**
 * @openapi
 * /admin/dashboard/summary:
 *   get:
 *     summary: Admin dashboard stat tiles + recent orders
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
adminRoutes.get(
  '/dashboard/summary',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  adminController.dashboardSummary,
);

/**
 * @openapi
 * /admin/audit-logs:
 *   get:
 *     summary: Immutable audit log viewer
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
adminRoutes.get(
  '/audit-logs',
  requireAuth,
  requireRole(UserRole.SUPER_ADMIN),
  validate({ query: listAuditLogsSchema }),
  adminController.listAuditLogs,
);

/**
 * @openapi
 * /admin/roles:
 *   get:
 *     summary: Role list with user counts
 *     tags: [Admin]
 *     security: [{ bearerAuth: [] }]
 */
adminRoutes.get('/roles', requireAuth, requireRole(UserRole.SUPER_ADMIN), adminController.listRoles);
