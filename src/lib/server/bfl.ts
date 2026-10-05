import { getServerEnv } from "./env";

export type BflGenerateResponse = {
  id: string;
  polling_url: string;
  status?: string;
};

export type BflPollResponse = {
  status?: string;
  result?: { sample?: string };
  details?: { message?: string };
};

export function extractBflResultUrl(poll: BflPollResponse): string | null {
  const sample = poll.result?.sample;
  return typeof sample === "string" && sample.length > 0 ? sample : null;
}

export type BflEngine = "flux-2-pro" | "vto-v2";

function bflEndpoint(engine: BflEngine): string {
  return engine === "vto-v2" ? "/v1/flux-tools/vto-v2" : "/v1/flux-2-pro";
}

async function bflPost(engine: BflEngine, body: Record<string, unknown>): Promise<BflGenerateResponse> {
  const env = getServerEnv();
  if (!env.BFL_API_KEY) throw new Error("BFL_NOT_CONFIGURED");

  const res = await fetch(`${env.BFL_API_BASE}${bflEndpoint(engine)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-key": env.BFL_API_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BFL_GENERATE_FAILED:${res.status}:${text}`);
  }
  return res.json() as Promise<BflGenerateResponse>;
}

/** General FLUX.2 Pro image edit (beard, hair, hijab, studio). */
export async function bflStartGeneration(body: Record<string, unknown>): Promise<BflGenerateResponse> {
  return bflPost("flux-2-pro", body);
}

/** BFL Virtual Try-On v2 — person + garment, identity/pose preserved. */
export async function bflStartVtoV2(body: Record<string, unknown>): Promise<BflGenerateResponse> {
  return bflPost("vto-v2", body);
}

export async function bflPollResult(pollingUrl: string): Promise<BflPollResponse> {
  const env = getServerEnv();
  if (!env.BFL_API_KEY) throw new Error("BFL_NOT_CONFIGURED");

  const res = await fetch(pollingUrl, {
    headers: { "x-key": env.BFL_API_KEY },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`BFL_POLL_FAILED:${res.status}:${text}`);
  }
  return res.json() as Promise<BflPollResponse>;
}

export function mapBflStatus(status?: string | null): "queued" | "processing" | "completed" | "failed" | "cancelled" {
  const s = (status ?? "pending").toLowerCase();
  if (s === "ready" || s === "done" || s === "success") return "completed";
  if (s === "pending" || s === "queued" || s === "task not found") return "queued";
  if (s === "processing" || s === "running") return "processing";
  if (s === "error" || s === "failed" || s === "request moderated") return "failed";
  return "processing";
}
