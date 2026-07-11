import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { ratingsService } from './ratings.service';

export const ratingsController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const rating = await ratingsService.create(req.user.id, req.body);
    sendSuccess(res, rating, { statusCode: 201, message: 'Rating submitted' });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await ratingsService.list(req.query as never);
    sendSuccess(res, items, { meta });
  }),

  listAllForAdmin: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await ratingsService.listAllForAdmin(req.query as never);
    sendSuccess(res, items, { meta });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const rating = await ratingsService.update(req.params.id, req.user.id, req.body);
    sendSuccess(res, rating, { message: 'Rating updated' });
  }),

  moderate: asyncHandler(async (req: Request, res: Response) => {
    const rating = await ratingsService.moderate(req.params.id, req.body);
    sendSuccess(res, rating, { message: 'Rating moderated' });
  }),
};
