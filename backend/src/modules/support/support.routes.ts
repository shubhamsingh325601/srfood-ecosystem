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
 */
supportRoutes.post('/tickets', optionalAuth, validate({ body: createTicketSchema }), supportController.create);

/**
 * @openapi
 * /support/tickets:
 *   get:
 *     summary: List own support tickets
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 */
supportRoutes.get('/tickets', requireAuth, validate({ query: listTicketsSchema }), supportController.listMine);

/**
 * @openapi
 * /support/tickets/{id}:
 *   get:
 *     summary: Get own ticket detail
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
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
 */
adminSupportRoutes.get('/tickets', requireAuth, requireRole(...staffRoles), validate({ query: listTicketsSchema }), supportController.listAll);

/**
 * @openapi
 * /admin/support/tickets/{id}:
 *   patch:
 *     summary: Update ticket status/assignment (staff)
 *     tags: [Support]
 *     security: [{ bearerAuth: [] }]
 */
adminSupportRoutes.patch(
  '/tickets/:id',
  requireAuth,
  requireRole(...staffRoles),
  validate({ params: ticketIdParamSchema, body: updateTicketSchema }),
  supportController.update,
);
