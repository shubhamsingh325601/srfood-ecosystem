import { Router } from 'express';

import { requireAuth } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';

import { notificationsController } from './notifications.controller';
import { listNotificationsSchema, notificationIdParamSchema } from './notifications.dto';

export const notificationsRoutes = Router();

/**
 * @openapi
 * /notifications:
 *   get:
 *     summary: List own in-app notifications
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 */
notificationsRoutes.get('/', requireAuth, validate({ query: listNotificationsSchema }), notificationsController.list);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 */
notificationsRoutes.patch('/:id/read', requireAuth, validate({ params: notificationIdParamSchema }), notificationsController.markRead);
