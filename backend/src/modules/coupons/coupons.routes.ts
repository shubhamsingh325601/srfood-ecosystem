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
 */
couponsRoutes.get('/', couponsController.listActive);

/**
 * @openapi
 * /coupons/validate:
 *   post:
 *     summary: Validate a coupon code against a cart
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
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
 */
adminCouponsRoutes.get('/', requireAuth, requireRole(...adminRoles), couponsController.listAll);

/**
 * @openapi
 * /admin/coupons:
 *   post:
 *     summary: Create a coupon (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
 */
adminCouponsRoutes.post('/', requireAuth, requireRole(...adminRoles), validate({ body: createCouponSchema }), couponsController.create);

/**
 * @openapi
 * /admin/coupons/{id}:
 *   put:
 *     summary: Update a coupon (admin)
 *     tags: [Coupons]
 *     security: [{ bearerAuth: [] }]
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
 */
adminCouponsRoutes.delete(
  '/:id',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: couponIdParamSchema }),
  couponsController.delete,
);
