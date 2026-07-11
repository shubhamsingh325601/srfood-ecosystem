import type { FilterQuery } from 'mongoose';

import { Order, type OrderDocument } from '@/models/Order.model';
import type { OrderStatus } from '@/types/domain.types';

function isObjectIdLike(value: string): boolean {
  return /^[a-f0-9]{24}$/i.test(value);
}

export interface AppendStatusEntry {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: string;
  note?: string;
}

export const ordersRepository = {
  async findByIdempotencyKey(idempotencyKey: string) {
    return Order.findOne({ idempotencyKey });
  },

  async create(data: Record<string, unknown>) {
    return Order.create(data);
  },

  async findByIdOrOrderId(idOrOrderId: string) {
    return isObjectIdLike(idOrOrderId) ? Order.findOne({ _id: idOrOrderId, isDeleted: false }) : Order.findOne({ orderId: idOrOrderId, isDeleted: false });
  },

  async listForUser(passengerId: string, status: OrderStatus | undefined, skip: number, limit: number) {
    const query: FilterQuery<OrderDocument> = { passengerId, isDeleted: false };
    if (status) query.status = status;
    const [items, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);
    return { items, total };
  },

  async listForAdmin(filters: { status?: OrderStatus; passengerId?: string }, skip: number, limit: number) {
    const query: FilterQuery<OrderDocument> = { isDeleted: false };
    if (filters.status) query.status = filters.status;
    if (filters.passengerId) query.passengerId = filters.passengerId;
    const [items, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);
    return { items, total };
  },

  async appendStatus(orderId: string, entry: AppendStatusEntry, extra: Record<string, unknown> = {}) {
    return Order.findByIdAndUpdate(
      orderId,
      { status: entry.status, $push: { statusHistory: entry }, ...extra },
      { new: true },
    );
  },
};
