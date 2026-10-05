#!/usr/bin/env bash
# Run on VPS after git pull — updates Mongo promptCommand only + rebuilds app.
set -euo pipefail
APP_ROOT="${APP_ROOT:-/var/www/ai-outfit-changer}"
cd "$APP_ROOT"
git pull origin main
npm install
npm run build
npm run assets:seed-prompts
pm2 reload ai-outfit-changer
node scripts/verify-production-prompts.mjs "http://127.0.0.1:3020"
