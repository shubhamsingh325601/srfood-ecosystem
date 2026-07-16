import { AUTH_LOCKOUT } from '@/config/constants';
import { config } from '@/config/index';
import type { UserRole } from '@/types/domain.types';
import { ConflictError, ForbiddenError, UnauthorizedError } from '@/utils/errors';
import { comparePassword, hashPassword, sha256 } from '@/utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { parseDurationMs } from '@/utils/time';

import type { LoginInput, RegisterInput } from './auth.dto';
import { authRepository } from './auth.repository';
import type { AuthenticatedUserView, AuthTokens } from './auth.types';

function toUserView(user: { _id: unknown; name: string; email?: string; mobile: string; role: UserRole }): AuthenticatedUserView {
  return { id: String(user._id), name: user.name, email: user.email, mobile: user.mobile, role: user.role };
}

async function issueTokenPair(
  userId: string,
  role: UserRole,
  context: { ipAddress?: string; userAgent?: string },
): Promise<AuthTokens> {
  const expiresAt = new Date(Date.now() + parseDurationMs(config.jwt.refreshExpiry));
  const doc = await authRepository.createRefreshToken({
    userId,
    tokenHash: 'pending',
    expiresAt,
    ipAddress: context.ipAddress,
    userAgent: context.userAgent,
  });

  const refreshToken = signRefreshToken({ sub: userId, tokenId: doc._id.toString() });
  doc.tokenHash = sha256(refreshToken);
  await doc.save();

  const accessToken = signAccessToken({ sub: userId, role });

  return { accessToken, refreshToken };
}

export const authService = {
  async register(
    input: RegisterInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<{ tokens: AuthTokens; user: AuthenticatedUserView }> {
    const existing = await authRepository.findByMobile(input.mobile);
    if (existing) {
      throw new ConflictError('An account with this mobile number already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({ name: input.name, mobile: input.mobile, passwordHash });

    const tokens = await issueTokenPair(user._id.toString(), user.role, context);
    return { tokens, user: toUserView(user) };
  },

  async login(input: LoginInput, context: { ipAddress?: string; userAgent?: string }): Promise<{ tokens: AuthTokens; user: AuthenticatedUserView }> {
    const user = await authRepository.findByIdentifier(input.identifier);
    if (!user) throw new UnauthorizedError('Invalid credentials');

    if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
      throw new ForbiddenError(`Account locked due to repeated failed logins. Try again after ${user.lockedUntil.toISOString()}`);
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);
    if (!passwordMatches) {
      const updated = await authRepository.incrementFailedLogin(user._id.toString());
      if (updated && updated.failedLoginCount >= AUTH_LOCKOUT.MAX_FAILED_ATTEMPTS) {
        await authRepository.lockAccount(user._id.toString(), new Date(Date.now() + AUTH_LOCKOUT.COOLDOWN_MINUTES * 60_000));
      }
      throw new UnauthorizedError('Invalid credentials');
    }

    await authRepository.resetFailedLoginTracking(user._id.toString());

    const tokens = await issueTokenPair(user._id.toString(), user.role, context);
    return { tokens, user: toUserView(user) };
  },

  async refresh(refreshTokenInput: string, context: { ipAddress?: string; userAgent?: string }): Promise<AuthTokens> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshTokenInput);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const doc = await authRepository.findRefreshTokenById(payload.tokenId);
    if (!doc || doc.tokenHash !== sha256(refreshTokenInput)) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    if (doc.isRevoked) {
      await authRepository.revokeAllRefreshTokensForUser(payload.sub);
      throw new UnauthorizedError('Refresh token reuse detected — all sessions revoked, please log in again');
    }

    if (doc.expiresAt.getTime() < Date.now()) {
      throw new UnauthorizedError('Refresh token expired');
    }

    const user = await authRepository.findById(payload.sub);
    if (!user || user.isDeleted || user.isBlocked) {
      throw new UnauthorizedError('Account no longer active');
    }

    const tokens = await issueTokenPair(user._id.toString(), user.role, context);
    const newDoc = await authRepository.findRefreshTokenById(
      verifyRefreshToken(tokens.refreshToken).tokenId,
    );
    await authRepository.revokeRefreshToken(doc._id.toString(), newDoc?._id.toString());

    return tokens;
  },

  async logout(refreshTokenInput: string): Promise<void> {
    try {
      const payload = verifyRefreshToken(refreshTokenInput);
      await authRepository.revokeRefreshToken(payload.tokenId);
    } catch {
      // Idempotent — an already-invalid token still counts as "logged out".
    }
  },
};
