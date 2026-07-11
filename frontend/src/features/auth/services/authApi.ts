import { api } from "@/lib/axios";
import type { AuthUser } from "@/store/authStore";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function register(input: {
  name: string;
  email: string;
  mobile: string;
  password: string;
}): Promise<{ userId: string }> {
  const { data } = await api.post("/auth/register", input);
  return data.data;
}

export async function login(
  identifier: string,
  password: string,
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const { data } = await api.post("/auth/login", { identifier, password });
  return data.data;
}

export async function verifyRegisterOtp(
  mobile: string,
  code: string,
): Promise<{ tokens: AuthTokens; user: AuthUser }> {
  const { data } = await api.post("/auth/verify-otp", {
    identifier: mobile,
    purpose: "REGISTER",
    code,
  });
  return data.data;
}

export async function resendOtp(mobile: string): Promise<void> {
  await api.post("/auth/send-otp", { identifier: mobile, purpose: "REGISTER" });
}

export async function forgotPassword(identifier: string): Promise<void> {
  await api.post("/auth/forgot-password", { identifier });
}

export async function resetPassword(
  identifier: string,
  code: string,
  newPassword: string,
): Promise<void> {
  await api.post("/auth/reset-password", { identifier, code, newPassword });
}

export async function logoutRequest(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refreshToken });
}
