import type { Request, Response } from 'express';

import { asyncHandler } from '@/utils/asyncHandler';
import { recordAuditLog } from '@/utils/auditLog';
import { BadRequestError, UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { usersService } from './users.service';

function requireUser(req: Request) {
  if (!req.user) throw new UnauthorizedError();
  return req.user;
}

export const usersController = {
  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const me = await usersService.getMe(user.id);
    sendSuccess(res, me);
  }),

  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const me = await usersService.updateProfile(user.id, req.body);
    sendSuccess(res, me, { message: 'Profile updated' });
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    await usersService.changePassword(user.id, req.body);
    sendSuccess(res, null, { message: 'Password changed' });
  }),

  requestMobileChangeOtp: asyncHandler(async (req: Request, res: Response) => {
    requireUser(req);
    const result = await usersService.requestMobileChangeOtp(req.body.newMobile);
    sendSuccess(res, result, { message: 'OTP sent to new mobile number' });
  }),

  changeMobile: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const me = await usersService.changeMobile(user.id, req.body);
    sendSuccess(res, me, { message: 'Mobile number updated' });
  }),

  updatePreferences: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const me = await usersService.updatePreferences(user.id, req.body);
    sendSuccess(res, me, { message: 'Preferences updated' });
  }),

  updateNotificationSettings: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const me = await usersService.updateNotificationSettings(user.id, req.body);
    sendSuccess(res, me, { message: 'Notification settings updated' });
  }),

  uploadPhoto: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    if (!req.file) throw new BadRequestError('No image file provided');
    const me = await usersService.uploadPhoto(user.id, req.file.buffer);
    sendSuccess(res, me, { message: 'Profile photo updated' });
  }),

  requestDeletionOtp: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    const result = await usersService.requestDeletionOtp(user.id);
    sendSuccess(res, result, { message: 'OTP sent to confirm account deletion' });
  }),

  deleteAccount: asyncHandler(async (req: Request, res: Response) => {
    const user = requireUser(req);
    await usersService.deleteAccount(user.id, req.body.otpCode);
    sendSuccess(res, null, { message: 'Account deleted' });
  }),

  listAll: asyncHandler(async (req: Request, res: Response) => {
    const { items, meta } = await usersService.listAll(req.query as never);
    sendSuccess(res, items, { meta });
  }),

  setBlocked: asyncHandler(async (req: Request, res: Response) => {
    const actor = requireUser(req);
    const isBlocked = req.body.isBlocked !== false;
    const user = await usersService.setBlocked(req.params.id, isBlocked);
    await recordAuditLog({
      actorId: actor.id,
      actorRole: actor.role,
      action: isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      entityType: 'User',
      entityId: req.params.id,
      ipAddress: req.ip,
    });
    sendSuccess(res, user, { message: isBlocked ? 'User blocked' : 'User unblocked' });
  }),

  setRole: asyncHandler(async (req: Request, res: Response) => {
    const actor = requireUser(req);
    const user = await usersService.setRole(req.params.id, req.body.role);
    await recordAuditLog({
      actorId: actor.id,
      actorRole: actor.role,
      action: 'USER_ROLE_CHANGED',
      entityType: 'User',
      entityId: req.params.id,
      after: { role: req.body.role },
      ipAddress: req.ip,
    });
    sendSuccess(res, user, { message: 'User role updated' });
  }),
};
