import { createHash } from 'crypto';

import bcrypt from 'bcrypt';

import { config } from '@/config/index';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, config.security.bcryptSaltRounds);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateNumericOtp(length: number): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i += 1) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/** SHA-256 is intentionally used (not bcrypt) for OTPs and refresh-token lookups — both are already high-entropy or attempt-capped, and these are hashed/compared on every request, so speed matters more than bcrypt's deliberate slowness. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
