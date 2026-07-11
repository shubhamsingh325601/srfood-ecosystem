import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { recordAuditLog } from '@/utils/auditLog';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { couponsService } from './coupons.service';

function requireUser(req: Request) {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
}

export const couponsController = {
  listActive: asyncHandler(async (_req: Request, res: Response) => {
    const coupons = await couponsService.listActive();
    sendSuccess(res, coupons);
  }),

  validate: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { code, subtotalPaise } = req.body;
    const result = await couponsService.validate(code, subtotalPaise, user.id);
    sendSuccess(res, { discountPaise: result.discountPaise, code: result.coupon.code });
  }),

  listAll: asyncHandler(async (req: Request, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const { items, meta } = await couponsService.listAll(page, limit);
    sendSuccess(res, items, { meta });
  }),

  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const coupon = await couponsService.create(req.body);
    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'COUPON_CREATED',
      entityType: 'Coupon',
      entityId: coupon._id,
      after: coupon,
      ipAddress: req.ip,
    });
    sendSuccess(res, coupon, { statusCode: 201, message: 'Coupon created' });
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const coupon = await couponsService.update(req.params.id, req.body, user.id);
    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'COUPON_UPDATED',
      entityType: 'Coupon',
      entityId: req.params.id,
      after: coupon,
      ipAddress: req.ip,
    });
    sendSuccess(res, coupon, { message: 'Coupon updated' });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    await couponsService.delete(req.params.id, user.id);
    await recordAuditLog({
      actorId: user.id,
      actorRole: user.role,
      action: 'COUPON_DELETED',
      entityType: 'Coupon',
      entityId: req.params.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, null, { message: 'Coupon deleted' });
  }),
};
