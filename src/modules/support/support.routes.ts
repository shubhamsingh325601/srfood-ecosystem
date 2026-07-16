import { Router } from 'express';

import { optionalAuth, requireAuth } from '@/middleware/auth.middleware';
import { requireRole } from '@/middleware/role.middleware';
import { validate } from '@/middleware/validate.middleware';
import { UserRole } from '@/types/domain.types';

import { supportController } from './support.controller';
import { createTicketSchema, listTicketsSchema, ticketIdParamSchema, updateTicketSchema } from './support.dto';

export const supportRoutes = Router();

/**
 * @openapi
 * /support/tickets:
 *   post:
 *     summary: Submit a support ticket (contact form; guest or logged in)
 *     tags: [Support]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, subject, message]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 80 }
 *               email: { type: string, format: email }
 *               phone: { type: string }
 *               subject: { type: string, minLength: 3, maxLength: 200 }
 *               message: { type: string, minLength: 5, maxLength: 1000 }
 *               category: { type: string, maxLength: 50, example: 'GENERAL' }
 *               orderId: { type: string, pattern: '^[a-f0-9]{24}$' }
 *     responses:
 *       '201':
 *         description: Ticket created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SupportTicketResponse' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
supportRoutes.post('/tickets', optionalAuth, validate({ body: createTicketSchema }), supportController.create);

/**
 * @openapi
 * /support/tickets:
 *   get:
 *     summary: List own support tickets
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *       - { in: query, name: status, schema: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SupportTicketListResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 */
supportRoutes.get('/tickets', requireAuth, validate({ query: listTicketsSchema }), supportController.listMine);

/**
 * @openapi
 * /support/tickets/{id}:
 *   get:
 *     summary: Get own ticket detail
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SupportTicketResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 */
supportRoutes.get('/tickets/:id', requireAuth, validate({ params: ticketIdParamSchema }), supportController.getDetail);

export const adminSupportRoutes = Router();

const staffRoles = [UserRole.SUPPORT_EXEC, UserRole.ADMIN, UserRole.SUPER_ADMIN];

/**
 * @openapi
 * /admin/support/tickets:
 *   get:
 *     summary: List all support tickets (staff)
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: query, name: page, schema: { type: integer, minimum: 1, default: 1 } }
 *       - { in: query, name: limit, schema: { type: integer, minimum: 1, default: 20 } }
 *       - { in: query, name: status, schema: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] } }
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SupportTicketListResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 */
adminSupportRoutes.get('/tickets', requireAuth, requireRole(...staffRoles), validate({ query: listTicketsSchema }), supportController.listAll);

/**
 * @openapi
 * /admin/support/tickets/{id}:
 *   patch:
 *     summary: Update ticket status/assignment (staff)
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: string, pattern: '^[a-f0-9]{24}$' } }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [OPEN, IN_PROGRESS, RESOLVED, CLOSED] }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 *               assignedTo: { type: string, pattern: '^[a-f0-9]{24}$', description: 'User id of the staff member to assign' }
 *               resolutionNote: { type: string, maxLength: 1000 }
 *     responses:
 *       '200':
 *         description: Ticket updated
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/SupportTicketResponse' }
 *       '401': { $ref: '#/components/responses/Unauthorized' }
 *       '403': { $ref: '#/components/responses/Forbidden' }
 *       '404': { $ref: '#/components/responses/NotFound' }
 *       '422': { $ref: '#/components/responses/ValidationError' }
 */
adminSupportRoutes.patch(
  '/tickets/:id',
  requireAuth,
  requireRole(...staffRoles),
  validate({ params: ticketIdParamSchema, body: updateTicketSchema }),
  supportController.update,
);
