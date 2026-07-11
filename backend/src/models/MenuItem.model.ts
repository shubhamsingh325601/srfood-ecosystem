import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface CustomizationOption {
  label: string;
  priceDeltaPaise: number;
}

export interface CustomizationGroup {
  name: string;
  isRequired: boolean;
  maxSelect: number;
  options: CustomizationOption[];
}

export interface MenuItemDocument {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  name: string;
  shortDescription?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isBestseller: boolean;
  ingredients: string[];
  isAvailable: boolean;
  customizations: CustomizationGroup[];
  prepTimeMinutes: number;
  avgRating: number;
  ratingCount: number;
  isDeleted: boolean;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const customizationOptionSchema = new Schema<CustomizationOption>(
  { label: { type: String, required: true }, priceDeltaPaise: { type: Number, required: true, default: 0 } },
  { _id: false },
);

const customizationGroupSchema = new Schema<CustomizationGroup>(
  {
    name: { type: String, required: true },
    isRequired: { type: Boolean, default: false },
    maxSelect: { type: Number, default: 1 },
    options: { type: [customizationOptionSchema], default: [] },
  },
  { _id: false },
);

const menuItemSchema = new Schema<MenuItemDocument>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    shortDescription: { type: String, maxlength: 300 },
    description: { type: String, maxlength: 2000 },
    price: { type: Number, required: true, min: 100, max: 999900 },
    imageUrl: { type: String },
    isVeg: { type: Boolean, required: true, default: true },
    isBestseller: { type: Boolean, default: false },
    ingredients: { type: [String], default: [] },
    isAvailable: { type: Boolean, default: true },
    customizations: { type: [customizationGroupSchema], default: [] },
    prepTimeMinutes: { type: Number, default: 20 },
    avgRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'menuItems' },
);

menuItemSchema.index({ categoryId: 1 });
menuItemSchema.index({ isAvailable: 1 });

export const MenuItem = model<MenuItemDocument>('MenuItem', menuItemSchema);
