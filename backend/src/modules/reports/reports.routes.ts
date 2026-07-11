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
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 */
reportsRoutes.get(
  '/:type',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: reportTypeParamSchema, query: reportQuerySchema }),
  reportsController.generate,
);
