import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface RatingDocument {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  passengerId: Types.ObjectId;
  menuItemId?: Types.ObjectId;
  rating: number;
  reviewText?: string;
  photos: string[];
  isFeatured: boolean;
  isHidden: boolean;
  editWindowExpiresAt: Date;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ratingSchema = new Schema<RatingDocument>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    passengerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, maxlength: 1000 },
    photos: { type: [String], default: [] },
    isFeatured: { type: Boolean, default: false },
    isHidden: { type: Boolean, default: false },
    editWindowExpiresAt: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

ratingSchema.index({ menuItemId: 1, createdAt: -1 });
ratingSchema.index({ orderId: 1, passengerId: 1, menuItemId: 1 }, { unique: true });

export const Rating = model<RatingDocument>('Rating', ratingSchema);
