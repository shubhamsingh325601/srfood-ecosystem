import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseFormatter';

import type { ReportType } from './reports.dto';
import { reportsService } from './reports.service';

export const reportsController = {
  generate: asyncHandler(async (req: Request, res: Response) => {
    const report = await reportsService.generate(req.params.type as ReportType, req.query as never);
    sendSuccess(res, report);
  }),
};
