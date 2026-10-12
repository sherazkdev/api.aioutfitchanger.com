import { jsonError } from "../http";
import { verifyTurnstileToken } from "./turnstile";

export async function requireCaptchaIfEnabled(
  req: Request,
  body: { captcha_token?: string; turnstile_token?: string }
) {
  const token = body.captcha_token ?? body.turnstile_token;
  const captcha = await verifyTurnstileToken(req, token);
  if (captcha.ok) return null;
  if (captcha.code === "CAPTCHA_REQUIRED") {
    return jsonError("CAPTCHA_REQUIRED", "Complete the security check and try again", 422);
  }
  return jsonError("CAPTCHA_FAILED", "Security check failed. Try again.", 400);
}
