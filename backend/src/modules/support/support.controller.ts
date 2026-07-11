import type { Request, Response } from 'express';

import { UserRole } from '@/types/domain.types';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { supportService } from './support.service';

function isStaffRole(role?: UserRole): boolean {
  return role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN || role === UserRole.SUPPORT_EXEC;
}

export const supportController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const ticket = await supportService.create(req.user?.id, req.body);
    sendSuccess(res, ticket, { statusCode: 201, message: 'Support ticket created' });
  }),

  listMine: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const { items, meta } = await supportService.listMine(req.user.id, req.query as never);
    sendSuccess(res, items, { meta });
  }),

  getDetail: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    const ticket = await supportService.getById(req.params.id, req.user.id, isStaffRole(req.user.role));
    sendSuccess(res, ticket);
  }),

  listAll: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await supportService.listAll(req.query as never);
    sendSuccess(res, items, { meta });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const ticket = await supportService.update(req.params.id, req.body);
    sendSuccess(res, ticket, { message: 'Ticket updated' });
  }),
};
