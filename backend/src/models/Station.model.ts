import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface StationDocument {
  _id: Types.ObjectId;
  name: string;
  code?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const stationSchema = new Schema<StationDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    code: { type: String, trim: true, uppercase: true, maxlength: 10 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

stationSchema.index({ code: 1 }, { unique: true, sparse: true });
stationSchema.index({ name: 1 });

export const Station = model<StationDocument>('Station', stationSchema);
