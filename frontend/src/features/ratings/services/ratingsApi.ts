import { api } from "@/lib/axios";

export interface ApiRating {
  _id: string;
  passengerId: { _id: string; name: string } | string;
  rating: number;
  reviewText?: string;
  createdAt: string;
  isFeatured: boolean;
  isHidden: boolean;
}

export async function getMenuItemRatings(menuItemId: string): Promise<ApiRating[]> {
  const { data } = await api.get("/ratings", { params: { menuItemId, limit: 10 } });
  return data.data;
}

export async function getFeaturedRatings(limit = 6): Promise<ApiRating[]> {
  const { data } = await api.get("/ratings", { params: { featured: true, limit } });
  return data.data;
}

export async function listAdminRatings(params?: {
  page?: number;
  limit?: number;
}): Promise<ApiRating[]> {
  const { data } = await api.get("/admin/ratings", { params });
  return data.data;
}

export async function moderateRating(
  id: string,
  patch: { isHidden?: boolean; isFeatured?: boolean },
): Promise<ApiRating> {
  const { data } = await api.patch(`/ratings/${id}/moderate`, patch);
  return data.data;
}
