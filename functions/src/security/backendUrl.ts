/**
 * Validate Cloud Function → Next.js origin. Never accept host/path from callers.
 */

export type BackendUrlValidationResult =
  | { ok: true; origin: string }
  | { ok: false; reason: string };

/**
 * Accepts origin only (scheme + host [+ port]). Strips trailing slashes.
 * Production-like hosts must use https. Localhost may use http for emulator/dev.
 */
export function validateBackendBaseUrl(raw: string | undefined | null): BackendUrlValidationResult {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) {
    return { ok: false, reason: "missing_BACKEND_BASE_URL" };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { ok: false, reason: "invalid_BACKEND_BASE_URL" };
  }

  if (url.username || url.password) {
    return { ok: false, reason: "credentials_in_BACKEND_BASE_URL" };
  }

  const host = url.hostname.toLowerCase();
  const isLocal =
    host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "::1";

  if (url.protocol === "https:") {
    // ok
  } else if (url.protocol === "http:" && isLocal) {
    // ok for local/dev only
  } else {
    return { ok: false, reason: "BACKEND_BASE_URL_must_be_https" };
  }

  // Reject unexpected path/query/hash on the configured base (origin only).
  if ((url.pathname && url.pathname !== "/") || url.search || url.hash) {
    return { ok: false, reason: "BACKEND_BASE_URL_must_be_origin_only" };
  }

  return { ok: true, origin: url.origin };
}

/** Join fixed path onto validated origin without double slashes. */
export function buildFixedBackendUrl(origin: string, pathWithQuery: string): string {
  const path = pathWithQuery.startsWith("/") ? pathWithQuery : `/${pathWithQuery}`;
  return new URL(path, origin.endsWith("/") ? origin : `${origin}/`).toString();
}
