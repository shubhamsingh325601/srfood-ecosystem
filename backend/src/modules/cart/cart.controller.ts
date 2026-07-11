import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseFormatter';

import { cartService } from './cart.service';

export const cartController = {
  validate: asyncHandler(async (req: Request, res: Response) => {
    const result = await cartService.validateCart(req.body, req.user?.id);
    sendSuccess(res, result);
  }),
};
