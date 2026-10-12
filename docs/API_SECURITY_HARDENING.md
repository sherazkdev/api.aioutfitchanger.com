# API security hardening (production ~90%+)

Backend controls below are **on by default** (headers, per-route rate limits, auth timing). Optional env vars tighten further for production.

## Checklist

| Control | Status | Notes |
|--------|--------|--------|
| Security headers (HSTS, nosniff, frame deny) | On in prod | `src/middleware.ts` |
| CORS allowlist | Optional | `API_CORS_ORIGINS` or `APP_URL` |
| Distributed rate limits | Optional | `REDIS_URL` (recommended on VPS + PM2) |
| Auth endpoint limits | On | login, register, forgot, OTP, refresh, admin |
| Login / admin timing delay | On | Failed password checks (~180–400 ms jitter) |
| Try-on body size cap | On | `Content-Length` check before parse; default 18 MB |
| Turnstile on auth abuse paths | Optional | `ENFORCE_TURNSTILE=true` + `TURNSTILE_SECRET_KEY` |
| Admin IP allowlist | Optional | `ADMIN_IP_ALLOWLIST` — dashboard login + admin API |
| Try-on moderation + daily quota | Optional | Existing audit env vars |
| Generic auth errors | On | No account enumeration on forgot |

## Production env (recommended)

```env
# Rate limits across PM2 workers / restarts
REDIS_URL=redis://127.0.0.1:6379

# Admin dashboard: only your office/VPN IP (comma-separated)
ADMIN_IP_ALLOWLIST=203.0.113.10

# Web admin origin if different from APP_URL
API_CORS_ORIGINS=https://appworkspro.com

# Bot protection on register / login / forgot (mobile sends token in JSON)
ENFORCE_TURNSTILE=true
TURNSTILE_SECRET_KEY=...

# Optional: lower than nginx 25m if needed
# API_MAX_BODY_BYTES=18874368
```

**Turnstile:** Create a site in Cloudflare Turnstile. App sends `captcha_token` or `turnstile_token` on:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/forgot-password/otp`

Until `ENFORCE_TURNSTILE` is set, those fields are **ignored** (backward compatible).

**Admin IP:** If `ADMIN_IP_ALLOWLIST` is empty, all IPs can hit admin login/API (still need credentials + JWT). Set it on production for dashboard lock-down.

**Redis:** Without `REDIS_URL`, limits are in-process memory (fine for one Node instance; weak if you scale horizontally).

## Nginx (edge)

Ensure real client IP reaches the app:

```nginx
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

Optional `limit_req` on `/api/v1/auth/` in the `http` block — see comments in `deploy/nginx/appworkspro.com.conf`.

## Deploy

```bash
git pull origin main
npm ci && npm run build
pm2 startOrReload deploy/ecosystem.config.cjs --env production
```

After enabling Turnstile or Redis, reload PM2 so env is picked up.

## New / updated error codes

| Code | HTTP | When |
|------|------|------|
| `CAPTCHA_REQUIRED` | 422 | Turnstile enforced, token missing |
| `CAPTCHA_FAILED` | 400 | Invalid/expired Turnstile |
| `PAYLOAD_TOO_LARGE` | 413 | Body over `API_MAX_BODY_BYTES` |
| `FORBIDDEN` | 403 | Admin blocked by IP allowlist |
