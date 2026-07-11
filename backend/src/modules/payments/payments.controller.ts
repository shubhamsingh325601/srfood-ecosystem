import type { Request, Response } from 'express';

import { ordersService } from '@/modules/orders/orders.service';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { paymentsService } from './payments.service';

export const paymentsController = {
  /** Orchestrates Payments + Orders from the controller layer so neither module's service imports the other (see orders.service.ts applyPaymentOutcome doc comment). */
  webhook: asyncHandler(async (req: Request, res: Response) => {
    const signature = req.headers['x-razorpay-signature'] as string | undefined;
    const outcome = await paymentsService.verifyAndHandleWebhook(req.rawBody ?? '', signature);
    if (outcome) {
      await ordersService.applyPaymentOutcome(outcome.orderId, outcome.status);
    }
    res.status(200).json({ success: true, data: { received: true } });
  }),

  getStatus: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    await ordersService.assertOwnership(req.params.orderId, req.user.id);
    const payment = await paymentsService.getStatus(req.params.orderId);
    sendSuccess(res, payment);
  }),
};
