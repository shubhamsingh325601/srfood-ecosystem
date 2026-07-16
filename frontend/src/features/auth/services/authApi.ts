import { api } from "@/lib/axios";
import type { AuthUser } from "@/store/authStore";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function register(input: {
  name: string;
  mobile: string;
  password: string;
}): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const { data } = await api.post("/auth/register", input);
  return data.data;
}

export async function login(
  mobile: string,
  password: string,
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const { data } = await api.post("/auth/login", { identifier: mobile, password });
  return data.data;
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refreshToken });
}
