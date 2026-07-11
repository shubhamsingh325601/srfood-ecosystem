import { Order } from '@/models/Order.model';
import { User } from '@/models/User.model';

function dateFilter(from?: Date, to?: Date) {
  const filter: Record<string, Date> = {};
  if (from) filter.$gte = from;
  if (to) filter.$lte = to;
  return Object.keys(filter).length ? { createdAt: filter } : {};
}

export const reportsRepository = {
  async ordersReport(from?: Date, to?: Date) {
    return Order.find({ isDeleted: false, ...dateFilter(from, to) })
      .select('orderId status paymentStatus grandTotal createdAt')
      .sort({ createdAt: -1 })
      .limit(1000);
  },

  async revenueReport(from?: Date, to?: Date) {
    return Order.aggregate([
      { $match: { isDeleted: false, ...dateFilter(from, to) } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenuePaise: { $sum: '$grandTotal' }, orderCount: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  },

  async usersReport(from?: Date, to?: Date) {
    return User.aggregate([
      { $match: { isDeleted: false, ...dateFilter(from, to) } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, newUsers: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
  },
};
