import type { Types } from 'mongoose';
import { Schema, model } from 'mongoose';

export interface RefreshTokenDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  tokenHash: string;
  isRevoked: boolean;
  replacedByTokenId?: Types.ObjectId;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true, unique: true },
    isRevoked: { type: Boolean, default: false },
    replacedByTokenId: { type: Schema.Types.ObjectId, ref: 'RefreshToken' },
    expiresAt: { type: Date, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'refreshTokens' },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = model<RefreshTokenDocument>('RefreshToken', refreshTokenSchema);
