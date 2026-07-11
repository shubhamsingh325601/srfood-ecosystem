import { RATING } from '@/config/constants';
import { Order } from '@/models/Order.model';
import { OrderStatus } from '@/types/domain.types';
import { BadRequestError, ForbiddenError, NotFoundError } from '@/utils/errors';
import { buildPaginationMeta } from '@/utils/responseFormatter';

import type { CreateRatingInput, ListRatingsInput, ModerateRatingInput, UpdateRatingInput } from './ratings.dto';
import { ratingsRepository } from './ratings.repository';

const RATEABLE_STATUSES: OrderStatus[] = [OrderStatus.DELIVERED, OrderStatus.COMPLETED];

export const ratingsService = {
  async create(userId: string, input: CreateRatingInput) {
    const order = await Order.findOne({ _id: input.orderId, isDeleted: false });
    if (!order) throw new NotFoundError('Order not found');
    if (order.passengerId.toString() !== userId) throw new ForbiddenError('You can only rate your own orders');
    if (!RATEABLE_STATUSES.includes(order.status)) throw new BadRequestError('This order has not been delivered yet');

    const deliveredEntry = [...order.statusHistory].reverse().find((h) => h.status === OrderStatus.DELIVERED);
    const deliveredAt = deliveredEntry?.changedAt ?? order.updatedAt;

    const minRatableAt = new Date(deliveredAt.getTime() + RATING.POST_DELIVERY_DELAY_MINUTES * 60_000);
    if (new Date() < minRatableAt) {
      throw new BadRequestError(`Ratings open ${RATING.POST_DELIVERY_DELAY_MINUTES} minutes after delivery`);
    }

    const windowExpiresAt = new Date(deliveredAt.getTime() + RATING.SUBMISSION_WINDOW_DAYS * 24 * 60 * 60_000);
    if (new Date() > windowExpiresAt) {
      throw new BadRequestError(`Ratings must be submitted within ${RATING.SUBMISSION_WINDOW_DAYS} days of delivery`);
    }

    if (input.menuItemId && !order.items.some((i) => i.menuItemId.toString() === input.menuItemId)) {
      throw new BadRequestError('This menu item was not part of the order');
    }

    const editWindowExpiresAt = new Date(Date.now() + RATING.EDIT_WINDOW_HOURS * 60 * 60_000);

    const rating = await ratingsRepository.create({
      orderId: order._id,
      passengerId: userId,
      menuItemId: input.menuItemId,
      rating: input.rating,
      reviewText: input.reviewText,
      photos: input.photos ?? [],
      editWindowExpiresAt,
    });

    if (input.menuItemId) await ratingsRepository.recomputeMenuItemAggregate(input.menuItemId);

    return rating;
  },

  async list(input: ListRatingsInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await ratingsRepository.list(
      { menuItemId: input.menuItemId, featured: input.featured },
      (page - 1) * limit,
      limit,
      false,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listAllForAdmin(input: ListRatingsInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await ratingsRepository.list(
      { menuItemId: input.menuItemId, featured: input.featured },
      (page - 1) * limit,
      limit,
      true,
    );
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async update(id: string, userId: string, input: UpdateRatingInput) {
    const rating = await ratingsRepository.findById(id);
    if (!rating) throw new NotFoundError('Rating not found');
    if (rating.passengerId.toString() !== userId) throw new ForbiddenError('You can only edit your own rating');
    if (new Date() > rating.editWindowExpiresAt) throw new BadRequestError('The edit window for this rating has passed');

    const updated = await ratingsRepository.update(id, input);
    if (rating.menuItemId) await ratingsRepository.recomputeMenuItemAggregate(rating.menuItemId.toString());
    return updated;
  },

  async moderate(id: string, input: ModerateRatingInput) {
    const rating = await ratingsRepository.findById(id);
    if (!rating) throw new NotFoundError('Rating not found');
    const updated = await ratingsRepository.update(id, input);
    if (rating.menuItemId) await ratingsRepository.recomputeMenuItemAggregate(rating.menuItemId.toString());
    return updated;
  },
};
