import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseFormatter';

import { stationsService } from './stations.service';

function isAdmin(req: Request): boolean {
  return req.user?.role === 'ADMIN' || req.user?.role === 'SUPER_ADMIN';
}

export const stationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const { q } = req.query as { q?: string };
    const stations = await stationsService.list(isAdmin(req), q);
    sendSuccess(res, stations);
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const station = await stationsService.create(req.body);
    sendSuccess(res, station, { statusCode: 201, message: 'Station created' });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const station = await stationsService.update(req.params.id, req.body);
    sendSuccess(res, station, { message: 'Station updated' });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    await stationsService.delete(req.params.id);
    sendSuccess(res, null, { message: 'Station deleted' });
  }),
};
