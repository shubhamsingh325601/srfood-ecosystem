import type { UserRole } from '@/types/domain.types';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthenticatedUserView {
  id: string;
  name: string;
  email?: string;
  mobile: string;
  role: UserRole;
}
