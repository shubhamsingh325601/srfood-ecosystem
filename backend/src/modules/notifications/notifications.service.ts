import { NotFoundError } from '@/utils/errors';
import { buildPaginationMeta } from '@/utils/responseFormatter';

import type { ListNotificationsInput } from './notifications.dto';
import { notificationsRepository } from './notifications.repository';

export const notificationsService = {
  async list(userId: string, input: ListNotificationsInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await notificationsRepository.listForUser(userId, input.unreadOnly, (page - 1) * limit, limit);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async markRead(id: string, userId: string) {
    const notification = await notificationsRepository.markRead(id, userId);
    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  },
};
