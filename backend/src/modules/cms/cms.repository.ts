import { CmsContent } from '@/models/CmsContent.model';
import type { CmsContentType } from '@/types/domain.types';

export const cmsRepository = {
  async find(type: CmsContentType) {
    return CmsContent.findOne({ type });
  },

  async upsert(type: CmsContentType, data: unknown, updatedBy: string) {
    return CmsContent.findOneAndUpdate(
      { type },
      { data, updatedBy, publishedAt: new Date(), $inc: { version: 1 } },
      { upsert: true, new: true },
    );
  },
};
