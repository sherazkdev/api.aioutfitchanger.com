import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data, error: null }, init);
}

/** Public read responses — CDN/browser can cache (multi-instance safe at the edge). */
export function jsonOkCached<T>(data: T, maxAgeSec: number, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  const age = Math.min(300, Math.max(5, maxAgeSec));
  const swr = age * 2;
  headers.set("Cache-Control", `public, max-age=${age}, s-maxage=${age}, stale-while-revalidate=${swr}`);
  return jsonOk(data, { ...init, headers });
}

export function jsonOkLocalizedCached<T>(data: T, locale: string, maxAgeSec: number, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Language", locale);
  return jsonOkCached(data, maxAgeSec, { ...init, headers });
}

export function jsonOkLocalized<T>(data: T, locale: string, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Content-Language", locale);
  return NextResponse.json({ data, error: null }, { ...init, headers });
}

export function jsonError(code: string, message: string, status = 400) {
  return NextResponse.json({ data: null, error: { code, message } }, { status });
}

export function getClientIp(req: Request): string | undefined {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim();
  return req.headers.get("x-real-ip") ?? undefined;
}

const buckets = new Map<string, { count: number; reset: number }>();
let rateLimitOps = 0;

function pruneRateBuckets(now: number) {
  for (const [key, row] of buckets) {
    if (now > row.reset) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  rateLimitOps += 1;
  if (rateLimitOps % 200 === 0) pruneRateBuckets(now);

  const row = buckets.get(key);
  if (!row || now > row.reset) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (row.count >= limit) return false;
  row.count += 1;
  return true;
}
