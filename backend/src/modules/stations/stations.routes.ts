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
 */
adminStationsRoutes.post('/', validate({ body: createStationSchema }), stationsController.create);

/**
 * @openapi
 * /admin/stations/{id}:
 *   patch:
 *     summary: Update a station (admin)
 *     tags: [Stations]
 *     security: [{ bearerAuth: [] }]
 */
adminStationsRoutes.patch(
  '/:id',
  validate({ params: stationIdParamSchema, body: updateStationSchema }),
  stationsController.update,
);

/**
 * @openapi
 * /admin/stations/{id}:
 *   delete:
 *     summary: Soft-delete a station (admin)
 *     tags: [Stations]
 *     security: [{ bearerAuth: [] }]
 */
adminStationsRoutes.delete('/:id', validate({ params: stationIdParamSchema }), stationsController.delete);
