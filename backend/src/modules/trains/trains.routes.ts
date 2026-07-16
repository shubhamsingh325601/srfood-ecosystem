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
 *     description: Vendor-backed (IRCTC/RailAPI) — see PRD Risk R-01. Returns 503 RAIL_VENDOR_UNAVAILABLE if the vendor call fails; the frontend should fall back to manual entry.
 *     tags: [Trains]
 *     security: []
 *     parameters:
 *       - { in: query, name: query, required: true, schema: { type: string, minLength: 2, maxLength: 60 }, example: 'Rajdhani' }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TrainSearchResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 *       '503':
 *         description: Live train data vendor is temporarily unavailable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
trainsRoutes.get('/search', validate({ query: searchTrainsSchema }), trainsController.search);

/**
 * @openapi
 * /trains/pnr/{pnr}:
 *   get:
 *     summary: PNR status lookup
 *     description: Vendor-backed (IRCTC/RailAPI) — see PRD Risk R-01. Returns 503 RAIL_VENDOR_UNAVAILABLE if the vendor call fails; the frontend should fall back to manual entry.
 *     tags: [Trains]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: pnr, required: true, schema: { type: string, pattern: '^\d{10}$' }, example: '1234567890' }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/PnrStatusResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 *       '503':
 *         description: Live train data vendor is temporarily unavailable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
trainsRoutes.get('/pnr/:pnr', requireAuth, validate({ params: pnrParamSchema }), trainsController.getPnrStatus);

/**
 * @openapi
 * /trains/{number}/stops:
 *   get:
 *     summary: Train stop schedule (24h cached)
 *     description: Vendor-backed (IRCTC/RailAPI), cached 24h server-side. Returns 503 RAIL_VENDOR_UNAVAILABLE if no cache exists and the vendor call fails.
 *     tags: [Trains]
 *     security: []
 *     parameters:
 *       - { in: path, name: number, required: true, schema: { type: string, pattern: '^\d{4,5}$' }, example: '12345' }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/TrainScheduleResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 *       '503':
 *         description: Live train data vendor is temporarily unavailable
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
trainsRoutes.get('/:number/stops', validate({ params: trainNumberParamSchema }), trainsController.getStops);
