import { EMAIL_BRAND_NAME } from "../brand";
import { emailShell, escapeHtml } from "./emailLayout";

export function googleSignInReminderSubject(): string {
  return `${EMAIL_BRAND_NAME} — sign in with Google`;
}

export function buildGoogleSignInReminderPlainText(): string {
  return [
    `You requested a password reset for ${EMAIL_BRAND_NAME}.`,
    "",
    "This email address is linked to Google Sign-In. There is no password to reset.",
    "Please open the app and tap Continue with Google.",
    "",
    `— ${EMAIL_BRAND_NAME}`,
  ].join("\n");
}

export function buildGoogleSignInReminderHtml(): string {
  const bodyHtml = `
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">Use Google to sign in</h1>
    <p style="margin:0;font-size:15px;line-height:1.65;color:#475569;text-align:center;">
      This email is registered with <strong>Google Sign-In</strong>. Password reset does not apply.
      Open the app and choose <strong>Continue with Google</strong>.
    </p>`;

  return emailShell({
    title: "Sign in with Google",
    preheader: "Your account uses Google Sign-In",
    bodyHtml,
  });
}
