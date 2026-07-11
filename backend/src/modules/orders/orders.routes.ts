import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { ordersController } from './orders.controller';
import {
  cancelOrderSchema,
  createOrderSchema,
  listAdminOrdersSchema,
  listOrdersSchema,
  orderIdParamSchema,
  updateOrderStatusSchema,
} from './orders.dto';

export const ordersRoutes = Router();

/**
 * @openapi
 * /orders:
 *   post:
 *     summary: Create an order (idempotent via Idempotency-Key header)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
ordersRoutes.post('/', requireAuth, validate({ body: createOrderSchema }), ordersController.create);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: List the authenticated passenger's own orders
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
ordersRoutes.get('/', requireAuth, validate({ query: listOrdersSchema }), ordersController.list);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Order detail (own order, or admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
ordersRoutes.get('/:id', requireAuth, validate({ params: orderIdParamSchema }), ordersController.getDetail);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancel own order (pre-acceptance only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
ordersRoutes.post(
  '/:id/cancel',
  requireAuth,
  validate({ params: orderIdParamSchema, body: cancelOrderSchema }),
  ordersController.cancel,
);

/**
 * @openapi
 * /orders/{id}/reorder:
 *   post:
 *     summary: Re-validate a past order's items for a new cart
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
ordersRoutes.post('/:id/reorder', requireAuth, validate({ params: orderIdParamSchema }), ordersController.reorder);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     summary: Progress an order's status (admin, state-machine enforced)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
ordersRoutes.patch(
  '/:id/status',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: orderIdParamSchema, body: updateOrderStatusSchema }),
  ordersController.updateStatus,
);

export const adminOrdersRoutes = Router();

/**
 * @openapi
 * /admin/orders:
 *   get:
 *     summary: List all orders (admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 */
adminOrdersRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ query: listAdminOrdersSchema }),
  ordersController.listAdmin,
);
