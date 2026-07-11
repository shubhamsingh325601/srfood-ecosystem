import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { notificationsService } from './notifications.service';

export const notificationsController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const { items, meta } = await notificationsService.list(req.user.id, req.query as never);
    sendSuccess(res, items, { meta });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const notification = await notificationsService.markRead(req.params.id, req.user.id);
    sendSuccess(res, notification, { message: 'Notification marked as read' });
  }),
};
