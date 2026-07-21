import { api } from "@/lib/axios";

export interface ApiCoupon {
  _id: string;
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscountPaise?: number;
  minOrderValuePaise: number;
}

export async function listActiveCoupons(): Promise<ApiCoupon[]> {
  const { data } = await api.get("/coupons");
  return data.data;
}

export interface CouponValidationResult {
  discountPaise: number;
  code: string;
}

export async function validateCoupon(
  code: string,
  subtotalPaise: number,
): Promise<CouponValidationResult> {
  const { data } = await api.post("/coupons/validate", { code, subtotalPaise });
  return data.data;
}

export interface AdminCoupon extends ApiCoupon {
  isActive: boolean;
  validFrom: string;
  validUntil: string;
  usageLimitTotal?: number;
  usageLimitPerUser: number;
}

export interface CouponPayload {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  maxDiscountPaise?: number;
  minOrderValuePaise: number;
  validFrom: string;
  validUntil: string;
  usageLimitTotal?: number;
  usageLimitPerUser: number;
  isActive?: boolean;
}

export async function listAllCoupons(): Promise<AdminCoupon[]> {
  const { data } = await api.get("/admin/coupons");
  return data.data;
}

export async function createCoupon(payload: CouponPayload): Promise<AdminCoupon> {
  const { data } = await api.post("/admin/coupons", payload);
  return data.data;
}

export async function updateCoupon(
  id: string,
  payload: Partial<CouponPayload>,
): Promise<AdminCoupon> {
  const { data } = await api.put(`/admin/coupons/${id}`, payload);
  return data.data;
}

export async function deleteCoupon(id: string): Promise<void> {
  await api.delete(`/admin/coupons/${id}`);
}
