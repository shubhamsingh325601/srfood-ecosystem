import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';

import { cartController } from './cart.controller';
import { validateCartSchema } from './cart.dto';

export const cartRoutes = Router();

/**
 * @openapi
 * /cart/validate:
 *   post:
 *     summary: Server-side price/availability re-check for the client cart
 *     description: Recomputes prices, applies the coupon (if any), and drops/repriced items that changed since the client last fetched the menu. Always trust this response over client-held totals.
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items]
 *             properties:
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [menuItemId, quantity]
 *                   properties:
 *                     menuItemId: { type: string, pattern: '^[a-f0-9]{24}$' }
 *                     quantity: { type: integer, minimum: 1, maximum: 20 }
 *                     customizations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         required: [groupName, optionLabel]
 *                         properties:
 *                           groupName: { type: string }
 *                           optionLabel: { type: string }
 *                     specialNote: { type: string, maxLength: 300 }
 *               couponCode: { type: string, example: 'WELCOME50' }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ValidatedCartResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404':
 *         description: A menu item in the cart no longer exists
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
cartRoutes.post('/validate', requireAuth, validate({ body: validateCartSchema }), cartController.validate);
