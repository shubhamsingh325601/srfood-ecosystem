import type { FilterQuery } from 'mongoose';

import { AuditLog, type AuditLogDocument } from '@/models/AuditLog.model';
import { MenuItem } from '@/models/MenuItem.model';
import { Order } from '@/models/Order.model';
import { User } from '@/models/User.model';
import { OrderDisplayStatus, ORDER_STATUS_DISPLAY_MAP, PaymentStatus } from '@/types/domain.types';

export const adminRepository = {
  async dashboardSummary() {
    const [revenueAgg, orderCount, pendingStatuses, userCount, menuItemCount, recentOrders] = await Promise.all([
      Order.aggregate<{ total: number }>([
        { $match: { isDeleted: false, paymentStatus: PaymentStatus.CAPTURED } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
      Order.countDocuments({ isDeleted: false }),
      Order.find({ isDeleted: false }, { status: 1 }),
      User.countDocuments({ isDeleted: false }),
      MenuItem.countDocuments({ isDeleted: false }),
      Order.find({ isDeleted: false }).sort({ createdAt: -1 }).limit(5),
    ]);

    const pendingOrders = pendingStatuses.filter((o) => {
      const display = ORDER_STATUS_DISPLAY_MAP[o.status];
      return display !== OrderDisplayStatus.DELIVERED && display !== OrderDisplayStatus.CANCELLED;
    }).length;

    return {
      totalRevenuePaise: revenueAgg[0]?.total ?? 0,
      totalOrders: orderCount,
      pendingOrders,
      totalUsers: userCount,
      totalMenuItems: menuItemCount,
      recentOrders,
    };
  },

  async listAuditLogs(filters: { entityType?: string; action?: string }, skip: number, limit: number) {
    const query: FilterQuery<AuditLogDocument> = {};
    if (filters.entityType) query.entityType = filters.entityType;
    if (filters.action) query.action = filters.action;
    const [items, total] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      AuditLog.countDocuments(query),
    ]);
    return { items, total };
  },

  async roleCounts() {
    return User.aggregate<{ _id: string; count: number }>([
      { $match: { isDeleted: false } },
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);
  },
};
