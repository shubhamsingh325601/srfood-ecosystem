import { api } from "@/lib/axios";

export interface DashboardSummary {
  totalRevenuePaise: number;
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  totalMenuItems: number;
  recentOrders: { _id: string; orderId: string; grandTotal: number; status: string }[];
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await api.get("/admin/dashboard/summary");
  return data.data;
}

export interface AdminOrder {
  _id: string;
  orderId: string;
  passengerId: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  grandTotal: number;
  createdAt: string;
  pnr?: string;
  items: { name: string; quantity: number }[];
}

export async function listAdminOrders(params?: {
  page?: number;
  limit?: number;
  passengerId?: string;
}): Promise<{ items: AdminOrder[] }> {
  const { data } = await api.get("/admin/orders", { params });
  return { items: data.data };
}

export async function updateOrderStatus(
  id: string,
  status: string,
  note?: string,
): Promise<AdminOrder> {
  const { data } = await api.patch(`/orders/${id}/status`, { status, note });
  return data.data;
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  createdAt: string;
  isBlocked: boolean;
}

export async function listAdminUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
}): Promise<{ items: AdminUser[] }> {
  const { data } = await api.get("/admin/users", { params });
  return { items: data.data };
}

export async function setUserBlocked(id: string, isBlocked: boolean): Promise<AdminUser> {
  const { data } = await api.patch(`/admin/users/${id}/block`, { isBlocked });
  return data.data;
}
