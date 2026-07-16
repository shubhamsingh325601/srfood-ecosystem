import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { reportsController } from './reports.controller';
import { reportQuerySchema, reportTypeParamSchema } from './reports.dto';

export const reportsRoutes = Router();

/**
 * @openapi
 * /admin/reports/{type}:
 *   get:
 *     summary: Generate an operational report (orders/revenue/users)
 *     description: 'Response shape depends on `type`: orders → OrdersReportResponse (capped at 1000 rows), revenue → RevenueReportResponse (daily totals), users → UsersReportResponse (daily signups).'
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: type, required: true, schema: { type: string, enum: [orders, revenue, users] } }
 *       - { in: query, name: from, schema: { type: string, format: date-time } }
 *       - { in: query, name: to, schema: { type: string, format: date-time } }
 *     responses:
 *       '200':
 *         description: OK — see description for the shape that corresponds to `type`
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - { $ref: '#/components/schemas/OrdersReportResponse' }
 *                 - { $ref: '#/components/schemas/RevenueReportResponse' }
 *                 - { $ref: '#/components/schemas/UsersReportResponse' }
 *       '400':
 *         description: Unknown report type
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
reportsRoutes.get(
  '/:type',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: reportTypeParamSchema, query: reportQuerySchema }),
  reportsController.generate,
);
