import { Counter } from '@/models/Counter.model';

/** Human-readable, sequential, collision-free order id: RB-YYYY-NNNNN (TRD-style). */
export async function generateOrderId(): Promise<string> {
  const year = new Date().getFullYear();
  const key = `order:${year}`;
  const counter = await Counter.findByIdAndUpdate(key, { $inc: { seq: 1 } }, { upsert: true, new: true });
  const seq = String(counter.seq).padStart(5, '0');
  return `RB-${year}-${seq}`;
}
