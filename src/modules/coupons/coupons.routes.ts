import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { couponsController } from './coupons.controller';
import { couponIdParamSchema, createCouponSchema, updateCouponSchema, validateCouponSchema } from './coupons.dto';

export const couponsRoutes = Router();

const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

/**
 * @openapi
 * /coupons:
 *   get:
 *     summary: List currently-active coupons
 *     tags: [Coupons]
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CouponListResponse' }
 */
couponsRoutes.get('/', couponsController.listActive);

/**
 * @openapi
 * /coupons/validate:
 *   post:
 *     summary: Validate a coupon code against a cart
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, subtotalPaise]
 *             properties:
 *               code: { type: string, example: 'WELCOME50' }
 *               subtotalPaise: { type: integer, minimum: 1, example: 30000 }
 *     responses:
 *       '200':
 *         description: Coupon is valid — computed discount for this subtotal
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CouponValidationResponse' }
 *       '400':
 *         description: Coupon not applicable (expired, below minimum order value, usage limit reached, etc.)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
couponsRoutes.post('/validate', requireAuth, validate({ body: validateCouponSchema }), couponsController.validate);

export const adminCouponsRoutes = Router();

/**
 * @openapi
 * /admin/coupons:
 *   get:
 *     summary: List all coupons (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CouponAdminListResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 */
adminCouponsRoutes.get('/', requireAuth, requireRole(...adminRoles), couponsController.listAll);

/**
 * @openapi
 * /admin/coupons:
 *   post:
 *     summary: Create a coupon (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code, description, discountType, discountValue, validFrom, validUntil]
 *             properties:
 *               code: { type: string, minLength: 3, maxLength: 30, example: 'WELCOME50' }
 *               description: { type: string, minLength: 3, maxLength: 300, example: 'Flat 50% off, up to ₹100, on your first order' }
 *               discountType: { type: string, enum: [PERCENTAGE, FLAT] }
 *               discountValue: { type: number, minimum: 0, exclusiveMinimum: true, example: 50 }
 *               maxDiscountPaise: { type: integer, minimum: 1 }
 *               minOrderValuePaise: { type: integer, minimum: 0, default: 0 }
 *               validFrom: { type: string, format: date-time }
 *               validUntil: { type: string, format: date-time }
 *               usageLimitTotal: { type: integer, minimum: 1 }
 *               usageLimitPerUser: { type: integer, minimum: 1, default: 1 }
 *     responses:
 *       '201':
 *         description: Coupon created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CouponResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '409': { $ref: '#/components/responses/Conflict' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminCouponsRoutes.post('/', requireAuth, requireRole(...adminRoles), validate({ body: createCouponSchema }), couponsController.create);

/**
 * @openapi
 * /admin/coupons/{id}:
 *   put:
 *     summary: Update a coupon (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code: { type: string, minLength: 3, maxLength: 30 }
 *               description: { type: string, minLength: 3, maxLength: 300 }
 *               discountType: { type: string, enum: [PERCENTAGE, FLAT] }
 *               discountValue: { type: number, minimum: 0, exclusiveMinimum: true }
 *               maxDiscountPaise: { type: integer, minimum: 1 }
 *               minOrderValuePaise: { type: integer, minimum: 0 }
 *               validFrom: { type: string, format: date-time }
 *               validUntil: { type: string, format: date-time }
 *               usageLimitTotal: { type: integer, minimum: 1 }
 *               usageLimitPerUser: { type: integer, minimum: 1 }
 *               isActive: { type: boolean }
 *     responses:
 *       '200':
 *         description: Coupon updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CouponResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminCouponsRoutes.put(
  '/:id',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: couponIdParamSchema, body: updateCouponSchema }),
  couponsController.update,
);

/**
 * @openapi
 * /admin/coupons/{id}:
 *   delete:
 *     summary: Delete a coupon (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: Coupon deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NullDataResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
adminCouponsRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: couponIdParamSchema }),
  couponsController.delete,
);
