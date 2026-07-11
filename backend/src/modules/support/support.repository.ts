import type { FilterQuery } from 'mongoose';

import { Counter } from '@/models/Counter.model';
import { SupportTicket, type SupportTicketDocument } from '@/models/SupportTicket.model';
import type { SupportTicketStatus } from '@/types/domain.types';

export const supportRepository = {
  async nextTicketNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(`ticket:${year}`, { $inc: { seq: 1 } }, { upsert: true, new: true });
    return `TCK-${year}-${String(counter.seq).padStart(5, '0')}`;
  },

  async create(data: Record<string, unknown>) {
    return SupportTicket.create(data);
  },

  async findById(id: string) {
    return SupportTicket.findOne({ _id: id, isDeleted: false });
  },

  async listForUser(userId: string, status: SupportTicketStatus | undefined, skip: number, limit: number) {
    const query: FilterQuery<SupportTicketDocument> = { userId, isDeleted: false };
    if (status) query.status = status;
    const [items, total] = await Promise.all([
      SupportTicket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SupportTicket.countDocuments(query),
    ]);
    return { items, total };
  },

  async listAll(status: SupportTicketStatus | undefined, skip: number, limit: number) {
    const query: FilterQuery<SupportTicketDocument> = { isDeleted: false };
    if (status) query.status = status;
    const [items, total] = await Promise.all([
      SupportTicket.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      SupportTicket.countDocuments(query),
    ]);
    return { items, total };
  },

  async update(id: string, data: Record<string, unknown>) {
    return SupportTicket.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },
};
