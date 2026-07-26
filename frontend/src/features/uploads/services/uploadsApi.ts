import { api } from "@/lib/axios";

export async function uploadImage(
  file: File,
  folder: "menu-items" | "categories" = "menu-items",
): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  form.append("folder", folder);
  const { data } = await api.post("/admin/uploads/image", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.data.url as string;
}
