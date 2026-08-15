import { Schema } from 'mongoose';

export interface CounterDocument {
  _id: string;
  seq: number;
}

export const counterSchema = new Schema<CounterDocument>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
