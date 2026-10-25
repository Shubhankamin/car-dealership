import { api } from "./client";

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post<{ url: string }>("/uploads", form);
  return data.url;
}
