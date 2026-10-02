# Mobile asset bundle (local)

| File | Purpose |
|------|---------|
| `assets.zip` | Flutter `assets/images/` tree (~420 catalog PNGs) |
| `BACKEND_ASSET_CATALOG.csv` | `style_id` → paths and API `image_url` |
| `BACKEND_ASSET_CATALOG.md` | Human-readable catalog notes |

## Install on this backend

```bash
npm run assets:sync    # extract zip → public/media/catalog + generate seed JSON
npm run assets:seed    # sync + replace catalog / home feed / wardrobe / onboarding in MongoDB
```

After sync, `src/lib/server/seed/asset-catalog.generated.json` is created. Fresh MongoDB
instances use it automatically via `ensureContentSeed()` (unless `DISABLE_CONTENT_SEED=1`).

Images are **not** committed (`public/media/catalog/` is gitignored). Keep `assets.zip` here on each machine/VPS that needs real thumbnails.

## Production VPS (appworkspro.com)

**Do not** run `npm run clear:demo-content` on production — it also deletes `appmetadatas` (app name, URLs, maintenance flags).

```bash
cd /var/www/ai-outfit-changer   # your clone path
# One-time: upload assets.zip into .asset-requirements/ (scp/rsync, ~238 MB)

npm run check:env
npm run assets:verify          # fails fast if zip/csv/images missing
npm run assets:sync            # extract + copy 419 PNGs + refresh generated JSON
npm run assets:seed            # replaces catalog / home feed / wardrobe / onboarding in MongoDB
pm2 reload ai-outfit-changer    # clears in-memory API cache

# Smoke checks (replace host if needed)
curl -sI "https://appworkspro.com/media/catalog/beard_styles/men_beard_01.png" | head -1
curl -s "https://appworkspro.com/api/v1/catalog/beard_styles?gender=men" | head -c 400
curl -s "https://appworkspro.com/api/v1/home/feed?gender=women" | head -c 400
```

Requirements on VPS: `tar`, Node, `MONGODB_URI` and `APP_URL=https://appworkspro.com` in `.env.local`, ~1 GB free disk during first extract.

**PNG vs WebP:** API paths use `.png` (same files as the mobile bundle). Flutter accepts these over HTTPS.

**Re-deploy after `git pull`:** if code changed, `npm ci && npm run build && pm2 reload`. Re-run `assets:sync` only when `assets.zip` or CSV changes; re-run `assets:seed` when you need to refresh Mongo content from CSV.
