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
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsHomepageResponse' }
 */
cmsRoutes.get('/homepage', cmsController.getHomepage);
/**
 * @openapi
 * /cms/faqs:
 *   get:
 *     summary: FAQ list
 *     tags: [CMS]
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsFaqsResponse' }
 */
cmsRoutes.get('/faqs', cmsController.getFaqs);
/**
 * @openapi
 * /cms/privacy-policy:
 *   get:
 *     summary: Privacy policy text
 *     tags: [CMS]
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsLegalResponse' }
 */
cmsRoutes.get('/privacy-policy', cmsController.getPrivacyPolicy);
/**
 * @openapi
 * /cms/terms:
 *   get:
 *     summary: Terms & conditions text
 *     tags: [CMS]
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsLegalResponse' }
 */
cmsRoutes.get('/terms', cmsController.getTerms);
/**
 * @openapi
 * /cms/settings:
 *   get:
 *     summary: Site settings (social links, contact info)
 *     tags: [CMS]
 *     security: []
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsSettingsResponse' }
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [hero, offer]
 *             properties:
 *               hero:
 *                 type: array
 *                 maxItems: 10
 *                 items:
 *                   type: object
 *                   required: [eyebrow, title, desc, cta]
 *                   properties:
 *                     eyebrow: { type: string, maxLength: 60 }
 *                     title: { type: string, maxLength: 120 }
 *                     desc: { type: string, maxLength: 300 }
 *                     cta: { type: string, maxLength: 60 }
 *               offer:
 *                 type: object
 *                 required: [code, percent, headline, sub]
 *                 properties:
 *                   code: { type: string, maxLength: 30 }
 *                   percent: { type: number, minimum: 0, maximum: 100 }
 *                   headline: { type: string, maxLength: 120 }
 *                   sub: { type: string, maxLength: 200 }
 *     responses:
 *       '200':
 *         description: Homepage content updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsHomepageResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminCmsRoutes.put('/homepage', requireAuth, requireRole(...adminRoles), validate({ body: homepageContentSchema }), cmsController.updateHomepage);
/**
 * @openapi
 * /admin/cms/faqs:
 *   put:
 *     summary: Update FAQ list
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [faqs]
 *             properties:
 *               faqs:
 *                 type: array
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   required: [question, answer]
 *                   properties:
 *                     question: { type: string, minLength: 3, maxLength: 200 }
 *                     answer: { type: string, minLength: 3, maxLength: 1000 }
 *                     displayOrder: { type: integer, default: 0 }
 *     responses:
 *       '200':
 *         description: FAQ list updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsFaqsResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminCmsRoutes.put('/faqs', requireAuth, requireRole(...adminRoles), validate({ body: faqContentSchema }), cmsController.updateFaqs);
/**
 * @openapi
 * /admin/cms/privacy-policy:
 *   put:
 *     summary: Update privacy policy
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string, minLength: 10 }
 *     responses:
 *       '200':
 *         description: Privacy policy updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsLegalResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [text]
 *             properties:
 *               text: { type: string, minLength: 10 }
 *     responses:
 *       '200':
 *         description: Terms & conditions updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsLegalResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminCmsRoutes.put('/terms', requireAuth, requireRole(...adminRoles), validate({ body: legalContentSchema }), cmsController.updateTerms);
/**
 * @openapi
 * /admin/cms/settings:
 *   put:
 *     summary: Update site settings
 *     tags: [CMS]
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [social, contactEmail, contactPhone, contactAddress, whatsappNumber, upiVpa, upiPayeeName]
 *             properties:
 *               social:
 *                 type: object
 *                 properties:
 *                   facebook: { type: string }
 *                   instagram: { type: string }
 *                   twitter: { type: string }
 *                   youtube: { type: string }
 *               contactEmail: { type: string, format: email }
 *               contactPhone: { type: string }
 *               contactAddress: { type: string, maxLength: 300 }
 *               whatsappNumber: { type: string, minLength: 8, description: 'Include country code' }
 *               upiVpa: { type: string, example: 'srfood@ybl', description: 'UPI ID that receives customer payments — used to build the payment link on every order' }
 *               upiPayeeName: { type: string, maxLength: 100, example: 'SR Food' }
 *     responses:
 *       '200':
 *         description: Site settings updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CmsSettingsResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminCmsRoutes.put('/settings', requireAuth, requireRole(...adminRoles), validate({ body: settingsContentSchema }), cmsController.updateSettings);
