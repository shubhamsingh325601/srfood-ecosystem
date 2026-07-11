import { api } from "@/lib/axios";
import type { ApiStation } from "../types";

export async function getStations(q?: string): Promise<ApiStation[]> {
  const { data } = await api.get("/stations", { params: q ? { q } : undefined });
  return data.data;
}

export interface StationPayload {
  name: string;
  code?: string;
  isActive?: boolean;
}

export async function createStation(payload: StationPayload): Promise<ApiStation> {
  const { data } = await api.post("/admin/stations", payload);
  return data.data;
}

export async function updateStation(
  id: string,
  payload: Partial<StationPayload>,
): Promise<ApiStation> {
  const { data } = await api.patch(`/admin/stations/${id}`, payload);
  return data.data;
}

export async function deleteStation(id: string): Promise<void> {
  await api.delete(`/admin/stations/${id}`);
}
