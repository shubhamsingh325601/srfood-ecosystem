import { api } from "@/lib/axios";
import type { ApiOrder, CreateOrderPayload, CreateOrderResult } from "../types";

export async function createOrder(
  payload: CreateOrderPayload,
  idempotencyKey: string,
): Promise<CreateOrderResult> {
  const { data } = await api.post("/orders", payload, {
    headers: { "Idempotency-Key": idempotencyKey },
  });
  return data.data;
}

export async function listOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}): Promise<{ items: ApiOrder[]; meta: unknown }> {
  const { data } = await api.get("/orders", { params });
  return { items: data.data, meta: data.meta };
}

export async function getOrder(id: string): Promise<ApiOrder> {
  const { data } = await api.get(`/orders/${id}`);
  return data.data;
}

export async function cancelOrder(id: string, reason: string): Promise<ApiOrder> {
  const { data } = await api.post(`/orders/${id}/cancel`, { reason });
  return data.data;
}

export async function reorder(id: string): Promise<unknown> {
  const { data } = await api.post(`/orders/${id}/reorder`);
  return data.data;
}
