import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseFormatter';

import { analyticsService } from './analytics.service';

export const analyticsController = {
  revenueTrend: asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await analyticsService.revenueTrend(req.query as never))),
  stationHeatmap: asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await analyticsService.stationHeatmap(req.query as never))),
  paymentBreakdown: asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await analyticsService.paymentBreakdown(req.query as never))),
  funnel: asyncHandler(async (req: Request, res: Response) => sendSuccess(res, await analyticsService.funnel(req.query as never))),
};
