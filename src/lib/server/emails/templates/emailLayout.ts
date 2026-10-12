import { EMAIL_BRAND_NAME, EMAIL_SUPPORT } from "../brand";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function emailShell(params: {
  title: string;
  preheader: string;
  bodyHtml: string;
}): string {
  const brand = escapeHtml(EMAIL_BRAND_NAME);
  const support = escapeHtml(EMAIL_SUPPORT);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(params.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(params.preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px;text-align:center;background:linear-gradient(180deg,#faf5ff 0%,#ffffff 100%);">
              <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#7c3aed;">${brand}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 32px;">${params.bodyHtml}</td>
          </tr>
          <tr>
            <td style="padding:20px 32px;border-top:1px solid #f1f5f9;text-align:center;background:#fafafa;">
              <p style="margin:0 0 6px;font-size:12px;color:#64748b;">Need help? <a href="mailto:${support}" style="color:#7c3aed;text-decoration:none;">${support}</a></p>
              <p style="margin:0;font-size:11px;color:#94a3b8;">Automated message — please do not reply to this email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
