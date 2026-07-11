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
