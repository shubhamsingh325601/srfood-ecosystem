import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface CategoryDocument {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<CategoryDocument>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, maxlength: 500 },
    imageUrl: { type: String },
    icon: { type: String },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Category = model<CategoryDocument>('Category', categorySchema);
