export type PasswordResetOtpEmailContent = {
  otp: string;
  expiresInMinutes: number;
};

export function passwordResetOtpSubject(): string {
  return "Your AI Wardrobe password reset code";
}

export function buildPasswordResetOtpPlainText({
  otp,
  expiresInMinutes,
}: PasswordResetOtpEmailContent): string {
  return [
    "Password reset code",
    "",
    "Use this verification code in the mobile app to reset your password:",
    "",
    otp,
    "",
    `This code expires in ${expiresInMinutes} minute${expiresInMinutes === 1 ? "" : "s"}.`,
    "",
    "If you didn't request this, you can safely ignore this email.",
    "",
    "© AI Wardrobe",
  ].join("\n");
}

export function buildPasswordResetOtpHtml({
  otp,
  expiresInMinutes,
}: PasswordResetOtpEmailContent): string {
  const safeOtp = escapeHtml(otp);
  const expiry = expiresInMinutes === 1 ? "1 minute" : `${expiresInMinutes} minutes`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Password reset code</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:480px;background-color:#ffffff;border-radius:12px;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:40px 32px;text-align:center;">
              <p style="margin:0 0 8px 0;font-size:13px;font-weight:600;letter-spacing:0.04em;text-transform:uppercase;color:#71717a;">AI Wardrobe</p>
              <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:600;color:#18181b;">Your verification code</h1>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;color:#52525b;">Enter this code in the app to reset your password.</p>
              <p style="margin:0 0 24px 0;font-size:36px;font-weight:700;letter-spacing:0.35em;color:#18181b;font-variant-numeric:tabular-nums;">${safeOtp}</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#71717a;">Expires in <strong>${escapeHtml(expiry)}</strong>. Do not share this code.</p>
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
