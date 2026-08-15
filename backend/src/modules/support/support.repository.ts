import type { FilterQuery } from 'mongoose';

import { getModel } from '@/config/database';
import type { CounterDocument } from '@/models/Counter.model';
import type { SupportTicketDocument } from '@/models/SupportTicket.model';
import type { SupportTicketStatus } from '@/types/domain.types';

export const supportRepository = {
  async nextTicketNumber(): Promise<string> {
    const Counter = getModel<CounterDocument>('Counter');
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(`ticket:${year}`, { $inc: { seq: 1 } }, { upsert: true, new: true });
    return `TCK-${year}-${String(counter.seq).padStart(5, '0')}`;
  },

  async create(data: Record<string, unknown>) {
    const SupportTicket = getModel<SupportTicketDocument>('SupportTicket');
    return SupportTicket.create(data);
  },

  async findById(id: string) {
    const SupportTicket = getModel<SupportTicketDocument>('SupportTicket');
    return SupportTicket.findOne({ _id: id, isDeleted: false });
  },

  async listForUser(userId: string, status: SupportTicketStatus | undefined, skip: number, limit: number) {
    const SupportTicket = getModel<SupportTicketDocument>('SupportTicket');
    const query: FilterQuery<SupportTicketDocument> = { userId, isDeleted: false };
    if (status) query.status = status;
    const [items, total] = await Promise.all([
      SupportTicket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SupportTicket.countDocuments(query),
    ]);
    return { items, total };
  },

  async listAll(status: SupportTicketStatus | undefined, skip: number, limit: number) {
    const SupportTicket = getModel<SupportTicketDocument>('SupportTicket');
    const query: FilterQuery<SupportTicketDocument> = { isDeleted: false };
    if (status) query.status = status;
    const [items, total] = await Promise.all([
      SupportTicket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SupportTicket.countDocuments(query),
    ]);
    return { items, total };
  },

  async update(id: string, data: Record<string, unknown>) {
    const SupportTicket = getModel<SupportTicketDocument>('SupportTicket');
    return SupportTicket.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },
};