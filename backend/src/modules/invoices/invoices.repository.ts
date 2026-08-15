import { getModel } from '@/config/database';
import type { CounterDocument } from '@/models/Counter.model';
import type { InvoiceDocument } from '@/models/Invoice.model';

export const invoicesRepository = {
  async findByOrderId(orderId: string) {
    const Invoice = getModel<InvoiceDocument>('Invoice');
    return Invoice.findOne({ orderId, isDeleted: false });
  },

  async create(data: Record<string, unknown>) {
    const Invoice = getModel<InvoiceDocument>('Invoice');
    return Invoice.create(data);
  },

  async nextInvoiceNumber(): Promise<string> {
    const Counter = getModel<CounterDocument>('Counter');
    const year = new Date().getFullYear();
    const key = `invoice:${year}`;
    const counter = await Counter.findByIdAndUpdate(key, { $inc: { seq: 1 } }, { upsert: true, new: true });
    return `INV-${year}-${String(counter.seq).padStart(5, '0')}`;
  },
};