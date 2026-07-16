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
 *     security: []
 *     parameters:
 *       - { in: query, name: menuItemId, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *       - { in: query, name: featured, schema: { type: boolean } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *     responses:
 *       '200':
 *         description: OK — hidden ratings are excluded
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RatingListResponse' }
 */
ratingsRoutes.get('/', validate({ query: listRatingsSchema }), ratingsController.list);

/**
 * @openapi
 * /ratings:
 *   post:
 *     summary: Submit a rating for a delivered order
 *     tags: [Ratings]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId, rating]
 *             properties:
 *               orderId: { type: string, pattern: '^[a-f0-9]{24}$' }
 *               menuItemId: { type: string, pattern: '^[a-f0-9]{24}$' }
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               reviewText: { type: string, maxLength: 1000 }
 *               photos: { type: array, items: { type: string, format: uri }, maxItems: 5 }
 *     responses:
 *       '201':
 *         description: Rating submitted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RatingResponse' }
 *       '400':
 *         description: Order is not eligible for rating yet (outside the post-delivery window)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '409':
 *         description: Already rated this order/item
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
ratingsRoutes.post('/', requireAuth, validate({ body: createRatingSchema }), ratingsController.create);

/**
 * @openapi
 * /ratings/{id}:
 *   patch:
 *     summary: Edit own rating within the 48h edit window
 *     tags: [Ratings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating: { type: integer, minimum: 1, maximum: 5 }
 *               reviewText: { type: string, maxLength: 1000 }
 *     responses:
 *       '200':
 *         description: Rating updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RatingResponse' }
 *       '400':
 *         description: Edit window (48h) has expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
ratingsRoutes.patch('/:id', requireAuth, validate({ params: ratingIdParamSchema, body: updateRatingSchema }), ratingsController.update);

/**
 * @openapi
 * /ratings/{id}/moderate:
 *   patch:
 *     summary: Flag/hide/feature a rating (admin)
 *     tags: [Ratings]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isHidden: { type: boolean }
 *               isFeatured: { type: boolean }
 *     responses:
 *       '200':
 *         description: Rating moderated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RatingResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
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
 *     parameters:
 *       - { in: query, name: menuItemId, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *       - { in: query, name: featured, schema: { type: boolean } }
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RatingListResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 */
adminRatingsRoutes.get(
  '/',
  requireAuth,
  requireRole(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate({ query: listRatingsSchema }),
  ratingsController.listAllForAdmin,
);
