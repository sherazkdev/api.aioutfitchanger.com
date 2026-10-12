import { EMAIL_BRAND_NAME } from "../brand";
import { emailShell, escapeHtml } from "./emailLayout";

export type AccountSecurityEmailKind = "password_reset" | "welcome_verify";

export type AccountSecurityEmailContent = {
  kind: AccountSecurityEmailKind;
  otp: string;
  resetUrl: string;
  expiresInMinutes: number;
  linkExpiresIn?: string;
};

export function accountSecuritySubject(kind: AccountSecurityEmailKind): string {
  if (kind === "welcome_verify") {
    return `Welcome to ${EMAIL_BRAND_NAME} — verify your email`;
  }
  return `Reset your ${EMAIL_BRAND_NAME} password`;
}

export function buildAccountSecurityPlainText(c: AccountSecurityEmailContent): string {
  const headline =
    c.kind === "welcome_verify"
      ? "Welcome! Verify your email and set your password"
      : "Reset your password";

  const linkLine = c.linkExpiresIn
    ? `Web link expires in ${c.linkExpiresIn}.`
    : "The web link expires after the configured period.";

  return [
    headline,
    "",
    `Your 4-digit code (enter in the app): ${c.otp}`,
    `Code expires in ${c.expiresInMinutes} minutes.`,
    "",
    "Or open this link in your browser to verify and set a new password:",
    c.resetUrl,
    "",
    linkLine,
    "",
    "If you did not create this account or request a reset, ignore this email.",
    "",
    `— ${EMAIL_BRAND_NAME}`,
  ].join("\n");
}

export function buildAccountSecurityHtml(c: AccountSecurityEmailContent): string {
  const safeOtp = escapeHtml(c.otp);
  const safeUrl = escapeHtml(c.resetUrl);
  const otpMins =
    c.expiresInMinutes === 1 ? "1 minute" : `${c.expiresInMinutes} minutes`;

  const title =
    c.kind === "welcome_verify" ? "Welcome — verify your email" : "Reset your password";
  const intro =
    c.kind === "welcome_verify"
      ? "Thanks for signing up. Use the code in the app <strong>or</strong> the button below to verify your email and set your password."
      : "We received a request to reset your password. Use the code in the app <strong>or</strong> the secure link below.";

  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">${escapeHtml(title)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#475569;text-align:center;">${intro}</p>
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#64748b;text-align:center;text-transform:uppercase;letter-spacing:0.06em;">App code</p>
    <p style="margin:0 0 24px;font-size:40px;font-weight:800;letter-spacing:0.4em;text-align:center;color:#0f172a;font-variant-numeric:tabular-nums;">${safeOtp}</p>
    <p style="margin:0 0 28px;font-size:13px;text-align:center;color:#64748b;">Code expires in <strong>${escapeHtml(otpMins)}</strong>. Do not share it.</p>
    <table role="presentation" align="center" cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
      <tr>
        <td style="border-radius:10px;background:#7c3aed;">
          <a href="${safeUrl}" target="_blank" style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">Verify &amp; set password</a>
        </td>
      </tr>
    </table>
    <p style="margin:0 0 8px;font-size:12px;text-align:center;color:#94a3b8;">Or copy this link:</p>
    <p style="margin:0;font-size:12px;line-height:1.5;text-align:center;word-break:break-all;">
      <a href="${safeUrl}" style="color:#7c3aed;">${safeUrl}</a>
    </p>`;

  return emailShell({
    title,
    preheader: `Your code is ${c.otp}`,
    bodyHtml,
  });
}
