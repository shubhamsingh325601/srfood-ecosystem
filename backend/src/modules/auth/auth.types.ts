import type { UserRole } from '@/types/domain.types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUserView {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
}

export type OtpPurposeValue = 'REGISTER' | 'LOGIN' | 'FORGOT_PASSWORD' | 'CHANGE_MOBILE' | 'SENSITIVE_ACTION';
