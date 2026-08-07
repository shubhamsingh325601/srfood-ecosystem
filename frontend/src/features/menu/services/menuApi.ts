import { api } from "@/lib/axios";
import type { ApiCategory, ApiMenuItem } from "../types";

export async function getMenu(): Promise<{ categories: ApiCategory[]; items: ApiMenuItem[] }> {
  const { data } = await api.get("/menu");
  return data.data;
}

export async function getCategories(): Promise<ApiCategory[]> {
  const { data } = await api.get("/menu/categories");
  return data.data;
}

export async function getMenuItem(id: string): Promise<ApiMenuItem> {
  const { data } = await api.get(`/menu/items/${id}`);
  return data.data;
}

export interface MenuItemPayload {
  categoryId: string;
  name: string;
  shortDescription?: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
}

export async function createMenuItem(payload: MenuItemPayload): Promise<ApiMenuItem> {
  const { data } = await api.post("/menu/items", payload);
  return data.data;
}

export async function updateMenuItem(
  id: string,
  payload: Partial<MenuItemPayload>,
): Promise<ApiMenuItem> {
  const { data } = await api.patch(`/menu/items/${id}`, payload);
  return data.data;
}

export async function deleteMenuItem(id: string): Promise<void> {
  await api.delete(`/menu/items/${id}`);
}

export interface CategoryPayload {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  displayOrder?: number;
  isActive?: boolean;
}

export async function createCategory(payload: CategoryPayload): Promise<ApiCategory> {
  const { data } = await api.post("/menu/categories", payload);
  return data.data;
}

export async function updateCategory(
  id: string,
  payload: Partial<CategoryPayload>,
): Promise<ApiCategory> {
  const { data } = await api.patch(`/menu/categories/${id}`, payload);
  return data.data;
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/menu/categories/${id}`);
}
