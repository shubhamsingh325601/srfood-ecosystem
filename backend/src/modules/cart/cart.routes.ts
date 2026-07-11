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
 *     tags: [Cart]
 *     security: [{ bearerAuth: [] }]
 */
cartRoutes.post('/validate', requireAuth, validate({ body: validateCartSchema }), cartController.validate);
