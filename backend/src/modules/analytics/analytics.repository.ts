import { Order } from '@/models/Order.model';
import { OrderStatus, PaymentStatus } from '@/types/domain.types';

function dateFilter(from?: Date, to?: Date) {
  const filter: Record<string, Date> = {};
  if (from) filter.$gte = from;
  if (to) filter.$lte = to;
  return Object.keys(filter).length ? { createdAt: filter } : {};
}

export const analyticsRepository = {
  async revenueTrend(from?: Date, to?: Date) {
    return Order.aggregate([
      { $match: { isDeleted: false, paymentStatus: PaymentStatus.CAPTURED, ...dateFilter(from, to) } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenuePaise: { $sum: '$grandTotal' },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  async stationHeatmap(from?: Date, to?: Date) {
    return Order.aggregate([
      { $match: { isDeleted: false, ...dateFilter(from, to) } },
      { $group: { _id: '$deliveryStation', orderCount: { $sum: 1 } } },
      { $sort: { orderCount: -1 } },
      { $limit: 20 },
    ]);
  },

  async paymentBreakdown(from?: Date, to?: Date) {
    return Order.aggregate([
      { $match: { isDeleted: false, ...dateFilter(from, to) } },
      { $group: { _id: { method: '$paymentMethod', status: '$paymentStatus' }, count: { $sum: 1 }, totalPaise: { $sum: '$grandTotal' } } },
    ]);
  },

  async orderFunnel(from?: Date, to?: Date) {
    const [placed, accepted, outForDelivery, delivered, cancelled] = await Promise.all([
      Order.countDocuments({ isDeleted: false, ...dateFilter(from, to) }),
      Order.countDocuments({
        isDeleted: false,
        ...dateFilter(from, to),
        status: { $in: [OrderStatus.RESTAURANT_ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY_FOR_PICKUP, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.COMPLETED] },
      }),
      Order.countDocuments({ isDeleted: false, ...dateFilter(from, to), status: { $in: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED, OrderStatus.COMPLETED] } }),
      Order.countDocuments({ isDeleted: false, ...dateFilter(from, to), status: { $in: [OrderStatus.DELIVERED, OrderStatus.COMPLETED] } }),
      Order.countDocuments({
        isDeleted: false,
        ...dateFilter(from, to),
        status: { $in: [OrderStatus.CANCELLED_BY_PASSENGER, OrderStatus.CANCELLED_BY_RESTAURANT, OrderStatus.CANCELLED_BY_ADMIN, OrderStatus.PAYMENT_FAILED] },
      }),
    ]);
    return { placed, accepted, outForDelivery, delivered, cancelled };
  },
};
