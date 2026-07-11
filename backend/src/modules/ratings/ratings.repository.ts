import { Types, type FilterQuery } from 'mongoose';

import { MenuItem } from '@/models/MenuItem.model';
import { Rating, type RatingDocument } from '@/models/Rating.model';

export const ratingsRepository = {
  async create(data: Record<string, unknown>) {
    return Rating.create(data);
  },

  async findById(id: string) {
    return Rating.findOne({ _id: id, isDeleted: false });
  },

  async list(filters: { menuItemId?: string; featured?: boolean }, skip: number, limit: number, includeHidden: boolean) {
    const query: FilterQuery<RatingDocument> = { isDeleted: false };
    if (!includeHidden) query.isHidden = false;
    if (filters.menuItemId) query.menuItemId = filters.menuItemId;
    if (filters.featured) query.isFeatured = true;

    const [items, total] = await Promise.all([
      Rating.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('passengerId', 'name'),
      Rating.countDocuments(query),
    ]);
    return { items, total };
  },

  async update(id: string, data: Record<string, unknown>) {
    return Rating.findOneAndUpdate({ _id: id, isDeleted: false }, data, { new: true });
  },

  async recomputeMenuItemAggregate(menuItemId: string) {
    const [agg] = await Rating.aggregate<{ avg: number; count: number }>([
      { $match: { menuItemId: new Types.ObjectId(menuItemId), isDeleted: false, isHidden: false } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    await MenuItem.findByIdAndUpdate(menuItemId, {
      avgRating: agg ? Math.round(agg.avg * 10) / 10 : 0,
      ratingCount: agg?.count ?? 0,
    });
  },
};
