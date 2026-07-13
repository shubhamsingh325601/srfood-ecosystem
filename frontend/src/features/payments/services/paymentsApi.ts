import { api } from "@/lib/axios";
import type { ApiOrder } from "@/features/orders/types";

export async function submitPaymentReference(orderId: string, utr: string): Promise<ApiOrder> {
  const { data } = await api.post(`/payments/${orderId}/reference`, { utr });
  return data.data;
}

export async function declinePayment(orderId: string): Promise<ApiOrder> {
  const { data } = await api.post(`/payments/${orderId}/decline`);
  return data.data;
}
