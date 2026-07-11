import type { Types } from 'mongoose';

import { AuditLog } from '@/models/AuditLog.model';

export interface RecordAuditLogInput {
  actorId: Types.ObjectId | string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: Types.ObjectId | string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
}

/** Every admin-mutating action must call this — CLAUDE.md §4 "no exceptions" rule. */
export async function recordAuditLog(input: RecordAuditLogInput): Promise<void> {
  await AuditLog.create({
    actorId: input.actorId,
    actorRole: input.actorRole,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    before: input.before,
    after: input.after,
    ipAddress: input.ipAddress,
  });
}
