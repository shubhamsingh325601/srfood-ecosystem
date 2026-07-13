import type { Request, Response } from 'express';

import { ordersService } from '@/modules/orders/orders.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { paymentsService } from './payments.service';

export const paymentsController = {
  getStatus: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await ordersService.assertOwnership(req.params.orderId, req.user.id);
    const payment = await paymentsService.getStatus(req.params.orderId);
    sendSuccess(res, payment);
  }),

  /** Customer self-reports their UPI transaction reference after paying — trusted immediately (order moves to ORDER_PLACED), reconciled by admin afterward. See ADR 0003. */
  submitReference: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await ordersService.assertOwnership(req.params.orderId, req.user.id);
    await paymentsService.recordSelfReportedPayment(req.params.orderId, req.body.utr);
    const order = await ordersService.applyPaymentOutcome(req.params.orderId, 'CAPTURED', { utrReference: req.body.utr });
    sendSuccess(res, order, { message: 'Payment recorded' });
  }),

  /** Customer reports the UPI payment didn't go through (declined/cancelled in their app) — moves the order to PAYMENT_FAILED so they can retry with a fresh order. */
  declinePayment: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await ordersService.assertOwnership(req.params.orderId, req.user.id);
    await paymentsService.declinePayment(req.params.orderId);
    const order = await ordersService.applyPaymentOutcome(req.params.orderId, 'FAILED');
    sendSuccess(res, order, { message: 'Payment marked as not completed' });
  }),
};
