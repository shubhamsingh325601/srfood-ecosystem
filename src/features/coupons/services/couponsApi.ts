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
