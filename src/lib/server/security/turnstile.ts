import { getClientIp } from "../http";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnforced(): boolean {
  const v = process.env.ENFORCE_TURNSTILE?.trim().toLowerCase();
  return v === "1" || v === "true";
}

export function turnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY?.trim());
}

export async function verifyTurnstileToken(
  req: Request,
  token: string | undefined | null
): Promise<{ ok: true } | { ok: false; code: "CAPTCHA_REQUIRED" | "CAPTCHA_FAILED" }> {
  if (!turnstileEnforced()) return { ok: true };

  const secret = process.env.TURNSTILE_SECRET_KEY?.trim();
  if (!secret) {
    console.error("[security] ENFORCE_TURNSTILE set but TURNSTILE_SECRET_KEY missing");
    return { ok: false, code: "CAPTCHA_FAILED" };
  }

  const response = token?.trim();
  if (!response) return { ok: false, code: "CAPTCHA_REQUIRED" };

  const ip = getClientIp(req);
  const body = new URLSearchParams({
    secret,
    response,
    ...(ip ? { remoteip: ip } : {}),
  });

  try {
    const res = await fetch(VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const json = (await res.json()) as { success?: boolean };
    if (json.success) return { ok: true };
    return { ok: false, code: "CAPTCHA_FAILED" };
  } catch {
    return { ok: false, code: "CAPTCHA_FAILED" };
  }
}
