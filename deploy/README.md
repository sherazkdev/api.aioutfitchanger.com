# VPS deploy — appworkspro.com

| Item | Value |
|------|--------|
| PM2 app | **1** — `ai-outfit-changer` |
| App port | **3020** (localhost only) |
| Public URL | **https://appworkspro.com** |
| Nginx | 80/443 → `127.0.0.1:3020` |

## One-time on VPS

```bash
cd /var/www/ai-outfit-changer   # your clone path
cp .env.example .env.local      # fill production values
export CERTBOT_EMAIL=you@email.com
chmod +x deploy/vps-setup.sh
./deploy/vps-setup.sh
```

Production `.env.local` must include at least:

```env
APP_URL=https://appworkspro.com
NODE_ENV=production
MONGODB_URI=...
MONGODB_MAX_POOL_SIZE=20
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
```

### Forgot password email (Resend)

Without these, `/api/v1/auth/forgot-password` still returns success but **no email is sent** (check PM2 logs for `[email]` or `[auth] forgot-password`).

```env
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@your-verified-domain.com
RESEND_FROM_NAME=AI Wardrobe
RESET_PASSWORD_URL=https://appworkspro.com/reset-password
```

Verify on VPS:

```bash
node scripts/verify-resend-password-reset.mjs
node scripts/verify-resend-password-reset.mjs --send you@example.com
node scripts/verify-resend-password-reset.mjs --send other-person@example.com
pm2 logs ai-outfit-changer --lines 50 | grep -E '\[email\]|\[auth\] forgot|\[auth\] register'
```

**Emails only to some addresses?** Resend **testing/sandbox** can deliver only to your Resend account email. For **any** registered user (Gmail, etc.) you must:

1. Verify your sending **domain** in Resend (not only `onboarding@resend.dev`).
2. Set `RESEND_FROM_EMAIL=noreply@your-verified-domain.com`.
3. Use a **production** Resend API key.

Check logs: `[email] account security send failed` + `resendError`. Google-only users get a “use Google sign-in” email on forgot-password (no OTP).

**Note:** Only users who signed up with **email + password** get a reset mail. Google-only accounts have no `passwordHash` — API responds OK but skips send.

**PM2 `Failed to find Server Action`** lines are usually stale browser JS after deploy; hard refresh or `pm2 reload` after `npm run build`. They are unrelated to the forgot-password API.

### Look history index (after audit #11 deploy)

New sparse unique index: `{ userId, tryOnJobId }`. If production already has duplicate job rows, index creation can fail.

**Once before or right after deploy:**

```bash
node scripts/prepare-look-history-unique-index.mjs
```

Keeps the newest look per `(userId, tryOnJobId)` and creates the index.

### Security hardening (90%+)

See **`docs/API_SECURITY_HARDENING.md`**. Recommended on VPS:

```env
REDIS_URL=redis://127.0.0.1:6379
ADMIN_IP_ALLOWLIST=your.public.ip
ENFORCE_TURNSTILE=true
TURNSTILE_SECRET_KEY=...
```

Install Redis if needed: `sudo apt install redis-server` (bind localhost only).

## Manual steps (same as script)

```bash
npm ci && npm run build
pm2 startOrReload deploy/ecosystem.config.cjs --env production
pm2 save

sudo cp deploy/nginx/appworkspro.com.conf /etc/nginx/sites-available/appworkspro.com
sudo ln -sf /etc/nginx/sites-available/appworkspro.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

sudo certbot --nginx -d appworkspro.com -d www.appworkspro.com
```

## Check port

```bash
sudo ss -tulpn | grep ':3020 '
```

## Redeploy after git pull

```bash
git pull
npm ci && npm run build
pm2 reload ai-outfit-changer
```
