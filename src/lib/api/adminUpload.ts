import { getAccessToken } from "@/lib/auth/session";
import type { AdminContentUploadFolder } from "@/lib/admin/contentUploadFolders";

type UploadEnvelope = { data?: { url: string }; error?: { message: string } };

export async function uploadAdminContentImage(
  file: File,
  folder: AdminContentUploadFolder
): Promise<{ url?: string; error?: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const headers: Record<string, string> = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch("/api/v1/admin/uploads", {
      method: "POST",
      headers,
      body: form,
      credentials: "include",
    });
    const json = (await res.json()) as UploadEnvelope;
    if (!res.ok || !json.data?.url) {
      return { error: json.error?.message ?? "Upload failed" };
    }
    return { url: json.data.url };
  } catch {
    return { error: "Upload failed" };
  }
}
