# New Styles — Production Import Report

**Report generated:** 2026-10-15 (UTC)  
**Production API:** `https://appworkspro.com/api/v1`  
**Archive:** `C:\Users\shera\Downloads\Archive.zip` (20 PNG assets in 7 folders)

---

## A. Production summary

| Item | Result |
|------|--------|
| Production environment reachable | **Yes** — public catalog + admin login endpoint respond |
| Initial catalog count (verified) | **419** unique `style_id` values via public `GET /catalog/*` (see `artifacts/archive-style-import/production-baseline-public.json`) |
| ZIP image files | **20** |
| Independent styles identified | **19** |
| Styles successfully created in production | **0** — **blocked** (see §F) |
| Categories reused | `wardrobe_browse`, `couple_duo`, `outfit_change`, `occasions` (planned) |
| Categories to create | `eastern_traditional`, `trending_fashion`, `western_traditional` (planned) |
| Expected final count after import | **438** (419 + 19) |
| Generation tests | **Not run** — import not executed |

### Import execution status

Live import via `POST /api/v1/auth/admin/login` → **`401 UNAUTHORIZED`**.  
Local `.env.local` admin (`admin@example.com`) is **not** the production dashboard account.

**Prepared automation (ready to run when credentials are available):**

- `scripts/import-archive-styles-production.mjs` — production HTTP import (upload + catalog PATCH)
- `deploy/vps-import-archive-styles.sh` — run on VPS against `http://127.0.0.1:3020/api/v1` using VPS `.env.local` admin

**Code prep (engine routing for new categories):**  
`src/lib/server/bfl/tryOnEngine.ts` and `fullOutfitPhase2VtoPrompt.ts` updated to treat `eastern_traditional`, `trending_fashion`, `western_traditional` as full-outfit VTO categories. **Deploy this commit before or with the import** so try-on routing matches existing Phase 2 styles.

---

## B. Full image-to-ID mapping (planned — pending production write)

> In this backend, the **production style ID** used by mobile try-on is `style_id` (e.g. `couple_12`), not the MongoDB category document `_id`. Admin list API returns composite `id` as `{category_id}:{style_id}`.

| Folder | Image filename | Style name | Category ID | Style ID | Image URL (after import) | Status |
|--------|----------------|------------|-------------|----------|---------------------------|--------|
| Chinese Traditional | Frame 6.png | Women Chinese 29 — Sky Blue Hanfu | `wardrobe_browse` | `women_chinese_29` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Chinese Traditional | Frame 7.png | Women Chinese 30 — Red Bridal Hanfu | `wardrobe_browse` | `women_chinese_30` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Chinese Traditional | Frame 8.png | Men Chinese 29 — Black Scholar Robe | `wardrobe_browse` | `men_chinese_29` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Couple _ Duo Styles | Frame 20.png | Couple 12 — Tropical Casual Duo | `couple_duo` | `couple_12` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Couple _ Duo Styles | Frame 21.png | Couple 13 — South Indian Traditional Duo | `couple_duo` | `couple_13` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Couple _ Duo Styles | Frame 22.png | Couple 14 — Neutral Beach Duo | `couple_duo` | `couple_14` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Eastern Traditional | Frame 6.png | Men Arabian 35 — White Thobe | `eastern_traditional` | `men_arabian_35` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Eastern Traditional | Frame 7.png | Women Arabian 35 — Red Embroidered Kaftan | `eastern_traditional` | `women_arabian_35` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Eastern Traditional | Frame 8.png | Men Indian 31 — Lavender Kurta Waistcoat | `eastern_traditional` | `men_indian_31` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Outfit change | Frame 6.png | Women Outfit Change 12 — Yellow Tracksuit | `outfit_change` | `women_outfit_change_12` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Outfit change | Frame 7.png | Men Outfit Change 12 — Camel Overcoat | `outfit_change` | `men_outfit_change_12` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Outfit change | Frame 8.png | Women Outfit Change 13 — Red Drape Mini Dress | `outfit_change` | `women_outfit_change_13` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Pick look for occasions | Frame 12.png | Women Formal 11 — Navy Peplum Suit | `occasions` | `women_formal_11` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Pick look for occasions | Frame 13.png | Women Wedding 11 — Beach Bridal Veil | `occasions` | `women_wedding_11` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Trending Fashion | Frame 6.png | Men Trending 01 — Brown Biker Jacket | `trending_fashion` | `men_trending_01` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Trending Fashion | Frame 8.png | Women Trending 01 — Faux Fur Street Glam | `trending_fashion` | `women_trending_01` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Western Traditional | Frame 6.png | Women Western 01 — Red Embroidered Jacket | `western_traditional` | `women_western_01` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Western Traditional | Frame 7.png | Men Western 01 — Cowboy Gentleman | `western_traditional` | `men_western_01` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |
| Western Traditional | Frame 8.png | Women Western 02 — Boho Crop & Medallion Belt | `western_traditional` | `women_western_02` | `https://appworkspro.com/uploads/content/catalog/…` | **Pending** |

### Composite / supporting assets (not separate catalog styles)

| File | Disposition |
|------|-------------|
| `Trending Fashion/Frame 5798.png` | **Supporting asset only.** Three-panel strip: center = same as `Frame 6.png` (`men_trending_01`), right = same as `Frame 8.png` (`women_trending_01`). Left panel (leopard cream suit) has no standalone file — **not** imported as its own style to avoid duplicate user-facing entries. |

**20/20 ZIP files accounted:** 19 catalog styles + 1 composite excluded from catalog.

---

## C. Full style configuration (prompts + engine)

**Engine (all styles):** BFL **Virtual Try-On v2** (Phase 2 full-outfit) via `region=outfit` in `promptCommand` and `shouldUseVtoEngine` / `buildFullOutfitPhase2VtoPrompt`. Beauty FLUX path not used.

Full `prompt_command` strings are in `artifacts/archive-style-import/import-results.json` (dry-run). Example pattern matches existing seed (`COMMAND: style_ref=… | category=… | pipeline=… | tab=… | region=outfit | …`).

| Style ID | Engine | API verification | Generation test |
|----------|--------|------------------|-----------------|
| All 19 planned IDs | BFL VTO v2 | **Not run** (import blocked) | **Not run** |

---

## D. Frontend integration mapping (planned IDs — update URLs after import)

```json
{
  "new_styles": [
    { "folder": "Chinese Traditional", "file": "Frame 6.png", "displayName": "Women Chinese 29 — Sky Blue Hanfu", "categoryId": "wardrobe_browse", "styleId": "women_chinese_29", "tab": "chinese", "gender": "women" },
    { "folder": "Chinese Traditional", "file": "Frame 7.png", "displayName": "Women Chinese 30 — Red Bridal Hanfu", "categoryId": "wardrobe_browse", "styleId": "women_chinese_30", "tab": "chinese", "gender": "women" },
    { "folder": "Chinese Traditional", "file": "Frame 8.png", "displayName": "Men Chinese 29 — Black Scholar Robe", "categoryId": "wardrobe_browse", "styleId": "men_chinese_29", "tab": "chinese", "gender": "men" },
    { "folder": "Couple _ Duo Styles", "file": "Frame 20.png", "displayName": "Couple 12 — Tropical Casual Duo", "categoryId": "couple_duo", "styleId": "couple_12", "personGender": "men" },
    { "folder": "Couple _ Duo Styles", "file": "Frame 21.png", "displayName": "Couple 13 — South Indian Traditional Duo", "categoryId": "couple_duo", "styleId": "couple_13", "personGender": "men" },
    { "folder": "Couple _ Duo Styles", "file": "Frame 22.png", "displayName": "Couple 14 — Neutral Beach Duo", "categoryId": "couple_duo", "styleId": "couple_14", "personGender": "men" },
    { "folder": "Eastern Traditional", "file": "Frame 6.png", "displayName": "Men Arabian 35 — White Thobe", "categoryId": "eastern_traditional", "styleId": "men_arabian_35", "tab": "arabian_mens", "gender": "men" },
    { "folder": "Eastern Traditional", "file": "Frame 7.png", "displayName": "Women Arabian 35 — Red Embroidered Kaftan", "categoryId": "eastern_traditional", "styleId": "women_arabian_35", "tab": "arabian_womens", "gender": "women" },
    { "folder": "Eastern Traditional", "file": "Frame 8.png", "displayName": "Men Indian 31 — Lavender Kurta Waistcoat", "categoryId": "eastern_traditional", "styleId": "men_indian_31", "tab": "indian_mens", "gender": "men" },
    { "folder": "Outfit change", "file": "Frame 6.png", "displayName": "Women Outfit Change 12 — Yellow Tracksuit", "categoryId": "outfit_change", "styleId": "women_outfit_change_12", "gender": "women" },
    { "folder": "Outfit change", "file": "Frame 7.png", "displayName": "Men Outfit Change 12 — Camel Overcoat", "categoryId": "outfit_change", "styleId": "men_outfit_change_12", "gender": "men" },
    { "folder": "Outfit change", "file": "Frame 8.png", "displayName": "Women Outfit Change 13 — Red Drape Mini Dress", "categoryId": "outfit_change", "styleId": "women_outfit_change_13", "gender": "women" },
    { "folder": "Pick look for occasions", "file": "Frame 12.png", "displayName": "Women Formal 11 — Navy Peplum Suit", "categoryId": "occasions", "styleId": "women_formal_11", "tab": "formal", "gender": "women" },
    { "folder": "Pick look for occasions", "file": "Frame 13.png", "displayName": "Women Wedding 11 — Beach Bridal Veil", "categoryId": "occasions", "styleId": "women_wedding_11", "tab": "wedding", "gender": "women" },
    { "folder": "Trending Fashion", "file": "Frame 6.png", "displayName": "Men Trending 01 — Brown Biker Jacket", "categoryId": "trending_fashion", "styleId": "men_trending_01", "tab": "street_mens", "gender": "men" },
    { "folder": "Trending Fashion", "file": "Frame 8.png", "displayName": "Women Trending 01 — Faux Fur Street Glam", "categoryId": "trending_fashion", "styleId": "women_trending_01", "tab": "street_womens", "gender": "women" },
    { "folder": "Western Traditional", "file": "Frame 6.png", "displayName": "Women Western 01 — Red Embroidered Jacket", "categoryId": "western_traditional", "styleId": "women_western_01", "tab": "heritage_womens", "gender": "women" },
    { "folder": "Western Traditional", "file": "Frame 7.png", "displayName": "Men Western 01 — Cowboy Gentleman", "categoryId": "western_traditional", "styleId": "men_western_01", "tab": "heritage_mens", "gender": "men" },
    { "folder": "Western Traditional", "file": "Frame 8.png", "displayName": "Women Western 02 — Boho Crop & Medallion Belt", "categoryId": "western_traditional", "styleId": "women_western_02", "tab": "heritage_womens", "gender": "women" }
  ],
  "try_on_generate_example": {
    "style_id": "women_chinese_29",
    "category_id": "wardrobe_browse",
    "source_image_base64": "<user photo>",
    "person_gender": "women"
  }
}
```

After import, merge `imageUrl` from `GET /api/v1/admin/catalog/styles?style_id=…` or public catalog item `image_url` / `image_absolute_url`.

---

## E. Verification evidence

| Check | Endpoint / method | Result |
|-------|-------------------|--------|
| Baseline style count | Public `GET /catalog/{category}?gender=men\|women` (10 categories) | **419** unique IDs |
| Production admin auth | `POST /auth/admin/login` | **401** with workspace `.env.local` admin |
| Import dry-run plan | `node scripts/import-archive-styles-production.mjs --dry-run` | **19** styles planned, prompts written to `artifacts/archive-style-import/import-results.json` |
| Post-import admin GET | `GET /admin/catalog/styles` | **Not executed** |
| Post-import public catalog | `GET /catalog/{categoryId}` | **Not executed** |
| Image HEAD | `HEAD` on uploaded URL | **Not executed** |
| Try-on generate | `POST /try-on/generate` | **Not executed** |

**Backup:** `artifacts/archive-style-import/production-baseline-public.json` (public API baseline). Admin export of full catalog was **not** possible without production credentials.

---

## F. Outstanding problems

### Blocker: production admin authentication

- **What failed:** `POST https://appworkspro.com/api/v1/auth/admin/login` returns `401 UNAUTHORIZED` when using local `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local` (`admin@example.com` — local bootstrap only).
- **Impact:** No uploads, no category/style PATCH, no verified production IDs or image URLs yet.
- **Next steps (choose one):**

  1. **From your machine** — set production credentials and re-run:
     ```bash
     set PRODUCTION_ADMIN_EMAIL=<production-admin-email>
     set PRODUCTION_ADMIN_PASSWORD=<production-admin-password>
     node scripts/import-archive-styles-production.mjs
     ```
     Or set `PRODUCTION_ACCESS_TOKEN` to a valid admin bearer token.

  2. **On the VPS** (recommended) — copy `Archive.zip` to `/var/www/ai-outfit-changer/`, ensure VPS `.env.local` has the real admin password, deploy the engine-routing commit, then:
     ```bash
     chmod +x deploy/vps-import-archive-styles.sh
     ./deploy/vps-import-archive-styles.sh
     ```

  3. After success, re-open this report section A/B/E with counts from `artifacts/archive-style-import/import-results.json` (live run overwrites dry-run).

### Seed / deploy note

Production uses `DISABLE_CONTENT_SEED=1`; new Mongo catalog rows **persist** across restarts. They are **not** in `asset-catalog.generated.json` until you optionally add them to the CSV/seed pipeline for future greenfield seeds.

### Generation QA

No BFL try-on calls were made (import incomplete). After import, run spot checks per style via `POST /try-on/generate` with `category_id` + `style_id` from the table above.

---

## G. How to complete and refresh this report

1. Run live import (see §F).  
2. Verify `import-results.json` shows `created: 19`, each `status: "verified"`.  
3. Update §A counts and §B image URLs from `image_absolute_url` in results.  
4. Run optional generation tests and append results to §C.
