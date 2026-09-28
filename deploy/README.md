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
