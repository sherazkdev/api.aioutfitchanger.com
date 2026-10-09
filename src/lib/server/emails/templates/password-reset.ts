export type PasswordResetEmailContent = {
  resetUrl: string;
  expiresIn?: string;
};

export function passwordResetSubject(): string {
  return "Reset your AI Wardrobe password";
}

export function buildPasswordResetPlainText({
  resetUrl,
  expiresIn,
}: PasswordResetEmailContent): string {
  const expiryLine = expiresIn
    ? `This link will expire after ${expiresIn}.`
    : "This link will expire after the configured reset-token expiration period.";

  return [
    "Reset your password",
    "",
    "We received a request to reset your AI Wardrobe password.",
    "",
    "Click the link below to create a new password:",
    resetUrl,
    "",
    expiryLine,
    "",
    "If you didn't request a password reset, you can safely ignore this email.",
    "",
    "© AI Wardrobe",
    "This is an automated security email. Please do not reply.",
  ].join("\n");
}

export function buildPasswordResetHtml({
  resetUrl,
  expiresIn,
}: PasswordResetEmailContent): string {
  const expiryHtml = expiresIn
    ? `This link will expire after <strong>${escapeHtml(expiresIn)}</strong>.`
    : "This link will expire after the configured reset-token expiration period.";

  const safeUrl = escapeHtml(resetUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Reset your password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:12px;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:40px 32px 32px 32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#71717a;">AI Wardrobe</p>
              <h1 style="margin:0 0 16px 0;font-size:24px;font-weight:600;line-height:1.3;color:#18181b;">Reset your password</h1>
              <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#52525b;">We received a request to reset your AI Wardrobe password.</p>
              <p style="margin:0 0 28px 0;font-size:15px;line-height:1.6;color:#52525b;">Click the button below to create a new password.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 28px auto;">
                <tr>
                  <td align="center" style="border-radius:8px;background-color:#18181b;">
                    <a href="${safeUrl}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Reset Password</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 12px 0;font-size:13px;line-height:1.5;color:#71717a;">Or copy and paste this link into your browser:</p>
              <p style="margin:0 0 28px 0;font-size:13px;line-height:1.5;word-break:break-all;">
                <a href="${safeUrl}" style="color:#3f3f46;text-decoration:underline;">${safeUrl}</a>
              </p>
              <p style="margin:0 0 12px 0;font-size:13px;line-height:1.6;color:#71717a;">${expiryHtml}</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">If you didn't request a password reset, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px 32px;border-top:1px solid #f4f4f5;text-align:center;">
              <p style="margin:0 0 4px 0;font-size:12px;color:#a1a1aa;">© AI Wardrobe</p>
              <p style="margin:0;font-size:12px;color:#a1a1aa;">This is an automated security email. Please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
