import { notifyUser } from '@/services/notification.service';
import { NotificationEvent } from '@/types/domain.types';
import { NotFoundError } from '@/utils/errors';
import { buildPaginationMeta } from '@/utils/responseFormatter';

import type { CreateTicketInput, ListTicketsInput, UpdateTicketInput } from './support.dto';
import { supportRepository } from './support.repository';

export const supportService = {
  async create(userId: string | undefined, input: CreateTicketInput) {
    const ticketNumber = await supportRepository.nextTicketNumber();
    return supportRepository.create({ ...input, userId, ticketNumber });
  },

  async listMine(userId: string, input: ListTicketsInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await supportRepository.listForUser(userId, input.status, (page - 1) * limit, limit);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async getById(id: string, userId: string, isStaff: boolean) {
    const ticket = await supportRepository.findById(id);
    if (!ticket) throw new NotFoundError('Ticket not found');
    if (!isStaff && ticket.userId?.toString() !== userId) throw new NotFoundError('Ticket not found');
    return ticket;
  },

  async listAll(input: ListTicketsInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await supportRepository.listAll(input.status, (page - 1) * limit, limit);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async update(id: string, input: UpdateTicketInput) {
    const ticket = await supportRepository.update(id, input);
    if (!ticket) throw new NotFoundError('Ticket not found');
    if (ticket.userId && input.status) {
      await notifyUser(
        ticket.userId.toString(),
        NotificationEvent.SUPPORT_TICKET_UPDATED,
        'Support ticket updated',
        `Your ticket ${ticket.ticketNumber} is now ${input.status}.`,
      );
    }
    return ticket;
  },
};
