import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { sendSuccess } from '@/utils/responseFormatter';

import { authService } from './auth.service';

function requestContext(req: Request): { ipAddress?: string; userAgent?: string } {
  return { ipAddress: req.ip, userAgent: req.headers['user-agent'] };
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.register(req.body);
    sendSuccess(res, result, { message: 'Registered — verification OTP sent', statusCode: 201 });
  }),

  sendOtp: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.sendOtp(req.body);
    sendSuccess(res, result, { message: 'OTP sent' });
  }),

  verifyOtp: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.verifyOtp(req.body, requestContext(req));
    sendSuccess(res, result, { message: 'OTP verified' });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.login(req.body, requestContext(req));
    sendSuccess(res, result, { message: 'Login successful' });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const tokens = await authService.refresh(req.body.refreshToken, requestContext(req));
    sendSuccess(res, tokens, { message: 'Token refreshed' });
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    sendSuccess(res, null, { message: 'Logged out' });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const result = await authService.forgotPassword(req.body);
    sendSuccess(res, result, { message: 'If an account exists, an OTP has been sent' });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    sendSuccess(res, null, { message: 'Password reset successful' });
  }),
};
