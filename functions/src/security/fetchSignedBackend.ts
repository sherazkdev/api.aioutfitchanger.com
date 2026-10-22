export type SignedFetchInput = {
  url: string;
  method: string;
  headers: Record<string, string>;
  rawBody: string;
  /** Milliseconds. Default 12000. */
  timeoutMs?: number;
  /** Inject for tests. */
  fetchImpl?: typeof fetch;
};

export type SignedFetchResult =
  | { ok: true; status: number; bodyText: string }
  | { ok: false; kind: "timeout" | "network" | "redirect" | "http"; status?: number; bodyText?: string };

/**
 * Server-to-server fetch with fail-closed redirects and hard timeout.
 * Must not follow redirects (would forward X-Internal-API-Key / HMAC headers).
 */
export async function fetchSignedBackend(input: SignedFetchInput): Promise<SignedFetchResult> {
  const timeoutMs = input.timeoutMs ?? 12_000;
  const fetchImpl = input.fetchImpl ?? fetch;

  let signal: AbortSignal;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      signal = AbortSignal.timeout(timeoutMs);
    } else {
      const controller = new AbortController();
      signal = controller.signal;
      timer = setTimeout(() => controller.abort(), timeoutMs);
    }

    const res = await fetchImpl(input.url, {
      method: input.method,
      headers: input.headers,
      body: input.method.toUpperCase() === "GET" || input.method.toUpperCase() === "HEAD" ? undefined : input.rawBody,
      redirect: "error",
      signal,
    });

    const bodyText = await res.text();
    if (!res.ok) {
      return { ok: false, kind: "http", status: res.status, bodyText };
    }
    return { ok: true, status: res.status, bodyText };
  } catch (err) {
    const name = err && typeof err === "object" && "name" in err ? String((err as { name: string }).name) : "";
    const message = err instanceof Error ? err.message : String(err);
    if (name === "TimeoutError" || name === "AbortError" || /aborted|timeout/i.test(message)) {
      return { ok: false, kind: "timeout" };
    }
    // undici / Node: redirect mode "error" throws TypeError on redirect
    if (/redirect/i.test(message)) {
      return { ok: false, kind: "redirect" };
    }
    return { ok: false, kind: "network" };
  } finally {
    if (timer) clearTimeout(timer);
  }
}
