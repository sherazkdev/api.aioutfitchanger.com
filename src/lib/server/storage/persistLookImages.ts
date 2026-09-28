import { randomUUID } from "crypto";
import { isHostedUploadUrl, persistRemoteImageToUploads } from "./uploads";

export async function persistLookImageUrl(userId: string, url: string, basename?: string): Promise<string> {
  if (!url?.trim() || isHostedUploadUrl(url)) return url;
  return persistRemoteImageToUploads({
    userId,
    subdir: "looks",
    basename: basename ?? randomUUID(),
    remoteUrl: url,
  });
}

export async function persistSourceImageUrl(userId: string, url: string, basename?: string): Promise<string> {
  if (!url?.trim() || isHostedUploadUrl(url)) return url;
  return persistRemoteImageToUploads({
    userId,
    subdir: "sources",
    basename: basename ?? randomUUID(),
    remoteUrl: url,
  });
}
