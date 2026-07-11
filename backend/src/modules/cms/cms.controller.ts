import type { Request, Response } from 'express';

import { CmsContentType } from '@/types/domain.types';
import { asyncHandler } from '@/utils/asyncHandler';
import { UnauthorizedError } from '@/utils/errors';
import { sendSuccess } from '@/utils/responseFormatter';

import { cmsService } from './cms.service';

export const cmsController = {
  getHomepage: asyncHandler(async (_req: Request, res: Response) => sendSuccess(res, await cmsService.getHomepage())),
  getFaqs: asyncHandler(async (_req: Request, res: Response) => sendSuccess(res, await cmsService.getFaqs())),
  getPrivacyPolicy: asyncHandler(async (_req: Request, res: Response) => sendSuccess(res, await cmsService.getPrivacyPolicy())),
  getTerms: asyncHandler(async (_req: Request, res: Response) => sendSuccess(res, await cmsService.getTerms())),
  getSettings: asyncHandler(async (_req: Request, res: Response) => sendSuccess(res, await cmsService.getSettings())),

  updateHomepage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    sendSuccess(res, await cmsService.update(CmsContentType.HOMEPAGE, req.body, req.user.id), { message: 'Homepage content updated' });
  }),
  updateFaqs: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    sendSuccess(res, await cmsService.update(CmsContentType.FAQ, req.body, req.user.id), { message: 'FAQs updated' });
  }),
  updatePrivacyPolicy: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    sendSuccess(res, await cmsService.update(CmsContentType.LEGAL_PRIVACY, req.body, req.user.id), { message: 'Privacy policy updated' });
  }),
  updateTerms: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    sendSuccess(res, await cmsService.update(CmsContentType.LEGAL_TERMS, req.body, req.user.id), { message: 'Terms updated' });
  }),
  updateSettings: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError();
    sendSuccess(res, await cmsService.update(CmsContentType.SETTINGS, req.body, req.user.id), { message: 'Settings updated' });
  }),
};
