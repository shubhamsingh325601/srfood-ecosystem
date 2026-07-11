import { Counter } from '@/models/Counter.model';
import { Invoice } from '@/models/Invoice.model';

export const invoicesRepository = {
  async findByOrderId(orderId: string) {
    return Invoice.findOne({ orderId, isDeleted: false });
  },

  async create(data: Record<string, unknown>) {
    return Invoice.create(data);
  },

  async nextInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const key = `invoice:${year}`;
    const counter = await Counter.findByIdAndUpdate(key, { $inc: { seq: 1 } }, { upsert: true, new: true });
    return `INV-${year}-${String(counter.seq).padStart(5, '0')}`;
  },
};
