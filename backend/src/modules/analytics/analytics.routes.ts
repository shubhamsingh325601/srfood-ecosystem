import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { analyticsController } from './analytics.controller';
import { dateRangeSchema } from './analytics.dto';

export const analyticsRoutes = Router();

const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

/**
 * @openapi
 * /admin/analytics/funnel:
 *   get:
 *     summary: Order funnel (placed to delivered/cancelled)
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 */
analyticsRoutes.get('/funnel', requireAuth, requireRole(...adminRoles), validate({ query: dateRangeSchema }), analyticsController.funnel);

/**
 * @openapi
 * /admin/analytics/revenue:
 *   get:
 *     summary: Daily revenue trend
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 */
analyticsRoutes.get('/revenue', requireAuth, requireRole(...adminRoles), validate({ query: dateRangeSchema }), analyticsController.revenueTrend);

/**
 * @openapi
 * /admin/analytics/stations:
 *   get:
 *     summary: Order volume by delivery station
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 */
analyticsRoutes.get('/stations', requireAuth, requireRole(...adminRoles), validate({ query: dateRangeSchema }), analyticsController.stationHeatmap);

/**
 * @openapi
 * /admin/analytics/payments:
 *   get:
 *     summary: Payment method/status breakdown
 *     tags: [Analytics]
 *     security: [{ bearerAuth: [] }]
 */
analyticsRoutes.get('/payments', requireAuth, requireRole(...adminRoles), validate({ query: dateRangeSchema }), analyticsController.paymentBreakdown);
