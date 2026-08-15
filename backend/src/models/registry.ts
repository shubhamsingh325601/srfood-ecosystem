import type { Connection, Schema } from 'mongoose';

import { auditLogSchema } from '@/models/AuditLog.model';
import { categorySchema } from '@/models/Category.model';
import { cmsContentSchema } from '@/models/CmsContent.model';
import { counterSchema } from '@/models/Counter.model';
import { couponSchema } from '@/models/Coupon.model';
import { couponUsageSchema } from '@/models/CouponUsage.model';
import { invoiceSchema } from '@/models/Invoice.model';
import { menuItemSchema } from '@/models/MenuItem.model';
import { notificationSchema } from '@/models/Notification.model';
import { orderSchema } from '@/models/Order.model';
import { paymentSchema } from '@/models/Payment.model';
import { ratingSchema } from '@/models/Rating.model';
import { refreshTokenSchema } from '@/models/RefreshToken.model';
import { stationSchema } from '@/models/Station.model';
import { supportTicketSchema } from '@/models/SupportTicket.model';
import { trainScheduleSchema } from '@/models/TrainSchedule.model';
import { userSchema } from '@/models/User.model';

const MODEL_SCHEMAS: Record<string, Schema> = {
  AuditLog: auditLogSchema,
  Category: categorySchema,
  CmsContent: cmsContentSchema,
  Counter: counterSchema,
  Coupon: couponSchema,
  CouponUsage: couponUsageSchema,
  Invoice: invoiceSchema,
  MenuItem: menuItemSchema,
  Notification: notificationSchema,
  Order: orderSchema,
  Payment: paymentSchema,
  Rating: ratingSchema,
  RefreshToken: refreshTokenSchema,
  Station: stationSchema,
  SupportTicket: supportTicketSchema,
  TrainSchedule: trainScheduleSchema,
  User: userSchema,
};

/** Registers every schema on the given connection (mongoose model names must match `ref` strings). */
export function registerModels(conn: Connection): void {
  for (const [name, schema] of Object.entries(MODEL_SCHEMAS)) {
    conn.model(name, schema);
  }
}