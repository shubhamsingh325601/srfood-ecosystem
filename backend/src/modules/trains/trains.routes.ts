import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';

import { trainsController } from './trains.controller';
import { pnrParamSchema, searchTrainsSchema, trainNumberParamSchema } from './trains.dto';

export const trainsRoutes = Router();

/**
 * @openapi
 * /trains/search:
 *   get:
 *     summary: Search trains by number or name
 *     tags: [Trains]
 */
trainsRoutes.get('/search', validate({ query: searchTrainsSchema }), trainsController.search);

/**
 * @openapi
 * /trains/pnr/{pnr}:
 *   get:
 *     summary: PNR status lookup
 *     tags: [Trains]
 *     security: [{ bearerAuth: [] }]
 */
trainsRoutes.get('/pnr/:pnr', requireAuth, validate({ params: pnrParamSchema }), trainsController.getPnrStatus);

/**
 * @openapi
 * /trains/{number}/stops:
 *   get:
 *     summary: Train stop schedule (24h cached)
 *     tags: [Trains]
 */
trainsRoutes.get('/:number/stops', validate({ params: trainNumberParamSchema }), trainsController.getStops);
