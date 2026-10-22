import type { CloudFunctionAuthConfig } from "./types";

/**
 * Load Cloud Function auth secrets from process.env.
 * Returns null when either secret is missing/blank — does not throw.
 * Does not call getServerEnv(), so unset secrets never break app boot.
 */
export function loadCloudFunctionAuthConfig(
  env: NodeJS.ProcessEnv = process.env
): CloudFunctionAuthConfig | null {
  const internalApiKey = env.CLOUD_FUNCTION_INTERNAL_API_KEY?.trim() ?? "";
  const hmacSecret = env.CLOUD_FUNCTION_HMAC_SECRET?.trim() ?? "";
  if (!internalApiKey || !hmacSecret) return null;
  // Same floor as env.ts zod min(16) when values are present.
  if (internalApiKey.length < 16 || hmacSecret.length < 16) return null;

  let maxSkewSeconds = 300;
  const skewRaw = env.CLOUD_FUNCTION_REQUEST_MAX_SKEW_SECONDS?.trim();
  if (skewRaw) {
    const n = Number(skewRaw.split(/\s+#/)[0]!.trim());
    if (Number.isFinite(n)) {
      maxSkewSeconds = Math.min(3600, Math.max(1, Math.trunc(n)));
    }
  }

  return { internalApiKey, hmacSecret, maxSkewSeconds };
}
