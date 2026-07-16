import { api } from "@/lib/axios";
import type { ApiTrainSearchResult } from "../types";

export async function searchTrains(query: string): Promise<ApiTrainSearchResult[]> {
  const { data } = await api.get("/trains/search", { params: { query } });
  return data.data;
}
