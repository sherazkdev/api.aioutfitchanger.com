#!/usr/bin/env bash
# Import Archive.zip styles into production Mongo + uploads on the VPS.
# Run from app root after placing Archive.zip on the server.
set -euo pipefail
APP_ROOT="${APP_ROOT:-/var/www/ai-outfit-changer}"
cd "$APP_ROOT"
export PRODUCTION_API_BASE="${PRODUCTION_API_BASE:-http://127.0.0.1:3020/api/v1}"
export ARCHIVE_ZIP="${ARCHIVE_ZIP:-$APP_ROOT/Archive.zip}"
if [ ! -f "$ARCHIVE_ZIP" ]; then
  echo "Missing ARCHIVE_ZIP at $ARCHIVE_ZIP"
  exit 1
fi
# Uses ADMIN_EMAIL / ADMIN_PASSWORD from .env.local on the VPS (production admin account).
node scripts/import-archive-styles-production.mjs
echo "Import finished. Review artifacts/archive-style-import/import-results.json"
