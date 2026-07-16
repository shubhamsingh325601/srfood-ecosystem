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
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/DashboardSummaryResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
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
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *       - { in: query, name: entityType, schema: { type: string }, example: 'Coupon' }
 *       - { in: query, name: action, schema: { type: string }, example: 'COUPON_CREATED' }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/AuditLogListResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
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
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RoleCountsResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 */
adminRoutes.get('/roles', requireAuth, requireRole(UserRole.SUPER_ADMIN), adminController.listRoles);
