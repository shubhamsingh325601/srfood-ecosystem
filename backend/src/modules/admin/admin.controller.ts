import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseFormatter';

import { adminService } from './admin.service';

export const adminController = {
  dashboardSummary: asyncHandler(async (_req: Request, res: Response) => {
    const summary = await adminService.dashboardSummary();
    sendSuccess(res, summary);
  }),

  listAuditLogs: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await adminService.listAuditLogs(req.query as never);
    sendSuccess(res, items, { meta });
  }),

  listRoles: asyncHandler(async (_req: Request, res: Response) => {
    const roles = await adminService.listRoles();
    sendSuccess(res, roles);
  }),
};
