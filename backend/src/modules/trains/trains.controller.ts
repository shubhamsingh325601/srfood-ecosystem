import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseFormatter';

import { trainsService } from './trains.service';

export const trainsController = {
  search: asyncHandler(async (req: Request, res: Response) => {
    const results = await trainsService.searchTrains(String(req.query.query));
    sendSuccess(res, results);
  }),

  getPnrStatus: asyncHandler(async (req: Request, res: Response) => {
    const status = await trainsService.getPnrStatus(req.params.pnr);
    sendSuccess(res, status);
  }),

  getStops: asyncHandler(async (req: Request, res: Response) => {
    const schedule = await trainsService.getTrainStops(req.params.number);
    sendSuccess(res, schedule);
  }),
};
