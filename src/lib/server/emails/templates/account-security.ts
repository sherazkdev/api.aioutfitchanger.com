import { EMAIL_BRAND_NAME } from "../brand";
import { emailShell, escapeHtml } from "./emailLayout";

export type AccountSecurityEmailKind = "password_reset" | "welcome_verify";

export type AccountSecurityEmailContent = {
  kind: AccountSecurityEmailKind;
  otp?: string;
  actionUrl: string;
  expiresInMinutes: number;
  linkExpiresIn?: string;
};

export function accountSecuritySubject(kind: AccountSecurityEmailKind): string {
  if (kind === "welcome_verify") {
    return `Welcome to ${EMAIL_BRAND_NAME} — verify your email`;
  }
  return `Reset your ${EMAIL_BRAND_NAME} password`;
}

function showOtpBlock(c: AccountSecurityEmailContent): boolean {
  return c.kind === "password_reset" && Boolean(c.otp?.trim());
}

export function buildAccountSecurityPlainText(c: AccountSecurityEmailContent): string {
  const headline =
    c.kind === "welcome_verify" ? "Welcome! Verify your email" : "Reset your password";

  const linkLine = c.linkExpiresIn
    ? `Web link expires in ${c.linkExpiresIn}.`
    : "The web link expires after the configured period.";

  const linkLabel =
    c.kind === "welcome_verify"
      ? "Verify your account (open in browser or app):"
      : "Reset your password (open in browser):";

  const lines = [headline, ""];

  if (showOtpBlock(c)) {
    lines.push(
      `Your 4-digit code (enter in the app): ${c.otp}`,
      `Code expires in ${c.expiresInMinutes} minutes.`,
      ""
    );
  } else if (c.kind === "welcome_verify") {
    lines.push("Tap the link below to verify your email and continue in the app.", "");
  }

  lines.push(
    linkLabel,
    c.actionUrl,
    "",
    linkLine,
    "",
    "If you did not create this account or request a reset, ignore this email.",
    "",
    `— ${EMAIL_BRAND_NAME}`
  );

  return lines.join("\n");
}

export function buildAccountSecurityHtml(c: AccountSecurityEmailContent): string {
  const safeUrl = escapeHtml(c.actionUrl);
  const title =
    c.kind === "welcome_verify" ? "Verify your email" : "Reset your password";
  const intro =
    c.kind === "welcome_verify"
      ? "Thanks for signing up. Tap the button below to verify your email and return to the app."
      : "Use the code in the app <strong>or</strong> the secure link below to set a new password.";

  const buttonText =
    c.kind === "welcome_verify" ? "Verify account" : "Reset password";

  let otpHtml = "";
  if (showOtpBlock(c)) {
    const safeOtp = escapeHtml(c.otp!);
    const otpMins =
      c.expiresInMinutes === 1 ? "1 minute" : `${c.expiresInMinutes} minutes`;
    otpHtml = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#64748b;text-align:center;text-transform:uppercase;letter-spacing:0.06em;">App code</p>
    <p style="margin:0 0 24px;font-size:40px;font-weight:800;letter-spacing:0.4em;text-align:center;color:#0f172a;font-variant-numeric:tabular-nums;">${safeOtp}</p>
    <p style="margin:0 0 28px;font-size:13px;text-align:center;color:#64748b;">Code expires in <strong>${escapeHtml(otpMins)}</strong>. Do not share it.</p>`;
  }

  const preheader =
    c.kind === "welcome_verify"
      ? "Verify your email to continue"
      : c.otp
        ? `Your code is ${c.otp}`
        : "Password reset";

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">${escapeHtml(title)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;text-align:center;">${intro}</p>
    ${otpHtml}
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="border-radius:10px;background:#7c3aed;">
          <a href="${safeUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${buttonText}</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:12px;text-align:center;color:#94a3b8;">Or copy this link:</p>
    <p style="margin:0;font-size:12px;line-height:1.5;text-align:center;word-break:break-all;">
      <a href="${safeUrl}" style="color:#7c3aed;">${safeUrl}</a>
    </p>`;

  return emailShell({
    title,
    preheader,
    bodyHtml,
  });
}
