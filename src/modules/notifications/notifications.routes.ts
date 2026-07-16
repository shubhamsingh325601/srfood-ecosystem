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
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *       - { in: query, name: unreadOnly, schema: { type: boolean } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NotificationListResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 */
notificationsRoutes.get('/', requireAuth, validate({ query: listNotificationsSchema }), notificationsController.list);

/**
 * @openapi
 * /notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NotificationResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
notificationsRoutes.patch('/:id/read', requireAuth, validate({ params: notificationIdParamSchema }), notificationsController.markRead);
