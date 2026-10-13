# Catalog & Home Feed — production verification (backend)

**Verified:** 2026-10-13 (live curl against production)  
**Base URL:** `https://appworkspro.com/api/v1`  
**Verdict:** API returns styles when URLs match this doc. Empty grids on device are **not** because production has no catalog data — fix **app request URL, `gender`, and client-side filters**.

### Live proof — Bearer login (same counts as no auth)

| Field | Value |
|-------|--------|
| **Captured (UTC)** | 2026-10-13 ~11:24 UTC |
| **Account** | `POST /auth/register` → `catalog.proof.1791908270@mailinator.com` (disposable; proof only) |
| **Token** | `access_token` length **175** chars — used as `Authorization: Bearer …` on every row below |
| **Auth vs public** | **Identical** `items` count for all paths (catalog/home do not require login) |
| **Machine-readable** | `artifacts/catalog-live-proof-bearer.json` in backend repo |

**Reproduce login:**

```bash
API_BASE="https://appworkspro.com/api/v1"
# register once (password 8+)
curl -sS -X POST "$API_BASE/auth/register" -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"YourPass8!","display_name":"QA"}' | jq -r .data.access_token
export ACCESS_TOKEN="eyJ..."
curl -sS -H "Authorization: Bearer $ACCESS_TOKEN" "$API_BASE/catalog/beard_styles?gender=men" | jq '.data.items | length'
```

#### APIs with **0 items** (expected — backend content or wrong URL)

| API | Items (Bearer) |
|-----|---------------:|
| `GET /catalog/presets?gender=women` | 0 |
| `GET /catalog/presets?gender=men&tab=preset_interview` | 0 |
| `GET /catalog/presets?gender=men&tab=preset_wedding_guest` | 0 |
| `GET /catalog/presets?gender=women&tab=preset_interview` | 0 |
| `GET /catalog/presets?gender=women&tab=preset_wedding_guest` | 0 |
| `GET /catalog/occasions?gender=men&tab=wedding` | 0 |
| `GET /catalog/virtual_try_on?tab=shirts` (**no `gender`**) | **20** mixed men+women shirts (after deploy); was 0 before wardrobe shim without gender |
| `GET /catalog/couple_duo?gender=men&tab=shirts` (**wrong `tab`**) | 0 |

#### APIs with **data** (app must show grid when using these URLs)

| API | Items (Bearer) |
|-----|---------------:|
| `GET /home/feed?gender=men` | 15 total (**occasions** section 0) |
| `GET /home/feed?gender=women` | 23 |
| `GET /catalog/beard_styles?gender=men` | 10 |
| `GET /catalog/hair_styles?gender=men` / `women` | 8 / 8 |
| `GET /catalog/hair_color?gender=men` / `women` | 10 / 10 |
| `GET /catalog/hijab_styles?gender=women` | 10 |
| `GET /catalog/outfit_change?gender=men` / `women` | 2 / 11 |
| `GET /catalog/occasions?gender=men` (no tab) | 20 |
| `GET /catalog/occasions?gender=men&tab=casual` / `formal` | 10 / 10 |
| `GET /catalog/couple_duo?gender=men` / `women` | 11 / 11 |
| `GET /catalog/presets?gender=men` / `tab=preset_gym` | 10 / 10 |
| `GET /catalog/wardrobe_browse?gender=men&tab=shirts` | 10 |
| `GET /catalog/wardrobe_browse?gender=women&tab=skirts` | 16 |
| `GET /catalog/virtual_try_on?gender=men&tab=shirts` | 10 |

**Wedding Guest presets:** `preset_wedding_guest` → **0** on live server (not seeded). **Gym (men)** → **10**. Empty Wedding Guest tab is **not** an app bug.

---

## 1. Live results (copy-paste reproduce)

Run in PowerShell or bash (`jq` optional). Count = `data.items.length` or sum of `data.sections[].items`.

| ID | GET path | Items | OK for UI? |
|----|----------|------:|------------|
| `home_feed_men` | `/home/feed?gender=men` | **15** (3 sections) | Yes |
| `home_feed_women` | `/home/feed?gender=women` | **23** (3 sections) | Yes |
| `beard_styles_men` | `/catalog/beard_styles?gender=men` | **10** | Yes — View All Beard |
| `beard_styles_women` | `/catalog/beard_styles?gender=women` | **10** | Yes (same men beards; category is men-scoped) |
| `wardrobe_men_shirts` | `/catalog/wardrobe_browse?gender=men&tab=shirts` | **10** | Yes — **Virtual Try-On grid (recommended)** |
| `wardrobe_women_skirts` | `/catalog/wardrobe_browse?gender=women&tab=skirts` | **16** | Yes |
| `vto_shim_men_shirts` | `/catalog/virtual_try_on?gender=men&tab=shirts` | **10** | Yes — legacy shim (same grid as wardrobe) |
| `vto_no_gender_shirts` | `/catalog/virtual_try_on?tab=shirts` (no `gender`) | **20** mixed | OK — men+women shirts; optional `gender` to filter |
| `couple_duo_men` | `/catalog/couple_duo?gender=men` | **11** | Yes — Couple View All |
| `couple_duo_women` | `/catalog/couple_duo?gender=women` | **11** | Yes |
| `couple_duo_tab_shirts` | `/catalog/couple_duo?gender=men&tab=shirts` | **0** | **NO — do not send garment `tab` on couple_duo** |
| `presets_men_gym` | `/catalog/presets?gender=men&tab=preset_gym` | **10** | Yes |
| `presets_men_gym_alias` | `/catalog/presets?gender=men&tab=gym` | **10** | Yes (`gym` → `preset_gym` on server) |
| `presets_men_all` | `/catalog/presets?gender=men` | **10** | Yes (no `tab` query) |
| `presets_women_all` | `/catalog/presets?gender=women` | **0** | Expected until women presets seeded |
| `presets_women_gym` | `/catalog/presets?gender=women&tab=preset_gym` | **0** | Expected (men-only gym on server) |
| `presets_men_interview` | `/catalog/presets?gender=men&tab=preset_interview` | **0** | Backend content gap (not seeded) |
| `presets_men_wedding` | `/catalog/presets?gender=men&tab=preset_wedding_guest` | **0** | Backend content gap |
| `hair_styles_men` | `/catalog/hair_styles?gender=men` | **8** | Yes |
| `hair_styles_women` | `/catalog/hair_styles?gender=women` | **8** | Yes |
| `occasions_men_casual` | `/catalog/occasions?gender=men&tab=casual` | **10** | Yes (catalog) |
| `occasions_women_casual` | `/catalog/occasions?gender=women&tab=casual` | **10** | Yes |
| `wardrobe_categories_men` | `/wardrobe/categories?gender=men` | **5** categories | Yes — Wardrobe screen |
| `wardrobe_categories_women` | `/wardrobe/categories?gender=women` | **5** categories | Yes |
| `wardrobe_men_chinese` | `/catalog/wardrobe_browse?gender=men&tab=chinese` | **14** | Yes — Wardrobe View All |

**CDN sample:** `HEAD https://appworkspro.com/media/catalog/beard_styles/men_beard_01.png` → **200**

### Home feed per section (not only total count)

| Section | `gender=men` items | `gender=women` items |
|---------|------------------:|---------------------:|
| `beauty_lab` | 4 | 4 |
| `occasions` | **0** | 8 |
| `couple_duo` | 11 | 11 |

Men **Occasions rail** on home is empty on server today; **Couple rail is not empty** on API. If Couple View All is empty on app, the bug is in the app catalog screen, not home feed.

---

## 2. Curl examples

```bash
export API_BASE="https://appworkspro.com/api/v1"

# Home
curl -sS "$API_BASE/home/feed?gender=men" | jq '.data.sections[] | {id, n: (.items|length)}'

# Beard View All
curl -sS "$API_BASE/catalog/beard_styles?gender=men" | jq '.data.items | length'

# Virtual Try-On grid (use wardrobe_browse OR virtual_try_on WITH gender)
curl -sS "$API_BASE/catalog/wardrobe_browse?gender=men&tab=shirts" | jq '.data.items | length'
curl -sS "$API_BASE/catalog/virtual_try_on?gender=men&tab=shirts" | jq '.data.items | length'

# WRONG — returns 0
curl -sS "$API_BASE/catalog/virtual_try_on?tab=shirts" | jq '.data.items | length'

# Couple View All — no garment tab
curl -sS "$API_BASE/catalog/couple_duo?gender=men" | jq '.data.items | length'

# WRONG — returns 0 if app reuses VTO tab
curl -sS "$API_BASE/catalog/couple_duo?gender=men&tab=shirts" | jq '.data.items | length'

# Presets
curl -sS "$API_BASE/catalog/presets?gender=men&tab=preset_gym" | jq '.data.items | length'
```

Auth (`Authorization: Bearer …`) is **optional** for these GETs; same JSON was returned without token during verification.

---

## 3. Mobile app — required behavior

### 3.1 Base URL & response shape

- Base: `https://appworkspro.com/api/v1`
- Success body: `{ "data": { ... }, "error": null }`
- Style list: **`data.items`** (array). Each row: `id` (use as `style_id` in try-on), `image_url`, `gender`, `tab_id` (may be **`null`**), `name`, `sort_order`.
- Do **not** read `styles`, `results`, or top-level `items` without `data`.

### 3.2 `gender` query (Wardrobe Men/Women toggle)

**Recommended:** use the **same** value everywhere: `gender=men` or `gender=women`.

**Optional (omit `gender`):** catalog / home feed / wardrobe return **men + women mixed** where `gender_scope` is `both` (e.g. `wardrobe_browse?tab=shirts` → ~20 items). Each catalog item includes `gender` / `gender_tab_id` for UI badges. Men-only categories (e.g. `beard_styles`) unchanged. Send `gender` when the app should show one pipeline only.

| Screen | `categoryId` in UI | HTTP |
|--------|-------------------|------|
| Home feed | — | `GET /home/feed?gender=men\|women` |
| Beard View All | `beard_styles` | `GET /catalog/beard_styles?gender=men` (women users still use men beard catalog) |
| Virtual Try-On grid | `virtual_try_on` | `GET /catalog/wardrobe_browse?gender=&tab=tops\|shirts\|…` **OR** `GET /catalog/virtual_try_on?gender=&tab=…` (`gender` optional → mixed grid) |
| Couple View All | `couple_duo` | `GET /catalog/couple_duo?gender=men\|women` — **no `tab` query** |
| AI Presets View All | `presets` | `GET /catalog/presets?gender=men\|women` — optional server `tab=`; see §3.3 |
| Wardrobe categories | — | `GET /wardrobe/categories?gender=men\|women` |
| Wardrobe View All | `wardrobe_browse` | `GET /catalog/wardrobe_browse?gender=&tab=chinese\|indian\|…` |

**Image URLs:** relative paths (`/media/catalog/...`) → prefix `https://appworkspro.com`.

### 3.3 Presets tabs (client-side filter)

Server today only has **`preset_gym`** items (all `gender=men`). API `tabs` may only list `preset_gym`.

- **Gym + Men:** show items where `tab_id == "preset_gym"` (or `id` starts with `men_preset_gym_`).
- **Gym + Women:** API returns **0** items — show empty state or hide tab until backend adds women presets.
- **Interview / Wedding guest:** API returns **0** — backend not seeded; empty is correct until content is added.

If the app fetches `presets?gender=men` once and filters tabs in UI, do **not** drop items when `tab_id` is null (beard/couple). For presets, filter by `tab_id === "preset_gym"` only on the Presets screen.

### 3.4 Do not reuse Virtual Try-On `tab` on other catalogs

Production returns **0 items** for:

- `couple_duo?…&tab=shirts` (or any garment tab)
- `beard_styles?…&tab=<anything except all>` e.g. `tab=short` → 0

When navigating from VTO to Couple/Beard, **clear `tab`** from the catalog request or use category-specific tabs from `data.tabs` only.

### 3.5 Debugging checklist (device)

1. Log full URL for each empty grid.
2. Compare to §1 table — if URL matches a row with **0** and “NO”, fix the app.
3. If URL matches a row with **10+** and UI still empty → parsing/filter bug (`data.items`, `tab_id` filter, or image base URL).
4. Confirm Wardrobe gender matches catalog `gender` (especially Presets Gym).

---

## 4. Backend content gaps (not app bugs)

| Item | Status |
|------|--------|
| Presets Interview / Wedding guest | Not seeded — `items: []` |
| Presets for `gender=women` | Not seeded — `items: []` |
| Home feed Occasions rail for `gender=men` | `items: []` in feed (catalog `occasions?tab=casual` still has 10 for men) |

---

## 5. Correction vs older mobile doc

- **Virtual Try-On:** `wardrobe_browse?gender=&tab=` is the documented primary path; `virtual_try_on?gender=&tab=` also returns **10** for shirts when `gender` is set. **`virtual_try_on?tab=shirts` without `gender` always returns 0** — common mistake.
- **Couple View All** must be documented as `GET /catalog/couple_duo?gender=` with **no** garment `tab`.
- **Beard:** use `GET /catalog/beard_styles?gender=men`; items have `tab_id: null` — do not require a beard sub-tab on the query string.

---

## 6. One-line message for QA

Production API is fine: verified counts in §1. If the app shows “No styles in this tab”, capture the request URL — almost always wrong/missing `gender`, wrong `tab` on couple/beard, women gender on men-only presets, or client filter on `tab_id` / wrong JSON path.
