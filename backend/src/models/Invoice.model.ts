import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface InvoiceDocument {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  invoiceNumber: string;
  passengerId: Types.ObjectId;
  subtotalPaise: number;
  gstAmountPaise: number;
  deliveryFeePaise: number;
  platformFeePaise: number;
  discountPaise: number;
  grandTotalPaise: number;
  pdfUrl?: string;
  generatedAt: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const invoiceSchema = new Schema<InvoiceDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    invoiceNumber: { type: String, required: true, unique: true },
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subtotalPaise: { type: Number, required: true },
    gstAmountPaise: { type: Number, required: true },
    deliveryFeePaise: { type: Number, required: true },
    platformFeePaise: { type: Number, required: true },
    discountPaise: { type: Number, default: 0 },
    grandTotalPaise: { type: Number, required: true },
    pdfUrl: { type: String },
    generatedAt: { type: Date, required: true, default: Date.now },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Invoice = model<InvoiceDocument>('Invoice', invoiceSchema);
