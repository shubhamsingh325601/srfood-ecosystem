import { z } from 'zod';

import { SupportTicketPriority, SupportTicketStatus } from '@/types/domain.types';

export const ticketIdParamSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id'),
});

export const createTicketSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().toLowerCase().email().max(200),
  phone: z.string().trim().optional(),
  subject: z.string().trim().min(3).max(200),
  message: z.string().trim().min(5).max(1000),
  category: z.string().trim().max(50).optional(),
  orderId: z
    .string()
    .regex(/^[a-f0-9]{24}$/i)
    .optional(),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const listTicketsSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(SupportTicketStatus).optional(),
});
export type ListTicketsInput = z.infer<typeof listTicketsSchema>;

export const updateTicketSchema = z.object({
  status: z.nativeEnum(SupportTicketStatus).optional(),
  priority: z.nativeEnum(SupportTicketPriority).optional(),
  assignedTo: z
    .string()
    .regex(/^[a-f0-9]{24}$/i)
    .optional(),
  resolutionNote: z.string().trim().max(1000).optional(),
});
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;
