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
 *     description: Generates and caches the invoice on first call (uploads the PDF and returns its URL in `pdfUrl`); subsequent calls return the same stored invoice record.
 *     tags: [Invoices]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: orderId, required: true, schema: { type: string }, description: Mongo _id or human-readable orderId }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/InvoiceResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
invoicesRoutes.get('/:orderId', requireAuth, validate({ params: invoiceOrderIdParamSchema }), invoicesController.getOrGenerate);
