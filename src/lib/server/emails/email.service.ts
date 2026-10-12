import { Resend } from "resend";
import {
  buildPasswordResetHtml,
  buildPasswordResetPlainText,
  passwordResetSubject,
} from "./templates/password-reset";
import {
  buildPasswordResetOtpHtml,
  buildPasswordResetOtpPlainText,
  passwordResetOtpSubject,
} from "./templates/password-reset-otp";
import {
  accountSecuritySubject,
  buildAccountSecurityHtml,
  buildAccountSecurityPlainText,
  type AccountSecurityEmailKind,
} from "./templates/account-security";
import {
  buildGoogleSignInReminderHtml,
  buildGoogleSignInReminderPlainText,
  googleSignInReminderSubject,
} from "./templates/google-signin-reminder";
import { normalizeEmail } from "../auth/normalizeEmail";

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

function maskEmail(to: string): string {
  const e = normalizeEmail(to);
  const at = e.indexOf("@");
  if (at <= 1) return "***";
  return `${e.slice(0, 2)}***${e.slice(at)}`;
}

export type SendPasswordResetEmailInput = {
  to: string;
  resetUrl: string;
  expiresIn?: string;
};

export type SendEmailResult =
  | { ok: true; messageId: string }
  | { ok: false; error: "not_configured" | "send_failed"; detail?: string };

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

  const to = normalizeEmail(input.to);

  try {
    const { data, error } = await client.emails.send({
      from,
      to: [to],
      subject: passwordResetSubject(),
      html,
      text,
    });

    if (error || !data?.id) {
      console.error("[email] password reset send failed", {
        to: maskEmail(to),
        domain: recipientDomain(to),
        resendError: error?.message ?? error ?? "unknown",
      });
      return { ok: false, error: "send_failed", detail: error?.message };
    }

    console.info("[email] password reset sent", {
      to: maskEmail(to),
      domain: recipientDomain(to),
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

export type SendPasswordResetOtpEmailInput = {
  to: string;
  otp: string;
  expiresInMinutes: number;
};

export async function sendPasswordResetOtpEmail(
  input: SendPasswordResetOtpEmailInput
): Promise<SendEmailResult> {
  const client = getResendClient();
  const from = senderAddress();

  if (!client || !from) {
    console.error("[email] password reset OTP not sent: Resend not configured", {
      domain: recipientDomain(input.to),
    });
    return { ok: false, error: "not_configured" };
  }

  const html = buildPasswordResetOtpHtml({
    otp: input.otp,
    expiresInMinutes: input.expiresInMinutes,
  });
  const text = buildPasswordResetOtpPlainText({
    otp: input.otp,
    expiresInMinutes: input.expiresInMinutes,
  });

  const to = normalizeEmail(input.to);

  try {
    const { data, error } = await client.emails.send({
      from,
      to: [to],
      subject: passwordResetOtpSubject(),
      html,
      text,
    });

    if (error || !data?.id) {
      console.error("[email] password reset OTP send failed", {
        to: maskEmail(to),
        domain: recipientDomain(to),
        resendError: error?.message ?? error ?? "unknown",
      });
      return { ok: false, error: "send_failed", detail: error?.message };
    }

    console.info("[email] password reset OTP sent", {
      to: maskEmail(to),
      domain: recipientDomain(to),
      messageId: data.id,
    });
    return { ok: true, messageId: data.id };
  } catch {
    console.error("[email] password reset OTP send failed", {
      domain: recipientDomain(input.to),
    });
    return { ok: false, error: "send_failed" };
  }
}

export type SendAccountSecurityEmailInput = {
  to: string;
  kind: AccountSecurityEmailKind;
  /** Omitted for sign-up welcome (link-only verify). */
  otp?: string;
  /** Web link (verify-email or reset-password depending on kind). */
  actionUrl: string;
  expiresInMinutes: number;
  linkExpiresIn?: string;
};

/** OTP + web link in one email (register welcome or forgot password). */
export async function sendAccountSecurityEmail(
  input: SendAccountSecurityEmailInput
): Promise<SendEmailResult> {
  const client = getResendClient();
  const from = senderAddress();
  const to = normalizeEmail(input.to);

  if (!client || !from) {
    console.error("[email] account security not sent: Resend not configured", {
      to: maskEmail(to),
    });
    return { ok: false, error: "not_configured" };
  }

  const content = {
    kind: input.kind,
    otp: input.otp,
    actionUrl: input.actionUrl,
    expiresInMinutes: input.expiresInMinutes,
    linkExpiresIn: input.linkExpiresIn,
  };

  try {
    const { data, error } = await client.emails.send({
      from,
      to: [to],
      subject: accountSecuritySubject(input.kind),
      html: buildAccountSecurityHtml(content),
      text: buildAccountSecurityPlainText(content),
    });

    if (error || !data?.id) {
      console.error("[email] account security send failed", {
        to: maskEmail(to),
        kind: input.kind,
        resendError: error?.message ?? error ?? "unknown",
      });
      return { ok: false, error: "send_failed", detail: error?.message };
    }

    console.info("[email] account security sent", {
      to: maskEmail(to),
      kind: input.kind,
      messageId: data.id,
      resendStatusUrl: `https://resend.com/emails/${data.id}`,
    });
    return { ok: true, messageId: data.id };
  } catch (e) {
    console.error("[email] account security send failed", {
      to: maskEmail(to),
      detail: e instanceof Error ? e.message : "unknown",
    });
    return { ok: false, error: "send_failed" };
  }
}

export async function sendGoogleSignInReminderEmail(to: string): Promise<SendEmailResult> {
  const client = getResendClient();
  const from = senderAddress();
  const recipient = normalizeEmail(to);

  if (!client || !from) {
    return { ok: false, error: "not_configured" };
  }

  try {
    const { data, error } = await client.emails.send({
      from,
      to: [recipient],
      subject: googleSignInReminderSubject(),
      html: buildGoogleSignInReminderHtml(),
      text: buildGoogleSignInReminderPlainText(),
    });
    if (error || !data?.id) {
      return { ok: false, error: "send_failed", detail: error?.message };
    }
    console.info("[email] google sign-in reminder sent", { to: maskEmail(recipient), messageId: data.id });
    return { ok: true, messageId: data.id };
  } catch {
    return { ok: false, error: "send_failed" };
  }
}

export function buildPasswordResetUrl(rawToken: string): string {
  const configured = process.env.RESET_PASSWORD_URL?.trim().replace(/\/$/, "");
  const base =
    configured ??
    `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/reset-password`;
  return `${base}?token=${encodeURIComponent(rawToken)}`;
}

export function buildVerifyEmailUrl(rawToken: string): string {
  const configured = process.env.VERIFY_EMAIL_URL?.trim().replace(/\/$/, "");
  const base =
    configured ??
    `${(process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/verify-email`;
  return `${base}?token=${encodeURIComponent(rawToken)}`;
}
