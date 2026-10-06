# Virtual Try-On — production deploy (images + API)

Beauty Lab → Virtual Try-On uses **garment** images from `wardrobe_browse` (tabs: tops, shirts, bottoms, skirts, jackets + gender).  
Generate (`POST /try-on/generate`) resolves the reference garment from catalog by `style_id` (+ `category_id`).

## What this repo does automatically

1. **`npm run assets:sync`** — copies 419 PNGs from `.asset-requirements/assets.zip`, then **overwrites** `public/media/catalog/virtual_try_on/*.png` with mapped **wardrobe garment** art (not hair portraits).
2. **Catalog API** — `GET /catalog/virtual_try_on?gender=&tab=tops|…` serves **`wardrobe_browse`** items but keeps `category_id: virtual_try_on` (legacy app builds).
3. **Generate** — if the app sends `women_tops_03` with `category_id: virtual_try_on`, the server falls back to **`wardrobe_browse`** for that `style_id`.

Home feed + Wardrobe parent rails stay **app-local**; no extra CDN work.

## Production steps (VPS)

```bash
cd /var/www/ai-outfit-changer   # your path

git pull
npm ci
npm run build

# One-time or when assets.zip / CSV changes:
npm run check:env
npm run assets:verify
npm run assets:sync
npm run assets:seed          # refreshes Mongo catalog (wardrobe 259 rows replaced from seed — same data, OK)

pm2 reload ai-outfit-changer
```

### Smoke tests

```bash
# Grid (garment tops, women)
curl -s "https://appworkspro.com/api/v1/catalog/wardrobe_browse?gender=women&tab=tops" | head -c 400

# Legacy path → same grid shape, category_id virtual_try_on
curl -s "https://appworkspro.com/api/v1/catalog/virtual_try_on?gender=women&tab=tops" | head -c 400

# CDN — should be flat-lay garment, not hair portrait
curl -sI "https://appworkspro.com/media/catalog/virtual_try_on/women_tryon_01.png" | head -3
curl -sI "https://appworkspro.com/media/catalog/wardrobe_browse/women_tops_01.png" | head -3
```

After deploy, `women_tryon_01.png` and `women_tops_01.png` should be the **same garment** (mapped slot).

## Files on server

| Path | Role |
|------|------|
| `.asset-requirements/assets.zip` | Source PNGs (~238 MB) |
| `.asset-requirements/.new-requirements/BACKEND_ASSET_CATALOG.csv` | 419 styles |
| `public/media/catalog/**` | Served at `/media/catalog/...` (gitignored; created by sync) |
| Mongo `catalogcategories` | API `image_url` paths (from `assets:seed`) |

## Do not

- Run `clear:demo-content` on production.
- Expect app dev to send a separate tops/shirts zip — grid uses existing `wardrobe_browse` CDN.
