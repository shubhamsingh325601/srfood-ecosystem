import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { ratingsController } from './ratings.controller';
import { createRatingSchema, listRatingsSchema, moderateRatingSchema, ratingIdParamSchema, updateRatingSchema } from './ratings.dto';

export const ratingsRoutes = Router();

/**
 * @openapi
 * /ratings:
 *   get:
 *     summary: List ratings (filter by menuItem/featured)
 *     tags: [Ratings]
 */
ratingsRoutes.get('/', validate({ query: listRatingsSchema }), ratingsController.list);

/**
 * @openapi
 * /ratings:
 *   post:
 *     summary: Submit a rating for a delivered order
 *     tags: [Ratings]
 *     security: [{ bearerAuth: [] }]
 */
ratingsRoutes.post('/', requireAuth, validate({ body: createRatingSchema }), ratingsController.create);

/**
 * @openapi
 * /ratings/{id}:
 *   patch:
 *     summary: Edit own rating within the 48h edit window
 *     tags: [Ratings]
 *     security: [{ bearerAuth: [] }]
 */
ratingsRoutes.patch('/:id', requireAuth, validate({ params: ratingIdParamSchema, body: updateRatingSchema }), ratingsController.update);

/**
 * @openapi
 * /ratings/{id}/moderate:
 *   patch:
 *     summary: Flag/hide/feature a rating (admin)
 *     tags: [Ratings]
 *     security: [{ bearerAuth: [] }]
 */
ratingsRoutes.patch(
  '/:id/moderate',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ params: ratingIdParamSchema, body: moderateRatingSchema }),
  ratingsController.moderate,
);

export const adminRatingsRoutes = Router();

/**
 * @openapi
 * /admin/ratings:
 *   get:
 *     summary: List all ratings including hidden ones (admin)
 *     tags: [Ratings]
 *     security: [{ bearerAuth: [] }]
 */
adminRatingsRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ query: listRatingsSchema }),
  ratingsController.listAllForAdmin,
);
