import { UserRole } from '@/types/domain.types';
import { buildPaginationMeta } from '@/utils/responseFormatter';

import type { ListAuditLogsInput } from './admin.dto';
import { adminRepository } from './admin.repository';

const ALL_ROLES = Object.values(UserRole);

export const adminService = {
  async dashboardSummary() {
    return adminRepository.dashboardSummary();
  },

  async listAuditLogs(input: ListAuditLogsInput) {
    const page = input.page ?? 1;
    const limit = Math.min(100, input.limit ?? 20);
    const { items, total } = await adminRepository.listAuditLogs({ entityType: input.entityType, action: input.action }, (page - 1) * limit, limit);
    return { items, meta: buildPaginationMeta(page, limit, total) };
  },

  async listRoles() {
    const counts = await adminRepository.roleCounts();
    const countMap = new Map(counts.map((c) => [c._id, c.count]));
    return ALL_ROLES.map((role) => ({ role, userCount: countMap.get(role) ?? 0 }));
  },
};
