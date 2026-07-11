import { AUTH_LOCKOUT, OTP } from '@/config/constants';
import { config } from '@/config/index';
import type { OtpPurpose } from '@/models/Otp.model';
import { sendEmail } from '@/services/email.service';
import { sendSms } from '@/services/sms.service';
import type { UserRole } from '@/types/domain.types';
import { AppError, BadRequestError, ConflictError, ForbiddenError, TooManyRequestsError, UnauthorizedError } from '@/utils/errors';
import { comparePassword, generateNumericOtp, hashPassword, sha256 } from '@/utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '@/utils/jwt';
import { logger } from '@/utils/logger';
import { parseDurationMs } from '@/utils/time';

import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  SendOtpInput,
  VerifyOtpInput,
} from './auth.dto';
import { authRepository, isMobileIdentifier } from './auth.repository';
import type { AuthenticatedUserView, AuthTokens } from './auth.types';

function toUserView(user: { _id: unknown; name: string; email: string; mobile: string; role: UserRole }): AuthenticatedUserView {
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

async function dispatchOtp(identifier: string, code: string, purpose: OtpPurpose): Promise<void> {
  const message = `Your SR Food OTP is ${code}. Valid for ${OTP.VALIDITY_MINUTES} minutes. Do not share this with anyone. (${purpose})`;
  if (isMobileIdentifier(identifier)) {
    await sendSms(identifier, message);
  } else {
    await sendEmail(identifier, 'Your SR Food verification code', `<p>${message}</p>`);
  }
}

export const authService = {
  async register(input: RegisterInput): Promise<{ userId: string }> {
    const exists = await authRepository.existsByEmailOrMobile(input.email, input.mobile);
    if (exists) throw new ConflictError('An account with this email or mobile already exists');

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      name: input.name,
      email: input.email,
      mobile: input.mobile,
      passwordHash,
    });

    await this.sendOtp({ identifier: input.mobile, purpose: 'REGISTER' });

    return { userId: user._id.toString() };
  },

  async sendOtp(input: SendOtpInput): Promise<{ expiresInMinutes: number }> {
    const existing = await authRepository.findLatestActiveOtp(input.identifier, input.purpose as OtpPurpose);
    const activeExisting = existing && existing.expiresAt.getTime() > Date.now() ? existing : undefined;

    if (activeExisting && activeExisting.resendCount >= OTP.MAX_RESENDS_PER_SESSION) {
      throw new TooManyRequestsError('Maximum OTP resend attempts reached — please try again later');
    }

    const code = config.otp.bypassCode ?? generateNumericOtp(OTP.LENGTH);
    const codeHash = sha256(code);
    const expiresAt = new Date(Date.now() + OTP.VALIDITY_MINUTES * 60_000);
    const resendCount = activeExisting ? activeExisting.resendCount + 1 : 0;

    if (existing) await authRepository.consumeOtp(existing._id.toString());

    await authRepository.createOtp({ identifier: input.identifier, purpose: input.purpose as OtpPurpose, codeHash, expiresAt, resendCount });

    if (config.otp.bypassCode) {
      logger.warn('OTP bypass active — dispatch skipped, fixed code in use', { identifier: input.identifier, purpose: input.purpose });
    } else {
      try {
        await dispatchOtp(input.identifier, code, input.purpose as OtpPurpose);
      } catch (error) {
        logger.error('Failed to dispatch OTP', { identifier: input.identifier, purpose: input.purpose, error });
        throw new AppError(502, 'OTP_DISPATCH_FAILED', 'Could not send verification code — please try again shortly');
      }
    }

    return { expiresInMinutes: OTP.VALIDITY_MINUTES };
  },

  async verifyOtp(
    input: VerifyOtpInput,
    context: { ipAddress?: string; userAgent?: string },
  ): Promise<{ verified: true; tokens?: AuthTokens; user?: AuthenticatedUserView }> {
    const otp = await authRepository.findLatestActiveOtp(input.identifier, input.purpose as OtpPurpose);
    if (!otp || otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestError('OTP has expired or was not requested — please request a new one');
    }
    if (otp.attemptCount >= 5) {
      throw new TooManyRequestsError('Too many incorrect attempts — please request a new OTP');
    }

    if (otp.codeHash !== sha256(input.code)) {
      await authRepository.incrementOtpAttempt(otp._id.toString());
      throw new BadRequestError('Incorrect OTP');
    }

    await authRepository.consumeOtp(otp._id.toString());

    if (input.purpose === 'REGISTER') {
      const user = await authRepository.findByIdentifier(input.identifier);
      if (!user) throw new BadRequestError('No pending registration found for this identifier');

      await authRepository.markVerified(user._id.toString(), 'isMobileVerified');
      await authRepository.resetFailedLoginTracking(user._id.toString());

      const tokens = await issueTokenPair(user._id.toString(), user.role, context);
      return { verified: true, tokens, user: toUserView(user) };
    }

    return { verified: true };
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

  async forgotPassword(input: ForgotPasswordInput): Promise<{ expiresInMinutes: number }> {
    const user = await authRepository.findByIdentifier(input.identifier);
    if (!user) {
      // Do not reveal account existence — respond as if it succeeded.
      return { expiresInMinutes: OTP.VALIDITY_MINUTES };
    }
    return this.sendOtp({ identifier: input.identifier, purpose: 'FORGOT_PASSWORD' });
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const otp = await authRepository.findLatestActiveOtp(input.identifier, 'FORGOT_PASSWORD');
    if (!otp || otp.expiresAt.getTime() < Date.now()) {
      throw new BadRequestError('OTP has expired or was not requested — please request a new one');
    }
    if (otp.attemptCount >= 5) {
      throw new TooManyRequestsError('Too many incorrect attempts — please request a new OTP');
    }
    if (otp.codeHash !== sha256(input.code)) {
      await authRepository.incrementOtpAttempt(otp._id.toString());
      throw new BadRequestError('Incorrect OTP');
    }
    await authRepository.consumeOtp(otp._id.toString());

    const user = await authRepository.findByIdentifier(input.identifier);
    if (!user) throw new BadRequestError('No account found for this identifier');

    const passwordHash = await hashPassword(input.newPassword);
    await authRepository.updatePasswordHash(user._id.toString(), passwordHash);
    await authRepository.revokeAllRefreshTokensForUser(user._id.toString());
  },
};
