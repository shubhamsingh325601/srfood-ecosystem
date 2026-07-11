import { CmsContentType } from '@/types/domain.types';
import { NotFoundError } from '@/utils/errors';

import { cmsRepository } from './cms.repository';

async function getOrThrow(type: CmsContentType) {
  const content = await cmsRepository.find(type);
  if (!content) throw new NotFoundError(`CMS content for "${type}" has not been published yet`);
  return content.data;
}

export const cmsService = {
  getHomepage: () => getOrThrow(CmsContentType.HOMEPAGE),
  getFaqs: () => getOrThrow(CmsContentType.FAQ),
  getPrivacyPolicy: () => getOrThrow(CmsContentType.LEGAL_PRIVACY),
  getTerms: () => getOrThrow(CmsContentType.LEGAL_TERMS),
  getSettings: () => getOrThrow(CmsContentType.SETTINGS),

  async update(type: CmsContentType, data: unknown, updatedBy: string) {
    const updated = await cmsRepository.upsert(type, data, updatedBy);
    return updated.data;
  },
};
