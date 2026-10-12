import { randomUUID } from "crypto";
import { shouldApplyAiResultWatermark } from "../watermark/policy";
import { isHostedUploadUrl, persistRemoteImageToUploads } from "./uploads";

export async function persistLookImageUrl(userId: string, url: string, basename?: string): Promise<string> {
  if (!url?.trim() || isHostedUploadUrl(url)) return url;
  const applyWatermark = await shouldApplyAiResultWatermark(userId);
  return persistRemoteImageToUploads({
    userId,
    subdir: "looks",
    basename: basename ?? randomUUID(),
    remoteUrl: url,
    applyWatermark,
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
