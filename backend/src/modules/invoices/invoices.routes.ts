import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';

import { invoicesController } from './invoices.controller';
import { invoiceOrderIdParamSchema } from './invoices.dto';

export const invoicesRoutes = Router();

/**
 * @openapi
 * /invoices/{orderId}:
 *   get:
 *     summary: Get (or generate) the invoice PDF for an order
 *     tags: [Invoices]
 *     security: [{ bearerAuth: [] }]
 */
invoicesRoutes.get('/:orderId', requireAuth, validate({ params: invoiceOrderIdParamSchema }), invoicesController.getOrGenerate);
