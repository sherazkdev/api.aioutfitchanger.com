# App implementation guide — after backend CDN / Try-On deploy

**Audience:** Mobile (Flutter) developers  
**API base:** `https://appworkspro.com/api/v1` (or `API_BASE_URL` / dart-define)  
**Backend deploy:** Oct 2026 — garment CDN, `ai_outfit_changer.zip` overlays, Try-On API shim  
**Scope:** What the **app must implement or verify** — not backend setup.

---

## 1. What backend changed (you do not re-seed)

| Area | Backend change | App impact |
|------|----------------|------------|
| **Virtual Try-On grid** | Garment images on CDN; API can serve `wardrobe_browse` items under `virtual_try_on` when `tab` + `gender` are sent | **Must call correct catalog URL** (see §3) |
| **`virtual_try_on` PNGs (20)** | Hair/portrait files **replaced** with garment refs (same paths) | Same URLs; **clear image cache** on devices |
| **Catalog PNGs (~328 styles)** | New art from `ai_outfit_changer.zip` on **same** `style_id` / `image_url` paths | Same URLs; optional cache bust |
| **Home / Wardrobe parent rails** | **No change** — still not loaded from CDN | **No app change** |
| **New style IDs** | **None** — still **419** catalog rows | Grid **count** unchanged |

---

## 2. Golden rule (unchanged)

| UI | Image source |
|----|----------------|
| Splash, onboarding, hero, Beauty Lab **5 cards**, Home **4×3 rails**, Wardrobe **banner + 3 thumbs** | **Local bundle** only |
| View All, Beauty Lab **grids**, Virtual Try-On **grid**, Try-On **result**, History, avatar | **`image_url` / API** |

Bundled `assets/ai_outfit_changer/` is **not** used for catalog grids — if `image_url` is missing, grid is **empty**.

---

## 3. Virtual Try-On — required app implementation

### 3.1 Grid (style picker)

**Use this API** (design: Tops · Shirts · Bottoms · Skirts · Jackets + Men/Women):

```http
GET /catalog/wardrobe_browse?gender=men|women&tab=tops|shirts|bottoms|skirts|jackets
```

| Query | Required |
|-------|----------|
| `gender` | `men` or `women` |
| `tab` | One of: `tops`, `shirts`, `bottoms`, `skirts`, `jackets` |

**Response:** `items[].id` = wardrobe style ids (e.g. `women_tops_03`), `items[].image_url` = `/media/catalog/wardrobe_browse/....png`

**Do not** use only:

```http
GET /catalog/virtual_try_on?gender=women
```

without `tab` — that returns **10** legacy rows (`women_tryon_01`…`10`), **not** the full tabbed grid.

### 3.2 Legacy compatibility (optional)

If an **old build** still calls:

```http
GET /catalog/virtual_try_on?gender=men|women&tab=tops|shirts|bottoms|skirts|jackets
```

the server **returns the same garment grid** as `wardrobe_browse`, but keeps `category_id: "virtual_try_on"` in JSON.  
**Preferred:** migrate to **`wardrobe_browse`** explicitly (§3.1).

### 3.3 Try-On generate (after user picks a style)

```http
POST /try-on/generate
```

**Body (unchanged shape):**

| Field | App should send |
|-------|-----------------|
| `source_image_base64` | User photo (JPEG, ~768×1024) |
| `style_id` | From grid item: e.g. `women_tops_03` |
| `category_id` | **`virtual_try_on`** (if current app convention) **or** `wardrobe_browse` — backend resolves garment from catalog |
| `prompt` | Optional; server can use catalog `prompt_command` |

**Important:** Reference garment URL is **not** sent by the client. Server loads it from catalog using `style_id` + `category_id`.

**Backend behavior (Oct 2026):**

- If `category_id` is `virtual_try_on` but `style_id` is a wardrobe id (`women_tops_03`, …), server **falls back** to `wardrobe_browse` for the reference image.
- Legacy `women_tryon_01`…`10` still work; CDN files are **garments**, not hair portraits.

**Recommended app payload after grid tap:**

```json
{
  "source_image_base64": "...",
  "style_id": "women_tops_03",
  "category_id": "wardrobe_browse"
}
```

Or keep `category_id: "virtual_try_on"` if you must — server fallback exists.

### 3.4 Poll result

```http
GET /try-on/jobs/{job_id}
```

Use `result_image_url` or `result_image_absolute_url` (same as before).

---

## 4. URL resolution (unchanged)

| Field | Use |
|-------|-----|
| `image_url` | Catalog / wardrobe grid |
| `thumbnail_url` | Home feed (optional) |
| `result_image_absolute_url` | Try-On result (prefer if present) |

**Relative paths:**

| Value | Load as |
|-------|---------|
| `https://...` | As-is |
| `/media/...` | `{origin}{path}` e.g. `https://appworkspro.com/media/catalog/...` |
| `files/...` | `{origin}/files/...` |

Implementation: existing `ApiMediaUrl` / equivalent.

---

## 5. Image cache — app **should** implement

Backend **kept the same** paths (e.g. `/media/catalog/wardrobe_browse/women_tops_01.png`) but **replaced file bytes** (garment art, new zip).

**Symptom:** User still sees **old hair** or old thumbnails after server deploy.

**App actions (pick one or combine):**

1. **Clear** cached network images after app update (one-time migration flag in `SharedPreferences`).
2. Append **cache buster** when loading catalog images, e.g. `image_url + "?v=20261006"` (constant bumped per release).
3. Document: user **Clear storage** / reinstall for QA.

---

## 6. Screen checklist — what to wire

| Screen | API / source | Notes |
|--------|----------------|-------|
| Home Outfit / Occasions / Couple / Presets **3 cards** | Local `AppAssets` | No URL |
| Home **View All** | `GET /catalog/{category_id}?gender=` | `outfit_change`, `occasions`, `couple_duo`, `presets` |
| Beauty Lab **5 cards** | Local | No URL |
| Beauty Lab → Hair / Color / Hijab / Beard grids | `GET /catalog/hair_styles` etc. | CDN updated art, same ids |
| **Virtual Try-On** chips + grid | **`GET /catalog/wardrobe_browse?gender=&tab=`** | §3.1 |
| Wardrobe **3 thumbs** | Local rails | No URL |
| Wardrobe **View All** | `GET /catalog/wardrobe_browse?tab=chinese\|indian\|…` | Unchanged |
| Try-On generate | `POST /try-on/generate` | §3.3 |

---

## 7. What did **not** change (no app work)

- Auth, history, profile, FCM, devices — same endpoints.
- **`wardrobe_browse` 259** row ids and API shape — unchanged.
- Home feed optional `GET /home/feed?gender=` — still optional; local rails primary.
- `GET /wardrobe/regions/.../looks` — still unused in app; no need to call.

---

## 8. QA verification (app team)

1. **Virtual Try-On → Women → Tops:** grid shows **garment** flat-lays, **not** hair portraits; **>10** items if API returns them (e.g. 11 tops).
2. Change chip **Shirts / Bottoms / …** → new `tab=` request; grid content changes.
3. Tap one item → generate → result outfit plausible (not hair transfer).
4. Open same `image_url` in browser — garment PNG.
5. After install fresh build, no stale cached hair on `virtual_try_on` paths.

**Smoke URLs (production):**

```text
GET .../catalog/wardrobe_browse?gender=women&tab=tops
GET .../catalog/virtual_try_on?gender=women&tab=tops   (legacy shim — should match grid)
GET .../media/catalog/virtual_try_on/women_tryon_01.png  (garment, not portrait)
```

---

## 9. Common mistakes

| Mistake | Effect |
|---------|--------|
| Grid via `GET /catalog/virtual_try_on` **without** `tab` | Only **10** items; wrong UX vs design |
| Missing `gender` on catalog calls | Wrong or empty items |
| Expecting **new style cards** from backend deploy | Only **art** swapped on existing ids |
| No cache bust after CDN replace | Old hair/images until cache cleared |
| Sending garment URL in generate body | Ignored; server uses catalog only |

---

## 10. Questions for backend (if generate fails)

Send one captured request:

- `style_id`
- `category_id`
- HTTP status + error body from `POST /try-on/generate`

---

*Backend reference: `docs/TRYON_PRODUCTION_DEPLOY.md`, repo scripts `virtual-tryon-garments.mjs`, `ai-outfit-changer-zip-sync.mjs`.*
