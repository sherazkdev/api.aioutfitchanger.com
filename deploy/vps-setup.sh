#!/usr/bin/env bash
# Ubuntu VPS — PM2 on 3020 + Nginx + Certbot SSL for appworkspro.com
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DOMAIN="appworkspro.com"
NGINX_SITE="appworkspro.com"
PORT=3020
CERTBOT_EMAIL="${CERTBOT_EMAIL:-admin@appworkspro.com}"

cd "$APP_ROOT"
echo "==> $APP_ROOT"

if [[ ! -f .env.local ]]; then
  echo "ERROR: Create .env.local on the server (APP_URL=https://$DOMAIN, MONGODB_URI, secrets)."
  exit 1
fi

grep -q '^APP_URL=' .env.local || echo "APP_URL=https://$DOMAIN" >> .env.local
grep -q '^NODE_ENV=' .env.local || echo "NODE_ENV=production" >> .env.local

echo "==> npm ci && build"
npm ci
npm run build

echo "==> PM2 @ 127.0.0.1:$PORT"
command -v pm2 >/dev/null || { echo "sudo npm i -g pm2"; exit 1; }
pm2 startOrReload "$APP_ROOT/deploy/ecosystem.config.cjs" --env production
pm2 save
sudo env PATH="$PATH" pm2 startup systemd -u "$USER" --hp "$HOME" 2>/dev/null || true

echo "==> Nginx"
sudo cp "$APP_ROOT/deploy/nginx/appworkspro.com.conf" "/etc/nginx/sites-available/$NGINX_SITE"
sudo ln -sf "/etc/nginx/sites-available/$NGINX_SITE" "/etc/nginx/sites-enabled/$NGINX_SITE"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Certbot SSL (Let's Encrypt)"
if command -v certbot >/dev/null; then
  sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
    --non-interactive --agree-tos -m "$CERTBOT_EMAIL" --redirect \
    || sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"
else
  echo "Install: sudo apt install certbot python3-certbot-nginx"
  exit 1
fi

sudo nginx -t && sudo systemctl reload nginx

echo "==> Health"
curl -fsS -o /dev/null -w "local login HTTP %{http_code}\n" "http://127.0.0.1:$PORT/login"
echo "Live: https://$DOMAIN/login"
