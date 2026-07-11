import { api } from "@/lib/axios";

export interface AppNotification {
  _id: string;
  event: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export async function listNotifications(params?: {
  unreadOnly?: boolean;
  limit?: number;
}): Promise<{ items: AppNotification[] }> {
  const { data } = await api.get("/notifications", { params });
  return { items: data.data };
}

export async function markNotificationRead(id: string): Promise<AppNotification> {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data.data;
}
