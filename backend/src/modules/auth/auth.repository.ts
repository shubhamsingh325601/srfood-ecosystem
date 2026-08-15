import { getModel } from '@/config/database';
import type { RefreshTokenDocument } from '@/models/RefreshToken.model';
import type { UserDocument } from '@/models/User.model';

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export function isMobileIdentifier(identifier: string): boolean {
  return MOBILE_REGEX.test(identifier);
}

export const authRepository = {
  async findByEmail(email: string) {
    const User = getModel<UserDocument>('User');
    return User.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+passwordHash');
  },

  async findByMobile(mobile: string) {
    const User = getModel<UserDocument>('User');
    return User.findOne({ mobile, isDeleted: false }).select('+passwordHash');
  },

  async findByIdentifier(identifier: string) {
    return isMobileIdentifier(identifier) ? this.findByMobile(identifier) : this.findByEmail(identifier);
  },

  async createUser(data: { name: string; mobile: string; passwordHash: string }) {
    const User = getModel<UserDocument>('User');
    return User.create(data);
  },

  async findById(userId: string) {
    const User = getModel<UserDocument>('User');
    return User.findById(userId);
  },

  async incrementFailedLogin(userId: string) {
    const User = getModel<UserDocument>('User');
    return User.findByIdAndUpdate(userId, { $inc: { failedLoginCount: 1 } }, { new: true });
  },

  async lockAccount(userId: string, until: Date) {
    const User = getModel<UserDocument>('User');
    await User.findByIdAndUpdate(userId, { lockedUntil: until });
  },

  async resetFailedLoginTracking(userId: string) {
    const User = getModel<UserDocument>('User');
    await User.findByIdAndUpdate(userId, { failedLoginCount: 0, lockedUntil: undefined, lastLoginAt: new Date() });
  },

  async updatePasswordHash(userId: string, passwordHash: string) {
    const User = getModel<UserDocument>('User');
    await User.findByIdAndUpdate(userId, { passwordHash });
  },

  async createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date; ipAddress?: string; userAgent?: string }) {
    const RefreshToken = getModel<RefreshTokenDocument>('RefreshToken');
    return RefreshToken.create(data);
  },

  async findRefreshTokenById(tokenId: string) {
    const RefreshToken = getModel<RefreshTokenDocument>('RefreshToken');
    return RefreshToken.findById(tokenId);
  },

  async revokeRefreshToken(tokenId: string, replacedByTokenId?: string) {
    const RefreshToken = getModel<RefreshTokenDocument>('RefreshToken');
    await RefreshToken.findByIdAndUpdate(tokenId, { isRevoked: true, ...(replacedByTokenId ? { replacedByTokenId } : {}) });
  },

  async revokeAllRefreshTokensForUser(userId: string) {
    const RefreshToken = getModel<RefreshTokenDocument>('RefreshToken');
    await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
  },
};

export type { UserDocument };