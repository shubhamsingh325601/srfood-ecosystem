import { createHash } from 'crypto';

import bcrypt from 'bcrypt';

import { config } from '@/config/index';

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, config.security.bcryptSaltRounds);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** SHA-256 is intentionally used (not bcrypt) for refresh-token lookups — tokens are already high-entropy, and this is hashed/compared on every request, so speed matters more than bcrypt's deliberate slowness. */
export function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}
