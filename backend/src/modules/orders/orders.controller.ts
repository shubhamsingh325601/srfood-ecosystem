import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { BadRequestError, UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { ordersService } from './orders.service';

function requireUser(req: Request) {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
}

export const ordersController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const idempotencyKey = req.headers['idempotency-key'];
    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      throw new BadRequestError('Idempotency-Key header is required for order creation');
    }
    const result = await ordersService.createOrder(user.id, idempotencyKey, req.body);
    sendSuccess(res, result, { statusCode: result.replay ? 200 : 201, message: result.replay ? 'Order already created' : 'Order placed' });
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const { items, meta } = await ordersService.listOrders(user.id, req.query as never);
    sendSuccess(res, items, { meta });
  }),

  getDetail: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const order = await ordersService.getOrder(req.params.id, user);
    sendSuccess(res, order);
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const order = await ordersService.cancelOrder(req.params.id, user.id, req.body);
    sendSuccess(res, order, { message: 'Order cancelled' });
  }),

  reorder: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const validatedCart = await ordersService.reorder(req.params.id, user.id);
    sendSuccess(res, validatedCart);
  }),

  listAdmin: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await ordersService.listForAdmin(req.query as never);
    sendSuccess(res, items, { meta });
  }),

  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const order = await ordersService.updateStatus(req.params.id, user, req.body);
    sendSuccess(res, order, { message: 'Order status updated' });
  }),
};
