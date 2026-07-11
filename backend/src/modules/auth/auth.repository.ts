import { Otp, type OtpPurpose } from '@/models/Otp.model';
import { RefreshToken } from '@/models/RefreshToken.model';
import { User, type UserDocument } from '@/models/User.model';

const MOBILE_REGEX = /^[6-9]\d{9}$/;

export function isMobileIdentifier(identifier: string): boolean {
  return MOBILE_REGEX.test(identifier);
}

export const authRepository = {
  async findByEmail(email: string) {
    return User.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+passwordHash');
  },

  async findByMobile(mobile: string) {
    return User.findOne({ mobile, isDeleted: false }).select('+passwordHash');
  },

  async findByIdentifier(identifier: string) {
    return isMobileIdentifier(identifier) ? this.findByMobile(identifier) : this.findByEmail(identifier);
  },

  async existsByEmailOrMobile(email: string, mobile: string) {
    return User.exists({ $or: [{ email: email.toLowerCase() }, { mobile }], isDeleted: false });
  },

  async createUser(data: { name: string; email: string; mobile: string; passwordHash: string }) {
    return User.create(data);
  },

  async findById(userId: string) {
    return User.findById(userId);
  },

  async incrementFailedLogin(userId: string) {
    return User.findByIdAndUpdate(userId, { $inc: { failedLoginCount: 1 } }, { new: true });
  },

  async lockAccount(userId: string, until: Date) {
    await User.findByIdAndUpdate(userId, { lockedUntil: until });
  },

  async resetFailedLoginTracking(userId: string) {
    await User.findByIdAndUpdate(userId, { failedLoginCount: 0, lockedUntil: undefined, lastLoginAt: new Date() });
  },

  async updatePasswordHash(userId: string, passwordHash: string) {
    await User.findByIdAndUpdate(userId, { passwordHash });
  },

  async markVerified(userId: string, field: 'isMobileVerified' | 'isEmailVerified') {
    await User.findByIdAndUpdate(userId, { [field]: true });
  },

  async createOtp(data: { identifier: string; purpose: OtpPurpose; codeHash: string; expiresAt: Date; resendCount: number }) {
    return Otp.create(data);
  },

  async findLatestActiveOtp(identifier: string, purpose: OtpPurpose) {
    return Otp.findOne({ identifier, purpose, isConsumed: false }).sort({ createdAt: -1 });
  },

  async consumeOtp(otpId: string) {
    await Otp.findByIdAndUpdate(otpId, { isConsumed: true });
  },

  async incrementOtpAttempt(otpId: string) {
    await Otp.findByIdAndUpdate(otpId, { $inc: { attemptCount: 1 } });
  },

  async createRefreshToken(data: { userId: string; tokenHash: string; expiresAt: Date; ipAddress?: string; userAgent?: string }) {
    return RefreshToken.create(data);
  },

  async findRefreshTokenById(tokenId: string) {
    return RefreshToken.findById(tokenId);
  },

  async revokeRefreshToken(tokenId: string, replacedByTokenId?: string) {
    await RefreshToken.findByIdAndUpdate(tokenId, { isRevoked: true, ...(replacedByTokenId ? { replacedByTokenId } : {}) });
  },

  async revokeAllRefreshTokensForUser(userId: string) {
    await RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true });
  },
};

export type { UserDocument };
