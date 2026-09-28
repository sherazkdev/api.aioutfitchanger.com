import { publicAssetUrl } from "../publicUrl";

export function serializeTryOnJob(payload: {
  job_id: string;
  status: string;
  result_image_url?: string | null;
  error?: string | null;
}) {
  const stored = payload.result_image_url ?? null;
  return {
    job_id: payload.job_id,
    status: payload.status,
    result_image_url: stored,
    result_image_absolute_url: publicAssetUrl(stored),
    error: payload.error ?? null,
  };
}
