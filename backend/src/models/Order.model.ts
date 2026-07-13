import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

import { OrderStatus, PaymentMethod, PaymentMode, PaymentStatus } from '@/types/domain.types';

export interface OrderItemCustomizationSelection {
  groupName: string;
  optionLabel: string;
  priceDeltaPaise: number;
}

export interface OrderItemSnapshot {
  menuItemId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  customizations: OrderItemCustomizationSelection[];
  specialNote?: string;
  itemTotal: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  changedAt: Date;
  changedBy?: Types.ObjectId;
  note?: string;
}

export interface OrderDocument {
  _id: Types.ObjectId;
  orderId: string;
  passengerId: Types.ObjectId;
  trainNumber?: string;
  pnr?: string;
  coach?: string;
  seat?: string;
  boardingStation?: string;
  deliveryStation: string;
  deliveryStationEta?: Date;
  items: OrderItemSnapshot[];
  subtotal: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  gstAmountPaise: number;
  couponCode?: string;
  couponDiscountPaise: number;
  grandTotal: number;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryEntry[];
  paymentMode: PaymentMode;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  /** Customer-submitted UPI transaction/reference number (UTR), denormalized from Payment for admin-list reconciliation. */
  utrReference?: string;
  idempotencyKey: string;
  cancellationReason?: string;
  isDeleted: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemCustomizationSchema = new Schema<OrderItemCustomizationSelection>(
  { groupName: String, optionLabel: String, priceDeltaPaise: Number },
  { _id: false },
);

const orderItemSchema = new Schema<OrderItemSnapshot>(
  {
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    customizations: { type: [orderItemCustomizationSchema], default: [] },
    specialNote: { type: String, maxlength: 300 },
    itemTotal: { type: Number, required: true },
  },
  { _id: false },
);

const statusHistorySchema = new Schema<OrderStatusHistoryEntry>(
  {
    status: { type: String, enum: Object.values(OrderStatus), required: true },
    changedAt: { type: Date, required: true, default: Date.now },
    changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    note: { type: String },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDocument>(
  {
    orderId: { type: String, required: true, unique: true },
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trainNumber: { type: String },
    pnr: { type: String },
    coach: { type: String },
    seat: { type: String },
    boardingStation: { type: String },
    deliveryStation: { type: String, required: true },
    deliveryStationEta: { type: Date },
    items: { type: [orderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    subtotal: { type: Number, required: true },
    deliveryFeePaise: { type: Number, required: true, default: 0 },
    platformFeePaise: { type: Number, required: true, default: 0 },
    gstAmountPaise: { type: Number, required: true, default: 0 },
    couponCode: { type: String },
    couponDiscountPaise: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: { type: String, enum: Object.values(OrderStatus), required: true, default: OrderStatus.PENDING_PAYMENT },
    statusHistory: { type: [statusHistorySchema], default: [] },
    paymentMode: { type: String, enum: Object.values(PaymentMode), required: true },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    paymentStatus: { type: String, enum: Object.values(PaymentStatus), required: true, default: PaymentStatus.PENDING },
    utrReference: { type: String },
    idempotencyKey: { type: String, required: true, unique: true },
    cancellationReason: { type: String },
    isDeleted: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

orderSchema.index({ passengerId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });

export const Order = model<OrderDocument>('Order', orderSchema);
