import { Resend } from "resend";
import {
  buildPasswordResetHtml,
  buildPasswordResetPlainText,
  passwordResetSubject,
} from "./templates/password-reset";

let resendClient: Resend | null = null;

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

function senderAddress(): string | null {
  const email = process.env.RESEND_FROM_EMAIL?.trim();
  if (!email) return null;
  const name = (process.env.RESEND_FROM_NAME ?? "AI Wardrobe").trim() || "AI Wardrobe";
  return `${name} <${email}>`;
}

function recipientDomain(to: string): string {
  const at = to.lastIndexOf("@");
  return at >= 0 ? to.slice(at + 1).toLowerCase() : "unknown";
}

export type SendPasswordResetEmailInput = {
  to: string;
  resetUrl: string;
  expiresIn?: string;
};

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: "not_configured" | "send_failed" };

export async function sendPasswordResetEmail(
  input: SendPasswordResetEmailInput
): Promise<SendEmailResult> {
  const client = getResendClient();
  const from = senderAddress();

  if (!client || !from) {
    console.error("[email] password reset not sent: Resend not configured", {
      domain: recipientDomain(input.to),
    });
    return { ok: false, error: "not_configured" };
  }

  const html = buildPasswordResetHtml({
    resetUrl: input.resetUrl,
    expiresIn: input.expiresIn,
  });
  const text = buildPasswordResetPlainText({
    resetUrl: input.resetUrl,
    expiresIn: input.expiresIn,
  });

  try {
    const { data, error } = await client.emails.send({
      from,
      to: [input.to],
      subject: passwordResetSubject(),
      html,
      text,
    });

    if (error || !data?.id) {
      console.error("[email] password reset send failed", {
        domain: recipientDomain(input.to),
      });
      return { ok: false, error: "send_failed" };
    }

    console.info("[email] password reset sent", {
      domain: recipientDomain(input.to),
      messageId: data.id,
    });
    return { ok: true, messageId: data.id };
  } catch {
    console.error("[email] password reset send failed", {
      domain: recipientDomain(input.to),
    });
    return { ok: false, error: "send_failed" };
  }
}

export function formatResetTokenExpiresIn(ttlHours: number): string {
  if (!Number.isFinite(ttlHours) || ttlHours <= 0) {
    return "the configured reset period";
  }
  if (ttlHours < 1) {
    const minutes = Math.max(1, Math.round(ttlHours * 60));
    return minutes === 1 ? "1 minute" : `${minutes} minutes`;
  }
  if (ttlHours === 1) return "1 hour";
  if (Number.isInteger(ttlHours)) return `${ttlHours} hours`;
  return `${ttlHours} hours`;
}

export function buildPasswordResetUrl(rawToken: string): string {
  const configured = process.env.RESET_PASSWORD_URL?.trim().replace(/\/$/, "");
  const base =
    configured ??
    `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/reset-password`;
  return `${base}?token=${encodeURIComponent(rawToken)}`;
}
