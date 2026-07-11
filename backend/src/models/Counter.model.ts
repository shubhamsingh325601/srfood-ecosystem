import { Schema, model } from 'mongoose';

interface CounterDocument {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<CounterDocument>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

export const Counter = model<CounterDocument>('Counter', counterSchema);
