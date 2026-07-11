import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

import { CmsContentType } from '@/types/domain.types';

export interface CmsContentDocument {
  _id: Types.ObjectId;
  type: CmsContentType;
  data: unknown;
  version: number;
  isPublished: boolean;
  publishedAt?: Date;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const cmsContentSchema = new Schema<CmsContentDocument>(
  {
    type: { type: String, enum: Object.values(CmsContentType), required: true, unique: true },
    data: { type: Schema.Types.Mixed, required: true },
    version: { type: Number, default: 1 },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'cmsContent' },
);

export const CmsContent = model<CmsContentDocument>('CmsContent', cmsContentSchema);
