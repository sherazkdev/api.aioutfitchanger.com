# Email auth (OTP + link) — VPS setup

## Required `.env.local` (production)

| Variable | Required | Example |
|----------|----------|---------|
| `RESEND_API_KEY` | **Yes** (for any email) | `re_…` production key |
| `RESEND_FROM_EMAIL` | **Yes** | `noreply@yourdomain.com` (domain verified in Resend) |
| `APP_URL` | **Yes** | `https://appworkspro.com` |
| `RESET_PASSWORD_URL` | **Recommended** | `https://appworkspro.com/reset-password` |
| `JWT_ACCESS_SECRET` | **Yes** | 32+ chars |
| `JWT_REFRESH_SECRET` | **Yes** | 32+ chars |
| `MONGODB_URI` | **Yes** | Mongo connection string |

## Optional

| Variable | Default | Purpose |
|----------|---------|---------|
| `RESEND_FROM_NAME` | `Outfit Changer` | From name in inbox |
| `SUPPORT_EMAIL` | `support@aioutfitchanger.com` | Email footer |
| `RESET_OTP_TTL_MINUTES` | `10` | OTP expiry |
| `RESET_OTP_MAX_ATTEMPTS` | `5` | Wrong OTP tries |
| `RESET_TOKEN_TTL_HOURS` | `1` | Web link expiry |

## Why only one Gmail gets mail?

Resend **test mode** often delivers only to the account owner email. Fix:

1. Resend dashboard → **Domains** → verify `yourdomain.com` (DNS records).
2. Use `RESEND_FROM_EMAIL` on that domain (not `onboarding@resend.dev`).
3. Production API key on VPS.

Test two recipients:

```bash
node scripts/verify-resend-password-reset.mjs --send sherazk.dev@gmail.com
node scripts/verify-resend-password-reset.mjs --send atif@example.com
```

## Flows

| Event | Email contents |
|--------|----------------|
| Register | 4-digit OTP + “Verify & set password” web link |
| Forgot password | Same (OTP + link); **always HTTP 200** generic message |
| Google-only forgot | “Use Google sign-in” (no OTP) |

## Deploy

```bash
git pull && npm ci && npm run build
pm2 startOrReload deploy/ecosystem.config.cjs --env production
```
