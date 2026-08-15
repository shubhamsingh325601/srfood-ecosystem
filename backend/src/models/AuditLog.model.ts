import type { Types } from 'mongoose';
import { Schema } from 'mongoose';

export interface AuditLogDocument {
  actorId: Types.ObjectId;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: Types.ObjectId;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  createdAt: Date;
}

/** Immutable, 5-year retention per PRD §11.20 — no updatedAt/isDeleted; never mutated after creation. */
export const auditLogSchema = new Schema<AuditLogDocument>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    entityType: { type: String, required: true, index: true },
    entityId: { type: Schema.Types.ObjectId, required: true, index: true },
    before: { type: Schema.Types.Mixed },
    after: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'auditLogs' },
);

auditLogSchema.index({ createdAt: -1 });
