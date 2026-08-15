import { getModel } from '@/config/database';
import type { CmsContentDocument } from '@/models/CmsContent.model';
import type { CmsContentType } from '@/types/domain.types';

export const cmsRepository = {
  async find(type: CmsContentType) {
    const CmsContent = getModel<CmsContentDocument>('CmsContent');
    return CmsContent.findOne({ type });
  },

  async upsert(type: CmsContentType, data: unknown, updatedBy: string) {
    const CmsContent = getModel<CmsContentDocument>('CmsContent');
    return CmsContent.findOneAndUpdate(
      { type },
      { data, updatedBy, publishedAt: new Date(), $inc: { version: 1 } },
      { upsert: true, new: true },
    );
  },
};