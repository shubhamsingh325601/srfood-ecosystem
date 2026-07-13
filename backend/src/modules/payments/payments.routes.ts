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
 */
paymentsRoutes.get('/:orderId/status', requireAuth, validate({ params: orderIdParamSchema }), paymentsController.getStatus);

/**
 * @openapi
 * /payments/{orderId}/reference:
 *   post:
 *     summary: Customer submits their UPI transaction reference (UTR) after paying via the direct UPI link — order is trusted and placed immediately, reconciled by admin afterward
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
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
 */
paymentsRoutes.post(
  '/:orderId/decline',
  requireAuth,
  validate({ params: orderIdParamSchema }),
  paymentsController.declinePayment,
);
