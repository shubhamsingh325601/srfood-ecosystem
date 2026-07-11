import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { cmsController } from './cms.controller';
import { faqContentSchema, homepageContentSchema, legalContentSchema, settingsContentSchema } from './cms.dto';

export const cmsRoutes = Router();

/**
 * @openapi
 * /cms/homepage:
 *   get:
 *     summary: Homepage hero/offer content
 *     tags: [CMS]
 */
cmsRoutes.get('/homepage', cmsController.getHomepage);
/**
 * @openapi
 * /cms/faqs:
 *   get:
 *     summary: FAQ list
 *     tags: [CMS]
 */
cmsRoutes.get('/faqs', cmsController.getFaqs);
/**
 * @openapi
 * /cms/privacy-policy:
 *   get:
 *     summary: Privacy policy text
 *     tags: [CMS]
 */
cmsRoutes.get('/privacy-policy', cmsController.getPrivacyPolicy);
/**
 * @openapi
 * /cms/terms:
 *   get:
 *     summary: Terms & conditions text
 *     tags: [CMS]
 */
cmsRoutes.get('/terms', cmsController.getTerms);
/**
 * @openapi
 * /cms/settings:
 *   get:
 *     summary: Site settings (social links, contact info)
 *     tags: [CMS]
 */
cmsRoutes.get('/settings', cmsController.getSettings);

export const adminCmsRoutes = Router();

const adminRoles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];

/**
 * @openapi
 * /admin/cms/homepage:
 *   put:
 *     summary: Update homepage content
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 */
adminCmsRoutes.put('/homepage', requireAuth, requireRole(...adminRoles), validate({ body: homepageContentSchema }), cmsController.updateHomepage);
/**
 * @openapi
 * /admin/cms/faqs:
 *   put:
 *     summary: Update FAQ list
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 */
adminCmsRoutes.put('/faqs', requireAuth, requireRole(...adminRoles), validate({ body: faqContentSchema }), cmsController.updateFaqs);
/**
 * @openapi
 * /admin/cms/privacy-policy:
 *   put:
 *     summary: Update privacy policy
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 */
adminCmsRoutes.put(
  '/privacy-policy',
  requireAuth,
  requireRole(...adminRoles),
  validate({ body: legalContentSchema }),
  cmsController.updatePrivacyPolicy,
);
/**
 * @openapi
 * /admin/cms/terms:
 *   put:
 *     summary: Update terms & conditions
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 */
adminCmsRoutes.put('/terms', requireAuth, requireRole(...adminRoles), validate({ body: legalContentSchema }), cmsController.updateTerms);
/**
 * @openapi
 * /admin/cms/settings:
 *   put:
 *     summary: Update site settings
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 */
adminCmsRoutes.put('/settings', requireAuth, requireRole(...adminRoles), validate({ body: settingsContentSchema }), cmsController.updateSettings);
