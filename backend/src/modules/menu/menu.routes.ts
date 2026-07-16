import { Router } from 'express';

import { optionalAuth, requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { menuController } from './menu.controller';
import {
  categoryIdParamSchema,
  createCategorySchema,
  createMenuItemSchema,
  menuItemIdParamSchema,
  setAvailabilitySchema,
  updateCategorySchema,
  updateMenuItemSchema,
} from './menu.dto';

export const menuRoutes = Router();

const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

/**
 * @openapi
 * /menu/categories:
 *   get:
 *     summary: List menu categories
 *     tags: [Menu]
 *     security: []
 *     description: Optionally authenticated — admins additionally see inactive categories.
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CategoryListResponse' }
 */
menuRoutes.get('/categories', optionalAuth, menuController.listCategories);

/**
 * @openapi
 * /menu:
 *   get:
 *     summary: Full catalog — all categories and items (admins also see inactive/unavailable ones)
 *     tags: [Menu]
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/FullMenuResponse' }
 */
menuRoutes.get('/', optionalAuth, menuController.getFullMenu);

/**
 * @openapi
 * /menu/categories:
 *   post:
 *     summary: Create a category (admin)
 *     tags: [Menu]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 60, example: 'Meals' }
 *               slug: { type: string, pattern: '^[a-z0-9-]+$', example: 'meals' }
 *               description: { type: string, maxLength: 500 }
 *               imageUrl: { type: string, format: uri }
 *               icon: { type: string, maxLength: 10 }
 *               displayOrder: { type: integer }
 *     responses:
 *       '201':
 *         description: Category created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CategoryResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '409': { $ref: '#/components/responses/Conflict' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
menuRoutes.post(
  '/categories',
  requireAuth,
  requireRole(...adminRoles),
  validate({ body: createCategorySchema }),
  menuController.createCategory,
);

/**
 * @openapi
 * /menu/categories/{id}:
 *   patch:
 *     summary: Update a category (admin)
 *     tags: [Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 60 }
 *               slug: { type: string, pattern: '^[a-z0-9-]+$' }
 *               description: { type: string, maxLength: 500 }
 *               imageUrl: { type: string, format: uri }
 *               icon: { type: string, maxLength: 10 }
 *               displayOrder: { type: integer }
 *               isActive: { type: boolean }
 *     responses:
 *       '200':
 *         description: Category updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CategoryResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
menuRoutes.patch(
  '/categories/:id',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: categoryIdParamSchema, body: updateCategorySchema }),
  menuController.updateCategory,
);

/**
 * @openapi
 * /menu/categories/{id}:
 *   delete:
 *     summary: Soft-delete a category (admin)
 *     tags: [Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: Category deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NullDataResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
menuRoutes.delete(
  '/categories/:id',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: categoryIdParamSchema }),
  menuController.deleteCategory,
);

/**
 * @openapi
 * /menu/items/popular:
 *   get:
 *     summary: Popular/bestseller menu items for the homepage
 *     tags: [Menu]
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuItemListResponse' }
 */
menuRoutes.get('/items/popular', menuController.popularItems);

/**
 * @openapi
 * /menu/items/{id}:
 *   get:
 *     summary: Menu item detail
 *     tags: [Menu]
 *     security: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuItemResponse' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
menuRoutes.get('/items/:id', validate({ params: menuItemIdParamSchema }), menuController.getItem);

/**
 * @openapi
 * /menu/items:
 *   post:
 *     summary: Create a menu item (admin)
 *     tags: [Menu]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryId, name, price, isVeg]
 *             properties:
 *               categoryId: { type: string, pattern: '^[a-f0-9]{24}$' }
 *               name: { type: string, minLength: 2, maxLength: 120, example: 'Veg Thali' }
 *               shortDescription: { type: string, maxLength: 300 }
 *               description: { type: string, maxLength: 2000 }
 *               price: { type: integer, minimum: 100, maximum: 999900, description: 'Paise — min ₹1, max ₹9,999', example: 25000 }
 *               imageUrl: { type: string, format: uri }
 *               isVeg: { type: boolean }
 *               isBestseller: { type: boolean }
 *               ingredients: { type: array, items: { type: string } }
 *               isAvailable: { type: boolean }
 *               customizations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required: [name, options]
 *                   properties:
 *                     name: { type: string, minLength: 1, maxLength: 60, example: 'Spice level' }
 *                     isRequired: { type: boolean, default: false }
 *                     maxSelect: { type: integer, minimum: 1, default: 1 }
 *                     options:
 *                       type: array
 *                       minItems: 1
 *                       items:
 *                         type: object
 *                         required: [label, priceDeltaPaise]
 *                         properties:
 *                           label: { type: string, minLength: 1, maxLength: 60, example: 'Extra spicy' }
 *                           priceDeltaPaise: { type: integer, minimum: 0, example: 0 }
 *               prepTimeMinutes: { type: integer, minimum: 1, maximum: 180 }
 *     responses:
 *       '201':
 *         description: Menu item created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuItemResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
menuRoutes.post(
  '/items',
  requireAuth,
  requireRole(...adminRoles),
  validate({ body: createMenuItemSchema }),
  menuController.createItem,
);

/**
 * @openapi
 * /menu/items/{id}:
 *   patch:
 *     summary: Update a menu item (admin)
 *     tags: [Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId: { type: string, pattern: '^[a-f0-9]{24}$' }
 *               name: { type: string, minLength: 2, maxLength: 120 }
 *               shortDescription: { type: string, maxLength: 300 }
 *               description: { type: string, maxLength: 2000 }
 *               price: { type: integer, minimum: 100, maximum: 999900 }
 *               imageUrl: { type: string, format: uri }
 *               isVeg: { type: boolean }
 *               isBestseller: { type: boolean }
 *               ingredients: { type: array, items: { type: string } }
 *               isAvailable: { type: boolean }
 *               prepTimeMinutes: { type: integer, minimum: 1, maximum: 180 }
 *     responses:
 *       '200':
 *         description: Menu item updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuItemResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
menuRoutes.patch(
  '/items/:id',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: menuItemIdParamSchema, body: updateMenuItemSchema }),
  menuController.updateItem,
);

/**
 * @openapi
 * /menu/items/{id}/availability:
 *   patch:
 *     summary: Toggle out-of-stock state
 *     tags: [Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isAvailable]
 *             properties:
 *               isAvailable: { type: boolean }
 *     responses:
 *       '200':
 *         description: Availability updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MenuItemResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
menuRoutes.patch(
  '/items/:id/availability',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: menuItemIdParamSchema, body: setAvailabilitySchema }),
  menuController.setAvailability,
);

/**
 * @openapi
 * /menu/items/{id}:
 *   delete:
 *     summary: Soft-delete a menu item (admin)
 *     tags: [Menu]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: Menu item deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NullDataResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
menuRoutes.delete(
  '/items/:id',
  requireAuth,
  requireRole(...adminRoles),
  validate({ params: menuItemIdParamSchema }),
  menuController.deleteItem,
);
