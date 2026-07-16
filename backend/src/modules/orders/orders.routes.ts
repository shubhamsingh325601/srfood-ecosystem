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
 *     description: For UPI orders, the response's `data.payment.upiLink` is a backend-generated deep link — no gateway is involved (see ADR 0003). Replaying the same Idempotency-Key returns the original order with `data.replay = true` and HTTP 200 instead of 201.
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         required: true
 *         schema: { type: string }
 *         description: Client-generated unique key (e.g. a UUID) — required to prevent double-submission.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cart, paymentMethod, deliveryStation]
 *             properties:
 *               cart:
 *                 type: object
 *                 required: [items]
 *                 properties:
 *                   items:
 *                     type: array
 *                     minItems: 1
 *                     items:
 *                       type: object
 *                       required: [menuItemId, quantity]
 *                       properties:
 *                         menuItemId: { type: string, pattern: '^[a-f0-9]{24}$' }
 *                         quantity: { type: integer, minimum: 1, maximum: 20 }
 *                         customizations:
 *                           type: array
 *                           items:
 *                             type: object
 *                             required: [groupName, optionLabel]
 *                             properties:
 *                               groupName: { type: string }
 *                               optionLabel: { type: string }
 *                         specialNote: { type: string, maxLength: 300 }
 *                   couponCode: { type: string, example: 'WELCOME50' }
 *               paymentMethod: { type: string, enum: [UPI, COD] }
 *               pnr: { type: string, pattern: '^\d{10}$', example: '1234567890' }
 *               coach: { type: string, maxLength: 6, example: 'B4' }
 *               seat: { type: string, maxLength: 4, example: '32' }
 *               trainNumber: { type: string, pattern: '^\d{4,5}$', example: '12345' }
 *               boardingStation: { type: string, maxLength: 60 }
 *               deliveryStation: { type: string, minLength: 2, maxLength: 60, example: 'NDLS' }
 *     responses:
 *       '201':
 *         description: Order placed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateOrderResponse' }
 *       '200':
 *         description: Idempotency-Key already used — original order returned
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CreateOrderResponse' }
 *       '400':
 *         description: Idempotency-Key header missing, or a business-rule violation (e.g. COD amount over the limit)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404':
 *         description: A menu item in the cart no longer exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
ordersRoutes.post('/', requireAuth, validate({ body: createOrderSchema }), ordersController.create);

/**
 * @openapi
 * /orders:
 *   get:
 *     summary: List the authenticated passenger's own orders
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/OrderStatus' } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/OrderListResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 */
ordersRoutes.get('/', requireAuth, validate({ query: listOrdersSchema }), ordersController.list);

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     summary: Order detail (own order, or admin)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: Mongo _id or human-readable orderId }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/OrderResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
ordersRoutes.get('/:id', requireAuth, validate({ params: orderIdParamSchema }), ordersController.getDetail);

/**
 * @openapi
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancel own order (pre-acceptance only)
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: Mongo _id or human-readable orderId }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason: { type: string, minLength: 3, maxLength: 300, example: 'Changed my mind' }
 *     responses:
 *       '200':
 *         description: Order cancelled
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/OrderResponse' }
 *       '400':
 *         description: Order is past the cancellable stage
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
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
 *     description: Rebuilds a cart from a previous order's items and re-runs price/availability validation — does not create a new order by itself.
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: Mongo _id or human-readable orderId }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidatedCartResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
ordersRoutes.post('/:id/reorder', requireAuth, validate({ params: orderIdParamSchema }), ordersController.reorder);

/**
 * @openapi
 * /orders/{id}/status:
 *   patch:
 *     summary: Progress an order's status (admin, state-machine enforced)
 *     description: Only forward transitions defined in the PRD §14 state machine are accepted — see ORDER_STATUS_TRANSITIONS in domain.types.ts.
 *     tags: [Orders]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string }, description: Mongo _id or human-readable orderId }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { $ref: '#/components/schemas/OrderStatus' }
 *               note: { type: string, maxLength: 300 }
 *     responses:
 *       '200':
 *         description: Order status updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/OrderResponse' }
 *       '400':
 *         description: Requested status is not a valid transition from the current status
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
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
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *       - { in: query, name: status, schema: { $ref: '#/components/schemas/OrderStatus' } }
 *       - { in: query, name: passengerId, schema: { type: string } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/OrderListResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 */
adminOrdersRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ query: listAdminOrdersSchema }),
  ordersController.listAdmin,
);
