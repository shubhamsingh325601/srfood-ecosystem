import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

import { NotificationChannel, NotificationEvent } from '@/types/domain.types';

export interface NotificationDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  event: NotificationEvent;
  channel: NotificationChannel;
  title: string;
  body: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: Types.ObjectId;
  dispatchStatus: 'PENDING' | 'SENT' | 'FAILED';
  attemptCount: number;
  sentAt?: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    event: { type: String, enum: Object.values(NotificationEvent), required: true },
    channel: { type: String, enum: Object.values(NotificationChannel), required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedEntityType: { type: String },
    relatedEntityId: { type: Schema.Types.ObjectId },
    dispatchStatus: { type: String, enum: ['PENDING', 'SENT', 'FAILED'], default: 'PENDING' },
    attemptCount: { type: Number, default: 0 },
    sentAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = model<NotificationDocument>('Notification', notificationSchema);
