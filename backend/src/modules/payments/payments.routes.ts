import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';

import { paymentsController } from './payments.controller';
import { orderIdParamSchema, submitReferenceSchema } from './payments.dto';

export const paymentsRoutes = Router();

/**
 * @openapi
 * /payments/{orderId}/status:
 *   get:
 *     summary: Poll payment status for an order
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PaymentResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
paymentsRoutes.get('/:orderId/status', requireAuth, validate({ params: orderIdParamSchema }), paymentsController.getStatus);

/**
 * @openapi
 * /payments/{orderId}/reference:
 *   post:
 *     summary: Customer submits their UPI transaction reference (UTR) after paying via the direct UPI link — order is trusted and placed immediately, reconciled by admin afterward
 *     description: 'Trust model: no payment gateway confirms this. Submitting a UTR immediately moves the order to ORDER_PLACED / payment CAPTURED; admin reconciles UTRs against the bank statement afterward (see ADR 0003).'
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [utr]
 *             properties:
 *               utr: { type: string, pattern: '^[A-Za-z0-9]{4,40}$', example: 'UTR12345678901' }
 *     responses:
 *       '200':
 *         description: Payment recorded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/OrderResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '409':
 *         description: Payment for this order has already been resolved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
paymentsRoutes.post(
  '/:orderId/reference',
  requireAuth,
  validate({ params: orderIdParamSchema, body: submitReferenceSchema }),
  paymentsController.submitReference,
);

/**
 * @openapi
 * /payments/{orderId}/decline:
 *   post:
 *     summary: Customer reports the UPI payment failed or was cancelled — order moves to PAYMENT_FAILED so they can retry
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: Payment marked as not completed
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/OrderResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '409':
 *         description: Payment for this order has already been resolved
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
paymentsRoutes.post(
  '/:orderId/decline',
  requireAuth,
  validate({ params: orderIdParamSchema }),
  paymentsController.declinePayment,
);
