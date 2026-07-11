import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

import { SupportTicketPriority, SupportTicketStatus } from '@/types/domain.types';

export interface SupportTicketDocument {
  _id: Types.ObjectId;
  ticketNumber: string;
  userId?: Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  category: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  assignedTo?: Types.ObjectId;
  orderId?: Types.ObjectId;
  resolutionNote?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<SupportTicketDocument>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String },
    subject: { type: String, required: true, maxlength: 200 },
    message: { type: String, required: true, minlength: 5, maxlength: 1000 },
    category: { type: String, default: 'GENERAL' },
    status: { type: String, enum: Object.values(SupportTicketStatus), default: SupportTicketStatus.OPEN },
    priority: { type: String, enum: Object.values(SupportTicketPriority), default: SupportTicketPriority.MEDIUM },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    resolutionNote: { type: String },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'supportTickets' },
);

supportTicketSchema.index({ status: 1 });

export const SupportTicket = model<SupportTicketDocument>('SupportTicket', supportTicketSchema);
