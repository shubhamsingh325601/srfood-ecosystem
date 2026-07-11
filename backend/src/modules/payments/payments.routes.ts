import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';

import { paymentsController } from './payments.controller';
import { orderIdParamSchema } from './payments.dto';

export const paymentsRoutes = Router();

/**
 * @openapi
 * /payments/webhook:
 *   post:
 *     summary: Razorpay webhook (HMAC-verified)
 *     tags: [Payments]
 */
paymentsRoutes.post('/webhook', paymentsController.webhook);

/**
 * @openapi
 * /payments/{orderId}/status:
 *   get:
 *     summary: Poll payment status for an order
 *     tags: [Payments]
 *     security: [{ bearerAuth: [] }]
 */
paymentsRoutes.get('/:orderId/status', requireAuth, validate({ params: orderIdParamSchema }), paymentsController.getStatus);
