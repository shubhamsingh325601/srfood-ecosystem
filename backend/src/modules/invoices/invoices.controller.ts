import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { invoicesService } from './invoices.service';

export const invoicesController = {
  getOrGenerate: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const invoice = await invoicesService.getOrGenerate(req.params.orderId, req.user.id);
    sendSuccess(res, invoice);
  }),
};
