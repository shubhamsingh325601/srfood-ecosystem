import type { FilterQuery } from 'mongoose';

import { Notification, type NotificationDocument } from '@/models/Notification.model';
import { NotificationChannel } from '@/types/domain.types';

export const notificationsRepository = {
  async listForUser(userId: string, unreadOnly: boolean | undefined, skip: number, limit: number) {
    const query: FilterQuery<NotificationDocument> = { userId, channel: NotificationChannel.IN_APP, isDeleted: false };
    if (unreadOnly) query.isRead = false;
    const [items, total] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Notification.countDocuments(query),
    ]);
    return { items, total };
  },

  async markRead(id: string, userId: string) {
    return Notification.findOneAndUpdate({ _id: id, userId, isDeleted: false }, { isRead: true }, { new: true });
  },
};
