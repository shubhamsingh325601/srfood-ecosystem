import { Router } from 'express';

import { optionalAuth, requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { stationsController } from './stations.controller';
import { createStationSchema, listStationsSchema, stationIdParamSchema, updateStationSchema } from './stations.dto';

const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

export const stationsRoutes = Router();

/**
 * @openapi
 * /stations:
 *   get:
 *     summary: List active stations (admins also see inactive ones)
 *     tags: [Stations]
 *     security: []
 *     parameters:
 *       - { in: query, name: q, schema: { type: string, maxLength: 100 }, description: Free-text name search }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StationListResponse' }
 */
stationsRoutes.get('/', optionalAuth, validate({ query: listStationsSchema }), stationsController.list);

export const adminStationsRoutes = Router();
adminStationsRoutes.use(requireAuth, requireRole(...adminRoles));

/**
 * @openapi
 * /admin/stations:
 *   post:
 *     summary: Create a station (admin)
 *     tags: [Stations]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: 'New Delhi' }
 *               code: { type: string, maxLength: 10, example: 'NDLS' }
 *     responses:
 *       '201':
 *         description: Station created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StationResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '409': { $ref: '#/components/responses/Conflict' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminStationsRoutes.post('/', validate({ body: createStationSchema }), stationsController.create);

/**
 * @openapi
 * /admin/stations/{id}:
 *   patch:
 *     summary: Update a station (admin)
 *     tags: [Stations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               code: { type: string, maxLength: 10 }
 *               isActive: { type: boolean }
 *     responses:
 *       '200':
 *         description: Station updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/StationResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminStationsRoutes.patch('/:id', validate({ params: stationIdParamSchema, body: updateStationSchema }), stationsController.update);

/**
 * @openapi
 * /admin/stations/{id}:
 *   delete:
 *     summary: Soft-delete a station (admin)
 *     tags: [Stations]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: Station deleted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NullDataResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
adminStationsRoutes.delete('/:id', validate({ params: stationIdParamSchema }), stationsController.delete);
