#!/usr/bin/env bash
# Run ON the VPS from app root (/var/www/ai-outfit-changer).
# Does not print secret values. Records PREVIOUS_COMMIT for rollback.
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$APP_ROOT"

PREVIOUS_COMMIT="$(git rev-parse HEAD)"
echo "PREVIOUS_COMMIT=${PREVIOUS_COMMIT}"
echo "=== git status (short) ==="
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "STOP: local modifications on VPS — resolve before deploy"
  git status -sb
  exit 1
fi

echo "=== git pull ==="
OLD="$PREVIOUS_COMMIT"
git pull origin main
NEW="$(git rev-parse HEAD)"
echo "OLD_COMMIT=${OLD}"
echo "NEW_COMMIT=${NEW}"

if [ -f .env.local ]; then
  cp -a .env.local ".env.local.bak.$(date +%Y%m%d%H%M%S)"
  echo "ENV backup: .env.local.bak.* (not in git)"
fi

echo "=== npm ci ==="
npm ci

echo "=== asset sync (catalog PNGs gitignored) ==="
npm run assets:sync

echo "=== pre-restart regressions ==="
npm run test:wardrobe-phase1
npm run test:full-outfit-phase2
npm run test:beauty-flux
npm run test:couple-duo-routing
npm run test:try-on-invalid-json
node scripts/verify-production-prompts.mjs "https://appworkspro.com"
npx tsx artifacts/validate-phase2-assets-after-repair.mjs

echo "=== couple split assets on disk ==="
for i in $(seq -w 1 11); do
  for g in male female; do
    f="public/media/catalog/couple_duo/couple_${i}_${g}.png"
    test -f "$f" || { echo "MISSING $f"; exit 1; }
  done
done

echo "=== build ==="
npm run build

echo "=== seed prompts (Mongo promptCommand only) ==="
npm run assets:seed-prompts

echo "=== pm2 reload ==="
pm2 reload ai-outfit-changer --update-env || pm2 startOrReload deploy/ecosystem.config.cjs --env production
pm2 save
pm2 status

echo "=== nginx test (no reload unless you changed config) ==="
sudo nginx -t || true

echo "DEPLOYED_COMMIT=${NEW}"
echo "Rollback: git checkout ${PREVIOUS_COMMIT} && npm ci && npm run build && pm2 reload ai-outfit-changer --update-env"
