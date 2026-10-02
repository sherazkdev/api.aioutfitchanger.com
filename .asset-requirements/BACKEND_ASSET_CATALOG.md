# Backend Asset Catalog — Outfit Changer / AI Wardrobe

Generated: **2026-10-02** from `assets/images/` (mobile bundle).

Audience: **backend developer** uploading catalog media so the Flutter app
can fetch images via API instead of APK assets.

---

## 1. How the app loads images today

| Screen | API | Fallback |
|--------|-----|----------|
| **Home** rails | `GET /home/feed?gender=men|women` → `thumbnail_url` per item | Bundled PNG under `assets/images/home/` |
| **Style catalog** (Try-On) | `GET /catalog/{category_id}?gender=&tab=` → `image_url` | Same folder structure + `style_id` in app |
| **Wardrobe** tab | `GET /wardrobe/categories?gender=` → `image_url` / `thumbnail_url` | Regional rails + browse catalog |

**URL rules (mobile):**
- Absolute `https://...` → used as-is
- Relative `/media/...` → `https://appworkspro.com` + path (see `ApiMediaUrl` in app)
- Prefer **HTTPS WebP/JPEG** thumbnails ~400px wide for grids/rails

**Onboarding / splash:** local only — **not** in this catalog.

---

## 2. Category IDs (must match mobile)

| `category_id` | UI title (l10n key) | Gender tabs | Sub-tabs (`tab` query) |
|---------------|----------------------|-------------|-------------------------|
| `virtual_try_on` | homeVirtualTryOn | men, women | tops, shirts, bottoms, skirts, jackets |
| `hair_styles` | homeHairStyles | men, women | — |
| `beard_styles` | homeBeardStyles | men only | — |
| `hair_color` | homeHairColor | men, women | — |
| `hijab_styles` | homeHijabStyles | women only | — |
| `outfit_change` | homeOutfitChange | men, women | — |
| `occasions` | homePickLookOccasions | men, women | casual, formal, wedding |
| `couple_duo` | homeCoupleDuoStyles | neutral | — |
| `presets` | homeAiLookPresets | neutral | preset_interview, preset_gym, preset_wedding_guest |
| `wardrobe_browse` | wardrobeBrowseTitle | men, women | chinese, indian, arabian, korean, pakistani + garments |

---

## 3. Wardrobe tab categories (`GET /wardrobe/categories`)

| `id` | `browse_tab_id` | Title key |
|------|-----------------|-----------|
| `chinese_traditional` | `chinese` | `wardrobeChineseTraditional` |
| `indian_traditional` | `indian` | `wardrobeIndianTraditional` |
| `korean_traditional` | `korean` | `wardrobeKoreanTraditional` |
| `pakistani_traditional` | `pakistani` | `wardrobePakistaniTraditional` |
| `arabian_traditional` | `arabian` | `wardrobeArabianTraditional` |

---

## 4. Recommended server folder layout

Mirror mobile paths under CDN/storage:

```text
media/
  catalog/
    {category_id}/
      {style_id}.webp          # grid / rail thumbnail
      {style_id}_full.webp     # optional AI reference (~1024px)
  wardrobe/
    categories/
      {category_id}_hero.webp
    ui/
      {region}_rail_01.webp    # optional; app has local fallbacks
  home/
    ui/                        # section card art (optional feed icons)
```

Example API `image_url`: `/media/catalog/outfit_change/women_outfit_change_01.webp`

---

## 5. Style ID convention (must match mobile prompts)

Mobile generates stable IDs (see `StyleCatalogStore._styleId`):

- `{gender}_{tab}_{nn}` → e.g. `women_casual_03`, `men_jackets_12`
- `{gender}_{category_slug}_{nn}` → e.g. `men_hair_styles_01`, `women_tryon_04`
- `{tab}_{nn}` → e.g. `casual_01`, `preset_gym_01`
- `{category_slug}_{nn}` → e.g. `couple_01`, `outfit_change_02`

**Total catalog style files in repo:** 419

---

## 6. Full style inventory (by category)

### `beard_styles` (10 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `men_beard_01` | men | — | 1 | `assets/images/home/men/beauty-lab/beard-styles/style_01.png` | `/media/catalog/beard_styles/men_beard_01.webp` |
| `men_beard_02` | men | — | 2 | `assets/images/home/men/beauty-lab/beard-styles/style_02.png` | `/media/catalog/beard_styles/men_beard_02.webp` |
| `men_beard_03` | men | — | 3 | `assets/images/home/men/beauty-lab/beard-styles/style_03.png` | `/media/catalog/beard_styles/men_beard_03.webp` |
| `men_beard_04` | men | — | 4 | `assets/images/home/men/beauty-lab/beard-styles/style_04.png` | `/media/catalog/beard_styles/men_beard_04.webp` |
| `men_beard_05` | men | — | 5 | `assets/images/home/men/beauty-lab/beard-styles/style_05.png` | `/media/catalog/beard_styles/men_beard_05.webp` |
| `men_beard_06` | men | — | 6 | `assets/images/home/men/beauty-lab/beard-styles/style_06.png` | `/media/catalog/beard_styles/men_beard_06.webp` |
| `men_beard_07` | men | — | 7 | `assets/images/home/men/beauty-lab/beard-styles/style_07.png` | `/media/catalog/beard_styles/men_beard_07.webp` |
| `men_beard_08` | men | — | 8 | `assets/images/home/men/beauty-lab/beard-styles/style_08.png` | `/media/catalog/beard_styles/men_beard_08.webp` |
| `men_beard_09` | men | — | 9 | `assets/images/home/men/beauty-lab/beard-styles/style_09.png` | `/media/catalog/beard_styles/men_beard_09.webp` |
| `men_beard_10` | men | — | 10 | `assets/images/home/men/beauty-lab/beard-styles/style_10.png` | `/media/catalog/beard_styles/men_beard_10.webp` |

### `couple_duo` (11 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `couple_01` | — | — | 1 | `assets/images/home/couple-duo/style_01.png` | `/media/catalog/couple_duo/couple_01.webp` |
| `couple_02` | — | — | 2 | `assets/images/home/couple-duo/style_02.png` | `/media/catalog/couple_duo/couple_02.webp` |
| `couple_03` | — | — | 3 | `assets/images/home/couple-duo/style_03.png` | `/media/catalog/couple_duo/couple_03.webp` |
| `couple_04` | — | — | 4 | `assets/images/home/couple-duo/style_04.png` | `/media/catalog/couple_duo/couple_04.webp` |
| `couple_05` | — | — | 5 | `assets/images/home/couple-duo/style_05.png` | `/media/catalog/couple_duo/couple_05.webp` |
| `couple_06` | — | — | 6 | `assets/images/home/couple-duo/style_06.png` | `/media/catalog/couple_duo/couple_06.webp` |
| `couple_07` | — | — | 7 | `assets/images/home/couple-duo/style_07.png` | `/media/catalog/couple_duo/couple_07.webp` |
| `couple_08` | — | — | 8 | `assets/images/home/couple-duo/style_08.png` | `/media/catalog/couple_duo/couple_08.webp` |
| `couple_09` | — | — | 9 | `assets/images/home/couple-duo/style_09.png` | `/media/catalog/couple_duo/couple_09.webp` |
| `couple_10` | — | — | 10 | `assets/images/home/couple-duo/style_10.png` | `/media/catalog/couple_duo/couple_10.webp` |
| `couple_11` | — | — | 11 | `assets/images/home/couple-duo/style_11.png` | `/media/catalog/couple_duo/couple_11.webp` |

### `hair_color` (20 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `men_hair_color_01` | men | men | 1 | `assets/images/home/men/beauty-lab/hair-color/style_01.png` | `/media/catalog/hair_color/men_hair_color_01.webp` |
| `men_hair_color_02` | men | men | 2 | `assets/images/home/men/beauty-lab/hair-color/style_02.png` | `/media/catalog/hair_color/men_hair_color_02.webp` |
| `men_hair_color_03` | men | men | 3 | `assets/images/home/men/beauty-lab/hair-color/style_03.png` | `/media/catalog/hair_color/men_hair_color_03.webp` |
| `men_hair_color_04` | men | men | 4 | `assets/images/home/men/beauty-lab/hair-color/style_04.png` | `/media/catalog/hair_color/men_hair_color_04.webp` |
| `men_hair_color_05` | men | men | 5 | `assets/images/home/men/beauty-lab/hair-color/style_05.png` | `/media/catalog/hair_color/men_hair_color_05.webp` |
| `men_hair_color_06` | men | men | 6 | `assets/images/home/men/beauty-lab/hair-color/style_06.png` | `/media/catalog/hair_color/men_hair_color_06.webp` |
| `men_hair_color_07` | men | men | 7 | `assets/images/home/men/beauty-lab/hair-color/style_07.png` | `/media/catalog/hair_color/men_hair_color_07.webp` |
| `men_hair_color_08` | men | men | 8 | `assets/images/home/men/beauty-lab/hair-color/style_08.png` | `/media/catalog/hair_color/men_hair_color_08.webp` |
| `men_hair_color_09` | men | men | 9 | `assets/images/home/men/beauty-lab/hair-color/style_09.png` | `/media/catalog/hair_color/men_hair_color_09.webp` |
| `men_hair_color_10` | men | men | 10 | `assets/images/home/men/beauty-lab/hair-color/style_10.png` | `/media/catalog/hair_color/men_hair_color_10.webp` |
| `women_hair_color_01` | women | women | 1 | `assets/images/home/women/beauty-lab/hair-color/style_01.png` | `/media/catalog/hair_color/women_hair_color_01.webp` |
| `women_hair_color_02` | women | women | 2 | `assets/images/home/women/beauty-lab/hair-color/style_02.png` | `/media/catalog/hair_color/women_hair_color_02.webp` |
| `women_hair_color_03` | women | women | 3 | `assets/images/home/women/beauty-lab/hair-color/style_03.png` | `/media/catalog/hair_color/women_hair_color_03.webp` |
| `women_hair_color_04` | women | women | 4 | `assets/images/home/women/beauty-lab/hair-color/style_04.png` | `/media/catalog/hair_color/women_hair_color_04.webp` |
| `women_hair_color_05` | women | women | 5 | `assets/images/home/women/beauty-lab/hair-color/style_05.png` | `/media/catalog/hair_color/women_hair_color_05.webp` |
| `women_hair_color_06` | women | women | 6 | `assets/images/home/women/beauty-lab/hair-color/style_06.png` | `/media/catalog/hair_color/women_hair_color_06.webp` |
| `women_hair_color_07` | women | women | 7 | `assets/images/home/women/beauty-lab/hair-color/style_07.png` | `/media/catalog/hair_color/women_hair_color_07.webp` |
| `women_hair_color_08` | women | women | 8 | `assets/images/home/women/beauty-lab/hair-color/style_08.png` | `/media/catalog/hair_color/women_hair_color_08.webp` |
| `women_hair_color_09` | women | women | 9 | `assets/images/home/women/beauty-lab/hair-color/style_09.png` | `/media/catalog/hair_color/women_hair_color_09.webp` |
| `women_hair_color_10` | women | women | 10 | `assets/images/home/women/beauty-lab/hair-color/style_10.png` | `/media/catalog/hair_color/women_hair_color_10.webp` |

### `hair_styles` (16 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `men_hair_styles_01` | men | men | 1 | `assets/images/home/men/beauty-lab/hair-styles/style_01.png` | `/media/catalog/hair_styles/men_hair_styles_01.webp` |
| `men_hair_styles_02` | men | men | 2 | `assets/images/home/men/beauty-lab/hair-styles/style_02.png` | `/media/catalog/hair_styles/men_hair_styles_02.webp` |
| `men_hair_styles_03` | men | men | 3 | `assets/images/home/men/beauty-lab/hair-styles/style_03.png` | `/media/catalog/hair_styles/men_hair_styles_03.webp` |
| `men_hair_styles_04` | men | men | 4 | `assets/images/home/men/beauty-lab/hair-styles/style_04.png` | `/media/catalog/hair_styles/men_hair_styles_04.webp` |
| `men_hair_styles_05` | men | men | 5 | `assets/images/home/men/beauty-lab/hair-styles/style_05.png` | `/media/catalog/hair_styles/men_hair_styles_05.webp` |
| `men_hair_styles_06` | men | men | 6 | `assets/images/home/men/beauty-lab/hair-styles/style_06.png` | `/media/catalog/hair_styles/men_hair_styles_06.webp` |
| `men_hair_styles_07` | men | men | 7 | `assets/images/home/men/beauty-lab/hair-styles/style_07.png` | `/media/catalog/hair_styles/men_hair_styles_07.webp` |
| `men_hair_styles_08` | men | men | 8 | `assets/images/home/men/beauty-lab/hair-styles/style_08.png` | `/media/catalog/hair_styles/men_hair_styles_08.webp` |
| `women_hair_styles_01` | women | women | 1 | `assets/images/home/women/beauty-lab/hair-styles/style_01.png` | `/media/catalog/hair_styles/women_hair_styles_01.webp` |
| `women_hair_styles_02` | women | women | 2 | `assets/images/home/women/beauty-lab/hair-styles/style_02.png` | `/media/catalog/hair_styles/women_hair_styles_02.webp` |
| `women_hair_styles_03` | women | women | 3 | `assets/images/home/women/beauty-lab/hair-styles/style_03.png` | `/media/catalog/hair_styles/women_hair_styles_03.webp` |
| `women_hair_styles_04` | women | women | 4 | `assets/images/home/women/beauty-lab/hair-styles/style_04.png` | `/media/catalog/hair_styles/women_hair_styles_04.webp` |
| `women_hair_styles_05` | women | women | 5 | `assets/images/home/women/beauty-lab/hair-styles/style_05.png` | `/media/catalog/hair_styles/women_hair_styles_05.webp` |
| `women_hair_styles_06` | women | women | 6 | `assets/images/home/women/beauty-lab/hair-styles/style_06.png` | `/media/catalog/hair_styles/women_hair_styles_06.webp` |
| `women_hair_styles_07` | women | women | 7 | `assets/images/home/women/beauty-lab/hair-styles/style_07.png` | `/media/catalog/hair_styles/women_hair_styles_07.webp` |
| `women_hair_styles_08` | women | women | 8 | `assets/images/home/women/beauty-lab/hair-styles/style_08.png` | `/media/catalog/hair_styles/women_hair_styles_08.webp` |

### `hijab_styles` (10 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `women_hijab_01` | women | — | 1 | `assets/images/home/women/beauty-lab/hijab-styles/style_01.png` | `/media/catalog/hijab_styles/women_hijab_01.webp` |
| `women_hijab_02` | women | — | 2 | `assets/images/home/women/beauty-lab/hijab-styles/style_02.png` | `/media/catalog/hijab_styles/women_hijab_02.webp` |
| `women_hijab_03` | women | — | 3 | `assets/images/home/women/beauty-lab/hijab-styles/style_03.png` | `/media/catalog/hijab_styles/women_hijab_03.webp` |
| `women_hijab_04` | women | — | 4 | `assets/images/home/women/beauty-lab/hijab-styles/style_04.png` | `/media/catalog/hijab_styles/women_hijab_04.webp` |
| `women_hijab_05` | women | — | 5 | `assets/images/home/women/beauty-lab/hijab-styles/style_05.png` | `/media/catalog/hijab_styles/women_hijab_05.webp` |
| `women_hijab_06` | women | — | 6 | `assets/images/home/women/beauty-lab/hijab-styles/style_06.png` | `/media/catalog/hijab_styles/women_hijab_06.webp` |
| `women_hijab_07` | women | — | 7 | `assets/images/home/women/beauty-lab/hijab-styles/style_07.png` | `/media/catalog/hijab_styles/women_hijab_07.webp` |
| `women_hijab_08` | women | — | 8 | `assets/images/home/women/beauty-lab/hijab-styles/style_08.png` | `/media/catalog/hijab_styles/women_hijab_08.webp` |
| `women_hijab_09` | women | — | 9 | `assets/images/home/women/beauty-lab/hijab-styles/style_09.png` | `/media/catalog/hijab_styles/women_hijab_09.webp` |
| `women_hijab_10` | women | — | 10 | `assets/images/home/women/beauty-lab/hijab-styles/style_10.png` | `/media/catalog/hijab_styles/women_hijab_10.webp` |

### `occasions` (50 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `men_casual_01` | men | casual | 1 | `assets/images/home/men/occasions/casual/style_01.png` | `/media/catalog/occasions/men_casual_01.webp` |
| `men_casual_02` | men | casual | 2 | `assets/images/home/men/occasions/casual/style_02.png` | `/media/catalog/occasions/men_casual_02.webp` |
| `men_casual_03` | men | casual | 3 | `assets/images/home/men/occasions/casual/style_03.png` | `/media/catalog/occasions/men_casual_03.webp` |
| `men_casual_04` | men | casual | 4 | `assets/images/home/men/occasions/casual/style_04.png` | `/media/catalog/occasions/men_casual_04.webp` |
| `men_casual_05` | men | casual | 5 | `assets/images/home/men/occasions/casual/style_05.png` | `/media/catalog/occasions/men_casual_05.webp` |
| `men_casual_06` | men | casual | 6 | `assets/images/home/men/occasions/casual/style_06.png` | `/media/catalog/occasions/men_casual_06.webp` |
| `men_casual_07` | men | casual | 7 | `assets/images/home/men/occasions/casual/style_07.png` | `/media/catalog/occasions/men_casual_07.webp` |
| `men_casual_08` | men | casual | 8 | `assets/images/home/men/occasions/casual/style_08.png` | `/media/catalog/occasions/men_casual_08.webp` |
| `men_casual_09` | men | casual | 9 | `assets/images/home/men/occasions/casual/style_09.png` | `/media/catalog/occasions/men_casual_09.webp` |
| `men_casual_10` | men | casual | 10 | `assets/images/home/men/occasions/casual/style_10.png` | `/media/catalog/occasions/men_casual_10.webp` |
| `men_formal_01` | men | formal | 1 | `assets/images/home/men/occasions/formal/style_01.png` | `/media/catalog/occasions/men_formal_01.webp` |
| `men_formal_02` | men | formal | 2 | `assets/images/home/men/occasions/formal/style_02.png` | `/media/catalog/occasions/men_formal_02.webp` |
| `men_formal_03` | men | formal | 3 | `assets/images/home/men/occasions/formal/style_03.png` | `/media/catalog/occasions/men_formal_03.webp` |
| `men_formal_04` | men | formal | 4 | `assets/images/home/men/occasions/formal/style_04.png` | `/media/catalog/occasions/men_formal_04.webp` |
| `men_formal_05` | men | formal | 5 | `assets/images/home/men/occasions/formal/style_05.png` | `/media/catalog/occasions/men_formal_05.webp` |
| `men_formal_06` | men | formal | 6 | `assets/images/home/men/occasions/formal/style_06.png` | `/media/catalog/occasions/men_formal_06.webp` |
| `men_formal_07` | men | formal | 7 | `assets/images/home/men/occasions/formal/style_07.png` | `/media/catalog/occasions/men_formal_07.webp` |
| `men_formal_08` | men | formal | 8 | `assets/images/home/men/occasions/formal/style_08.png` | `/media/catalog/occasions/men_formal_08.webp` |
| `men_formal_09` | men | formal | 9 | `assets/images/home/men/occasions/formal/style_09.png` | `/media/catalog/occasions/men_formal_09.webp` |
| `men_formal_10` | men | formal | 10 | `assets/images/home/men/occasions/formal/style_10.png` | `/media/catalog/occasions/men_formal_10.webp` |
| `women_casual_01` | women | casual | 1 | `assets/images/home/women/occasions/casual/style_01.png` | `/media/catalog/occasions/women_casual_01.webp` |
| `women_casual_02` | women | casual | 2 | `assets/images/home/women/occasions/casual/style_02.png` | `/media/catalog/occasions/women_casual_02.webp` |
| `women_casual_03` | women | casual | 3 | `assets/images/home/women/occasions/casual/style_03.png` | `/media/catalog/occasions/women_casual_03.webp` |
| `women_casual_04` | women | casual | 4 | `assets/images/home/women/occasions/casual/style_04.png` | `/media/catalog/occasions/women_casual_04.webp` |
| `women_casual_05` | women | casual | 5 | `assets/images/home/women/occasions/casual/style_05.png` | `/media/catalog/occasions/women_casual_05.webp` |
| `women_casual_06` | women | casual | 6 | `assets/images/home/women/occasions/casual/style_06.png` | `/media/catalog/occasions/women_casual_06.webp` |
| `women_casual_07` | women | casual | 7 | `assets/images/home/women/occasions/casual/style_07.png` | `/media/catalog/occasions/women_casual_07.webp` |
| `women_casual_08` | women | casual | 8 | `assets/images/home/women/occasions/casual/style_08.png` | `/media/catalog/occasions/women_casual_08.webp` |
| `women_casual_09` | women | casual | 9 | `assets/images/home/women/occasions/casual/style_09.png` | `/media/catalog/occasions/women_casual_09.webp` |
| `women_casual_10` | women | casual | 10 | `assets/images/home/women/occasions/casual/style_10.png` | `/media/catalog/occasions/women_casual_10.webp` |
| `women_formal_01` | women | formal | 1 | `assets/images/home/women/occasions/formal/style_01.png` | `/media/catalog/occasions/women_formal_01.webp` |
| `women_formal_02` | women | formal | 2 | `assets/images/home/women/occasions/formal/style_02.png` | `/media/catalog/occasions/women_formal_02.webp` |
| `women_formal_03` | women | formal | 3 | `assets/images/home/women/occasions/formal/style_03.png` | `/media/catalog/occasions/women_formal_03.webp` |
| `women_formal_04` | women | formal | 4 | `assets/images/home/women/occasions/formal/style_04.png` | `/media/catalog/occasions/women_formal_04.webp` |
| `women_formal_05` | women | formal | 5 | `assets/images/home/women/occasions/formal/style_05.png` | `/media/catalog/occasions/women_formal_05.webp` |
| `women_formal_06` | women | formal | 6 | `assets/images/home/women/occasions/formal/style_06.png` | `/media/catalog/occasions/women_formal_06.webp` |
| `women_formal_07` | women | formal | 7 | `assets/images/home/women/occasions/formal/style_07.png` | `/media/catalog/occasions/women_formal_07.webp` |
| `women_formal_08` | women | formal | 8 | `assets/images/home/women/occasions/formal/style_08.png` | `/media/catalog/occasions/women_formal_08.webp` |
| `women_formal_09` | women | formal | 9 | `assets/images/home/women/occasions/formal/style_09.png` | `/media/catalog/occasions/women_formal_09.webp` |
| `women_formal_10` | women | formal | 10 | `assets/images/home/women/occasions/formal/style_10.png` | `/media/catalog/occasions/women_formal_10.webp` |
| `women_wedding_01` | women | wedding | 1 | `assets/images/home/women/occasions/wedding/style_01.png` | `/media/catalog/occasions/women_wedding_01.webp` |
| `women_wedding_02` | women | wedding | 2 | `assets/images/home/women/occasions/wedding/style_02.png` | `/media/catalog/occasions/women_wedding_02.webp` |
| `women_wedding_03` | women | wedding | 3 | `assets/images/home/women/occasions/wedding/style_03.png` | `/media/catalog/occasions/women_wedding_03.webp` |
| `women_wedding_04` | women | wedding | 4 | `assets/images/home/women/occasions/wedding/style_04.png` | `/media/catalog/occasions/women_wedding_04.webp` |
| `women_wedding_05` | women | wedding | 5 | `assets/images/home/women/occasions/wedding/style_05.png` | `/media/catalog/occasions/women_wedding_05.webp` |
| `women_wedding_06` | women | wedding | 6 | `assets/images/home/women/occasions/wedding/style_06.png` | `/media/catalog/occasions/women_wedding_06.webp` |
| `women_wedding_07` | women | wedding | 7 | `assets/images/home/women/occasions/wedding/style_07.png` | `/media/catalog/occasions/women_wedding_07.webp` |
| `women_wedding_08` | women | wedding | 8 | `assets/images/home/women/occasions/wedding/style_08.png` | `/media/catalog/occasions/women_wedding_08.webp` |
| `women_wedding_09` | women | wedding | 9 | `assets/images/home/women/occasions/wedding/style_09.png` | `/media/catalog/occasions/women_wedding_09.webp` |
| `women_wedding_10` | women | wedding | 10 | `assets/images/home/women/occasions/wedding/style_10.png` | `/media/catalog/occasions/women_wedding_10.webp` |

### `outfit_change` (13 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `men_outfit_change_01` | men | — | 1 | `assets/images/home/men/outfit-change/style_01.png` | `/media/catalog/outfit_change/men_outfit_change_01.webp` |
| `men_outfit_change_02` | men | — | 2 | `assets/images/home/men/outfit-change/style_02.png` | `/media/catalog/outfit_change/men_outfit_change_02.webp` |
| `women_outfit_change_01` | women | — | 1 | `assets/images/home/women/outfit-change/style_01.png` | `/media/catalog/outfit_change/women_outfit_change_01.webp` |
| `women_outfit_change_02` | women | — | 2 | `assets/images/home/women/outfit-change/style_02.png` | `/media/catalog/outfit_change/women_outfit_change_02.webp` |
| `women_outfit_change_03` | women | — | 3 | `assets/images/home/women/outfit-change/style_03.png` | `/media/catalog/outfit_change/women_outfit_change_03.webp` |
| `women_outfit_change_04` | women | — | 4 | `assets/images/home/women/outfit-change/style_04.png` | `/media/catalog/outfit_change/women_outfit_change_04.webp` |
| `women_outfit_change_05` | women | — | 5 | `assets/images/home/women/outfit-change/style_05.png` | `/media/catalog/outfit_change/women_outfit_change_05.webp` |
| `women_outfit_change_06` | women | — | 6 | `assets/images/home/women/outfit-change/style_06.png` | `/media/catalog/outfit_change/women_outfit_change_06.webp` |
| `women_outfit_change_07` | women | — | 7 | `assets/images/home/women/outfit-change/style_07.png` | `/media/catalog/outfit_change/women_outfit_change_07.webp` |
| `women_outfit_change_08` | women | — | 8 | `assets/images/home/women/outfit-change/style_08.png` | `/media/catalog/outfit_change/women_outfit_change_08.webp` |
| `women_outfit_change_09` | women | — | 9 | `assets/images/home/women/outfit-change/style_09.png` | `/media/catalog/outfit_change/women_outfit_change_09.webp` |
| `women_outfit_change_10` | women | — | 10 | `assets/images/home/women/outfit-change/style_10.png` | `/media/catalog/outfit_change/women_outfit_change_10.webp` |
| `women_outfit_change_11` | women | — | 11 | `assets/images/home/women/outfit-change/style_11.png` | `/media/catalog/outfit_change/women_outfit_change_11.webp` |

### `presets` (10 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `men_preset_gym_01` | men | preset_gym | 1 | `assets/images/home/men/presets/gym/style_01.png` | `/media/catalog/presets/men_preset_gym_01.webp` |
| `men_preset_gym_02` | men | preset_gym | 2 | `assets/images/home/men/presets/gym/style_02.png` | `/media/catalog/presets/men_preset_gym_02.webp` |
| `men_preset_gym_03` | men | preset_gym | 3 | `assets/images/home/men/presets/gym/style_03.png` | `/media/catalog/presets/men_preset_gym_03.webp` |
| `men_preset_gym_04` | men | preset_gym | 4 | `assets/images/home/men/presets/gym/style_04.png` | `/media/catalog/presets/men_preset_gym_04.webp` |
| `men_preset_gym_05` | men | preset_gym | 5 | `assets/images/home/men/presets/gym/style_05.png` | `/media/catalog/presets/men_preset_gym_05.webp` |
| `men_preset_gym_06` | men | preset_gym | 6 | `assets/images/home/men/presets/gym/style_06.png` | `/media/catalog/presets/men_preset_gym_06.webp` |
| `men_preset_gym_07` | men | preset_gym | 7 | `assets/images/home/men/presets/gym/style_07.png` | `/media/catalog/presets/men_preset_gym_07.webp` |
| `men_preset_gym_08` | men | preset_gym | 8 | `assets/images/home/men/presets/gym/style_08.png` | `/media/catalog/presets/men_preset_gym_08.webp` |
| `men_preset_gym_09` | men | preset_gym | 9 | `assets/images/home/men/presets/gym/style_09.png` | `/media/catalog/presets/men_preset_gym_09.webp` |
| `men_preset_gym_10` | men | preset_gym | 10 | `assets/images/home/men/presets/gym/style_10.png` | `/media/catalog/presets/men_preset_gym_10.webp` |

### `virtual_try_on` (20 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `men_tryon_01` | men | — | 1 | `assets/images/home/men/beauty-lab/virtual-try-on/style_01.png` | `/media/catalog/virtual_try_on/men_tryon_01.webp` |
| `men_tryon_02` | men | — | 2 | `assets/images/home/men/beauty-lab/virtual-try-on/style_02.png` | `/media/catalog/virtual_try_on/men_tryon_02.webp` |
| `men_tryon_03` | men | — | 3 | `assets/images/home/men/beauty-lab/virtual-try-on/style_03.png` | `/media/catalog/virtual_try_on/men_tryon_03.webp` |
| `men_tryon_04` | men | — | 4 | `assets/images/home/men/beauty-lab/virtual-try-on/style_04.png` | `/media/catalog/virtual_try_on/men_tryon_04.webp` |
| `men_tryon_05` | men | — | 5 | `assets/images/home/men/beauty-lab/virtual-try-on/style_05.png` | `/media/catalog/virtual_try_on/men_tryon_05.webp` |
| `men_tryon_06` | men | — | 6 | `assets/images/home/men/beauty-lab/virtual-try-on/style_06.png` | `/media/catalog/virtual_try_on/men_tryon_06.webp` |
| `men_tryon_07` | men | — | 7 | `assets/images/home/men/beauty-lab/virtual-try-on/style_07.png` | `/media/catalog/virtual_try_on/men_tryon_07.webp` |
| `men_tryon_08` | men | — | 8 | `assets/images/home/men/beauty-lab/virtual-try-on/style_08.png` | `/media/catalog/virtual_try_on/men_tryon_08.webp` |
| `men_tryon_09` | men | — | 9 | `assets/images/home/men/beauty-lab/virtual-try-on/style_09.png` | `/media/catalog/virtual_try_on/men_tryon_09.webp` |
| `men_tryon_10` | men | — | 10 | `assets/images/home/men/beauty-lab/virtual-try-on/style_10.png` | `/media/catalog/virtual_try_on/men_tryon_10.webp` |
| `women_tryon_01` | women | — | 1 | `assets/images/home/women/beauty-lab/virtual-try-on/style_01.png` | `/media/catalog/virtual_try_on/women_tryon_01.webp` |
| `women_tryon_02` | women | — | 2 | `assets/images/home/women/beauty-lab/virtual-try-on/style_02.png` | `/media/catalog/virtual_try_on/women_tryon_02.webp` |
| `women_tryon_03` | women | — | 3 | `assets/images/home/women/beauty-lab/virtual-try-on/style_03.png` | `/media/catalog/virtual_try_on/women_tryon_03.webp` |
| `women_tryon_04` | women | — | 4 | `assets/images/home/women/beauty-lab/virtual-try-on/style_04.png` | `/media/catalog/virtual_try_on/women_tryon_04.webp` |
| `women_tryon_05` | women | — | 5 | `assets/images/home/women/beauty-lab/virtual-try-on/style_05.png` | `/media/catalog/virtual_try_on/women_tryon_05.webp` |
| `women_tryon_06` | women | — | 6 | `assets/images/home/women/beauty-lab/virtual-try-on/style_06.png` | `/media/catalog/virtual_try_on/women_tryon_06.webp` |
| `women_tryon_07` | women | — | 7 | `assets/images/home/women/beauty-lab/virtual-try-on/style_07.png` | `/media/catalog/virtual_try_on/women_tryon_07.webp` |
| `women_tryon_08` | women | — | 8 | `assets/images/home/women/beauty-lab/virtual-try-on/style_08.png` | `/media/catalog/virtual_try_on/women_tryon_08.webp` |
| `women_tryon_09` | women | — | 9 | `assets/images/home/women/beauty-lab/virtual-try-on/style_09.png` | `/media/catalog/virtual_try_on/women_tryon_09.webp` |
| `women_tryon_10` | women | — | 10 | `assets/images/home/women/beauty-lab/virtual-try-on/style_10.png` | `/media/catalog/virtual_try_on/women_tryon_10.webp` |

### `wardrobe_browse` (259 items)

| style_id | gender | tab | sort | local file | suggested `image_url` path |
|----------|--------|-----|------|------------|---------------------------|
| `men_arabian_01` | men | arabian | 1 | `assets/images/home/men/wardrobe/regional/arabian/style_01.png` | `/media/catalog/wardrobe_browse/men_arabian_01.webp` |
| `men_arabian_02` | men | arabian | 2 | `assets/images/home/men/wardrobe/regional/arabian/style_02.png` | `/media/catalog/wardrobe_browse/men_arabian_02.webp` |
| `men_arabian_03` | men | arabian | 3 | `assets/images/home/men/wardrobe/regional/arabian/style_03.png` | `/media/catalog/wardrobe_browse/men_arabian_03.webp` |
| `men_arabian_04` | men | arabian | 4 | `assets/images/home/men/wardrobe/regional/arabian/style_04.png` | `/media/catalog/wardrobe_browse/men_arabian_04.webp` |
| `men_arabian_05` | men | arabian | 5 | `assets/images/home/men/wardrobe/regional/arabian/style_05.png` | `/media/catalog/wardrobe_browse/men_arabian_05.webp` |
| `men_arabian_06` | men | arabian | 6 | `assets/images/home/men/wardrobe/regional/arabian/style_06.png` | `/media/catalog/wardrobe_browse/men_arabian_06.webp` |
| `men_arabian_07` | men | arabian | 7 | `assets/images/home/men/wardrobe/regional/arabian/style_07.png` | `/media/catalog/wardrobe_browse/men_arabian_07.webp` |
| `men_arabian_08` | men | arabian | 8 | `assets/images/home/men/wardrobe/regional/arabian/style_08.png` | `/media/catalog/wardrobe_browse/men_arabian_08.webp` |
| `men_arabian_09` | men | arabian | 9 | `assets/images/home/men/wardrobe/regional/arabian/style_09.png` | `/media/catalog/wardrobe_browse/men_arabian_09.webp` |
| `men_arabian_10` | men | arabian | 10 | `assets/images/home/men/wardrobe/regional/arabian/style_10.png` | `/media/catalog/wardrobe_browse/men_arabian_10.webp` |
| `men_arabian_11` | men | arabian | 11 | `assets/images/home/men/wardrobe/regional/arabian/style_11.png` | `/media/catalog/wardrobe_browse/men_arabian_11.webp` |
| `men_arabian_12` | men | arabian | 12 | `assets/images/home/men/wardrobe/regional/arabian/style_12.png` | `/media/catalog/wardrobe_browse/men_arabian_12.webp` |
| `men_arabian_13` | men | arabian | 13 | `assets/images/home/men/wardrobe/regional/arabian/style_13.png` | `/media/catalog/wardrobe_browse/men_arabian_13.webp` |
| `men_arabian_14` | men | arabian | 14 | `assets/images/home/men/wardrobe/regional/arabian/style_14.png` | `/media/catalog/wardrobe_browse/men_arabian_14.webp` |
| `men_arabian_15` | men | arabian | 15 | `assets/images/home/men/wardrobe/regional/arabian/style_15.png` | `/media/catalog/wardrobe_browse/men_arabian_15.webp` |
| `men_arabian_16` | men | arabian | 16 | `assets/images/home/men/wardrobe/regional/arabian/style_16.png` | `/media/catalog/wardrobe_browse/men_arabian_16.webp` |
| `men_arabian_17` | men | arabian | 17 | `assets/images/home/men/wardrobe/regional/arabian/style_17.png` | `/media/catalog/wardrobe_browse/men_arabian_17.webp` |
| `men_bottoms_01` | men | bottoms | 1 | `assets/images/home/men/wardrobe/garments/bottoms/style_01.png` | `/media/catalog/wardrobe_browse/men_bottoms_01.webp` |
| `men_bottoms_02` | men | bottoms | 2 | `assets/images/home/men/wardrobe/garments/bottoms/style_02.png` | `/media/catalog/wardrobe_browse/men_bottoms_02.webp` |
| `men_bottoms_03` | men | bottoms | 3 | `assets/images/home/men/wardrobe/garments/bottoms/style_03.png` | `/media/catalog/wardrobe_browse/men_bottoms_03.webp` |
| `men_bottoms_04` | men | bottoms | 4 | `assets/images/home/men/wardrobe/garments/bottoms/style_04.png` | `/media/catalog/wardrobe_browse/men_bottoms_04.webp` |
| `men_bottoms_05` | men | bottoms | 5 | `assets/images/home/men/wardrobe/garments/bottoms/style_05.png` | `/media/catalog/wardrobe_browse/men_bottoms_05.webp` |
| `men_bottoms_06` | men | bottoms | 6 | `assets/images/home/men/wardrobe/garments/bottoms/style_06.png` | `/media/catalog/wardrobe_browse/men_bottoms_06.webp` |
| `men_bottoms_07` | men | bottoms | 7 | `assets/images/home/men/wardrobe/garments/bottoms/style_07.png` | `/media/catalog/wardrobe_browse/men_bottoms_07.webp` |
| `men_bottoms_08` | men | bottoms | 8 | `assets/images/home/men/wardrobe/garments/bottoms/style_08.png` | `/media/catalog/wardrobe_browse/men_bottoms_08.webp` |
| `men_chinese_01` | men | chinese | 1 | `assets/images/home/men/wardrobe/regional/chinese/style_01.png` | `/media/catalog/wardrobe_browse/men_chinese_01.webp` |
| `men_chinese_02` | men | chinese | 2 | `assets/images/home/men/wardrobe/regional/chinese/style_02.png` | `/media/catalog/wardrobe_browse/men_chinese_02.webp` |
| `men_chinese_03` | men | chinese | 3 | `assets/images/home/men/wardrobe/regional/chinese/style_03.png` | `/media/catalog/wardrobe_browse/men_chinese_03.webp` |
| `men_chinese_04` | men | chinese | 4 | `assets/images/home/men/wardrobe/regional/chinese/style_04.png` | `/media/catalog/wardrobe_browse/men_chinese_04.webp` |
| `men_chinese_05` | men | chinese | 5 | `assets/images/home/men/wardrobe/regional/chinese/style_05.png` | `/media/catalog/wardrobe_browse/men_chinese_05.webp` |
| `men_chinese_06` | men | chinese | 6 | `assets/images/home/men/wardrobe/regional/chinese/style_06.png` | `/media/catalog/wardrobe_browse/men_chinese_06.webp` |
| `men_chinese_07` | men | chinese | 7 | `assets/images/home/men/wardrobe/regional/chinese/style_07.png` | `/media/catalog/wardrobe_browse/men_chinese_07.webp` |
| `men_chinese_08` | men | chinese | 8 | `assets/images/home/men/wardrobe/regional/chinese/style_08.png` | `/media/catalog/wardrobe_browse/men_chinese_08.webp` |
| `men_chinese_09` | men | chinese | 9 | `assets/images/home/men/wardrobe/regional/chinese/style_09.png` | `/media/catalog/wardrobe_browse/men_chinese_09.webp` |
| `men_chinese_10` | men | chinese | 10 | `assets/images/home/men/wardrobe/regional/chinese/style_10.png` | `/media/catalog/wardrobe_browse/men_chinese_10.webp` |
| `men_chinese_11` | men | chinese | 11 | `assets/images/home/men/wardrobe/regional/chinese/style_11.png` | `/media/catalog/wardrobe_browse/men_chinese_11.webp` |
| `men_chinese_12` | men | chinese | 12 | `assets/images/home/men/wardrobe/regional/chinese/style_12.png` | `/media/catalog/wardrobe_browse/men_chinese_12.webp` |
| `men_chinese_13` | men | chinese | 13 | `assets/images/home/men/wardrobe/regional/chinese/style_13.png` | `/media/catalog/wardrobe_browse/men_chinese_13.webp` |
| `men_chinese_14` | men | chinese | 14 | `assets/images/home/men/wardrobe/regional/chinese/style_14.png` | `/media/catalog/wardrobe_browse/men_chinese_14.webp` |
| `men_indian_01` | men | indian | 1 | `assets/images/home/men/wardrobe/regional/indian/style_01.png` | `/media/catalog/wardrobe_browse/men_indian_01.webp` |
| `men_indian_02` | men | indian | 2 | `assets/images/home/men/wardrobe/regional/indian/style_02.png` | `/media/catalog/wardrobe_browse/men_indian_02.webp` |
| `men_indian_03` | men | indian | 3 | `assets/images/home/men/wardrobe/regional/indian/style_03.png` | `/media/catalog/wardrobe_browse/men_indian_03.webp` |
| `men_indian_04` | men | indian | 4 | `assets/images/home/men/wardrobe/regional/indian/style_04.png` | `/media/catalog/wardrobe_browse/men_indian_04.webp` |
| `men_indian_05` | men | indian | 5 | `assets/images/home/men/wardrobe/regional/indian/style_05.png` | `/media/catalog/wardrobe_browse/men_indian_05.webp` |
| `men_indian_06` | men | indian | 6 | `assets/images/home/men/wardrobe/regional/indian/style_06.png` | `/media/catalog/wardrobe_browse/men_indian_06.webp` |
| `men_indian_07` | men | indian | 7 | `assets/images/home/men/wardrobe/regional/indian/style_07.png` | `/media/catalog/wardrobe_browse/men_indian_07.webp` |
| `men_indian_08` | men | indian | 8 | `assets/images/home/men/wardrobe/regional/indian/style_08.png` | `/media/catalog/wardrobe_browse/men_indian_08.webp` |
| `men_indian_09` | men | indian | 9 | `assets/images/home/men/wardrobe/regional/indian/style_09.png` | `/media/catalog/wardrobe_browse/men_indian_09.webp` |
| `men_indian_10` | men | indian | 10 | `assets/images/home/men/wardrobe/regional/indian/style_10.png` | `/media/catalog/wardrobe_browse/men_indian_10.webp` |
| `men_indian_11` | men | indian | 11 | `assets/images/home/men/wardrobe/regional/indian/style_11.png` | `/media/catalog/wardrobe_browse/men_indian_11.webp` |
| `men_indian_12` | men | indian | 12 | `assets/images/home/men/wardrobe/regional/indian/style_12.png` | `/media/catalog/wardrobe_browse/men_indian_12.webp` |
| `men_indian_13` | men | indian | 13 | `assets/images/home/men/wardrobe/regional/indian/style_13.png` | `/media/catalog/wardrobe_browse/men_indian_13.webp` |
| `men_indian_14` | men | indian | 14 | `assets/images/home/men/wardrobe/regional/indian/style_14.png` | `/media/catalog/wardrobe_browse/men_indian_14.webp` |
| `men_indian_15` | men | indian | 15 | `assets/images/home/men/wardrobe/regional/indian/style_15.png` | `/media/catalog/wardrobe_browse/men_indian_15.webp` |
| `men_jackets_01` | men | jackets | 1 | `assets/images/home/men/wardrobe/garments/jackets/style_01.png` | `/media/catalog/wardrobe_browse/men_jackets_01.webp` |
| `men_jackets_02` | men | jackets | 2 | `assets/images/home/men/wardrobe/garments/jackets/style_02.png` | `/media/catalog/wardrobe_browse/men_jackets_02.webp` |
| `men_jackets_03` | men | jackets | 3 | `assets/images/home/men/wardrobe/garments/jackets/style_03.png` | `/media/catalog/wardrobe_browse/men_jackets_03.webp` |
| `men_jackets_04` | men | jackets | 4 | `assets/images/home/men/wardrobe/garments/jackets/style_04.png` | `/media/catalog/wardrobe_browse/men_jackets_04.webp` |
| `men_jackets_05` | men | jackets | 5 | `assets/images/home/men/wardrobe/garments/jackets/style_05.png` | `/media/catalog/wardrobe_browse/men_jackets_05.webp` |
| `men_jackets_06` | men | jackets | 6 | `assets/images/home/men/wardrobe/garments/jackets/style_06.png` | `/media/catalog/wardrobe_browse/men_jackets_06.webp` |
| `men_jackets_07` | men | jackets | 7 | `assets/images/home/men/wardrobe/garments/jackets/style_07.png` | `/media/catalog/wardrobe_browse/men_jackets_07.webp` |
| `men_jackets_08` | men | jackets | 8 | `assets/images/home/men/wardrobe/garments/jackets/style_08.png` | `/media/catalog/wardrobe_browse/men_jackets_08.webp` |
| `men_jackets_09` | men | jackets | 9 | `assets/images/home/men/wardrobe/garments/jackets/style_09.png` | `/media/catalog/wardrobe_browse/men_jackets_09.webp` |
| `men_jackets_10` | men | jackets | 10 | `assets/images/home/men/wardrobe/garments/jackets/style_10.png` | `/media/catalog/wardrobe_browse/men_jackets_10.webp` |
| `men_jackets_11` | men | jackets | 11 | `assets/images/home/men/wardrobe/garments/jackets/style_11.png` | `/media/catalog/wardrobe_browse/men_jackets_11.webp` |
| `men_jackets_12` | men | jackets | 12 | `assets/images/home/men/wardrobe/garments/jackets/style_12.png` | `/media/catalog/wardrobe_browse/men_jackets_12.webp` |
| `men_jackets_13` | men | jackets | 13 | `assets/images/home/men/wardrobe/garments/jackets/style_13.png` | `/media/catalog/wardrobe_browse/men_jackets_13.webp` |
| `men_jackets_14` | men | jackets | 14 | `assets/images/home/men/wardrobe/garments/jackets/style_14.png` | `/media/catalog/wardrobe_browse/men_jackets_14.webp` |
| `men_jackets_15` | men | jackets | 15 | `assets/images/home/men/wardrobe/garments/jackets/style_15.png` | `/media/catalog/wardrobe_browse/men_jackets_15.webp` |
| `men_jackets_16` | men | jackets | 16 | `assets/images/home/men/wardrobe/garments/jackets/style_16.png` | `/media/catalog/wardrobe_browse/men_jackets_16.webp` |
| `men_jackets_17` | men | jackets | 17 | `assets/images/home/men/wardrobe/garments/jackets/style_17.png` | `/media/catalog/wardrobe_browse/men_jackets_17.webp` |
| `men_jackets_18` | men | jackets | 18 | `assets/images/home/men/wardrobe/garments/jackets/style_18.png` | `/media/catalog/wardrobe_browse/men_jackets_18.webp` |
| `men_jackets_19` | men | jackets | 19 | `assets/images/home/men/wardrobe/garments/jackets/style_19.png` | `/media/catalog/wardrobe_browse/men_jackets_19.webp` |
| `men_jackets_20` | men | jackets | 20 | `assets/images/home/men/wardrobe/garments/jackets/style_20.png` | `/media/catalog/wardrobe_browse/men_jackets_20.webp` |
| `men_jackets_21` | men | jackets | 21 | `assets/images/home/men/wardrobe/garments/jackets/style_21.png` | `/media/catalog/wardrobe_browse/men_jackets_21.webp` |
| `men_korean_01` | men | korean | 1 | `assets/images/home/men/wardrobe/regional/korean/style_01.png` | `/media/catalog/wardrobe_browse/men_korean_01.webp` |
| `men_korean_02` | men | korean | 2 | `assets/images/home/men/wardrobe/regional/korean/style_02.png` | `/media/catalog/wardrobe_browse/men_korean_02.webp` |
| `men_korean_03` | men | korean | 3 | `assets/images/home/men/wardrobe/regional/korean/style_03.png` | `/media/catalog/wardrobe_browse/men_korean_03.webp` |
| `men_korean_04` | men | korean | 4 | `assets/images/home/men/wardrobe/regional/korean/style_04.png` | `/media/catalog/wardrobe_browse/men_korean_04.webp` |
| `men_korean_05` | men | korean | 5 | `assets/images/home/men/wardrobe/regional/korean/style_05.png` | `/media/catalog/wardrobe_browse/men_korean_05.webp` |
| `men_korean_06` | men | korean | 6 | `assets/images/home/men/wardrobe/regional/korean/style_06.png` | `/media/catalog/wardrobe_browse/men_korean_06.webp` |
| `men_korean_07` | men | korean | 7 | `assets/images/home/men/wardrobe/regional/korean/style_07.png` | `/media/catalog/wardrobe_browse/men_korean_07.webp` |
| `men_korean_08` | men | korean | 8 | `assets/images/home/men/wardrobe/regional/korean/style_08.png` | `/media/catalog/wardrobe_browse/men_korean_08.webp` |
| `men_korean_09` | men | korean | 9 | `assets/images/home/men/wardrobe/regional/korean/style_09.png` | `/media/catalog/wardrobe_browse/men_korean_09.webp` |
| `men_korean_10` | men | korean | 10 | `assets/images/home/men/wardrobe/regional/korean/style_10.png` | `/media/catalog/wardrobe_browse/men_korean_10.webp` |
| `men_korean_11` | men | korean | 11 | `assets/images/home/men/wardrobe/regional/korean/style_11.png` | `/media/catalog/wardrobe_browse/men_korean_11.webp` |
| `men_korean_12` | men | korean | 12 | `assets/images/home/men/wardrobe/regional/korean/style_12.png` | `/media/catalog/wardrobe_browse/men_korean_12.webp` |
| `men_korean_13` | men | korean | 13 | `assets/images/home/men/wardrobe/regional/korean/style_13.png` | `/media/catalog/wardrobe_browse/men_korean_13.webp` |
| `men_pakistani_01` | men | pakistani | 1 | `assets/images/home/men/wardrobe/regional/pakistani/style_01.png` | `/media/catalog/wardrobe_browse/men_pakistani_01.webp` |
| `men_pakistani_02` | men | pakistani | 2 | `assets/images/home/men/wardrobe/regional/pakistani/style_02.png` | `/media/catalog/wardrobe_browse/men_pakistani_02.webp` |
| `men_pakistani_03` | men | pakistani | 3 | `assets/images/home/men/wardrobe/regional/pakistani/style_03.png` | `/media/catalog/wardrobe_browse/men_pakistani_03.webp` |
| `men_pakistani_04` | men | pakistani | 4 | `assets/images/home/men/wardrobe/regional/pakistani/style_04.png` | `/media/catalog/wardrobe_browse/men_pakistani_04.webp` |
| `men_pakistani_05` | men | pakistani | 5 | `assets/images/home/men/wardrobe/regional/pakistani/style_05.png` | `/media/catalog/wardrobe_browse/men_pakistani_05.webp` |
| `men_pakistani_06` | men | pakistani | 6 | `assets/images/home/men/wardrobe/regional/pakistani/style_06.png` | `/media/catalog/wardrobe_browse/men_pakistani_06.webp` |
| `men_pakistani_07` | men | pakistani | 7 | `assets/images/home/men/wardrobe/regional/pakistani/style_07.png` | `/media/catalog/wardrobe_browse/men_pakistani_07.webp` |
| `men_pakistani_08` | men | pakistani | 8 | `assets/images/home/men/wardrobe/regional/pakistani/style_08.png` | `/media/catalog/wardrobe_browse/men_pakistani_08.webp` |
| `men_pakistani_09` | men | pakistani | 9 | `assets/images/home/men/wardrobe/regional/pakistani/style_09.png` | `/media/catalog/wardrobe_browse/men_pakistani_09.webp` |
| `men_pakistani_10` | men | pakistani | 10 | `assets/images/home/men/wardrobe/regional/pakistani/style_10.png` | `/media/catalog/wardrobe_browse/men_pakistani_10.webp` |
| `men_pakistani_11` | men | pakistani | 11 | `assets/images/home/men/wardrobe/regional/pakistani/style_11.png` | `/media/catalog/wardrobe_browse/men_pakistani_11.webp` |
| `men_pakistani_12` | men | pakistani | 12 | `assets/images/home/men/wardrobe/regional/pakistani/style_12.png` | `/media/catalog/wardrobe_browse/men_pakistani_12.webp` |
| `men_pakistani_13` | men | pakistani | 13 | `assets/images/home/men/wardrobe/regional/pakistani/style_13.png` | `/media/catalog/wardrobe_browse/men_pakistani_13.webp` |
| `men_pakistani_14` | men | pakistani | 14 | `assets/images/home/men/wardrobe/regional/pakistani/style_14.png` | `/media/catalog/wardrobe_browse/men_pakistani_14.webp` |
| `men_pakistani_15` | men | pakistani | 15 | `assets/images/home/men/wardrobe/regional/pakistani/style_15.png` | `/media/catalog/wardrobe_browse/men_pakistani_15.webp` |
| `men_pakistani_16` | men | pakistani | 16 | `assets/images/home/men/wardrobe/regional/pakistani/style_16.png` | `/media/catalog/wardrobe_browse/men_pakistani_16.webp` |
| `men_pakistani_17` | men | pakistani | 17 | `assets/images/home/men/wardrobe/regional/pakistani/style_17.png` | `/media/catalog/wardrobe_browse/men_pakistani_17.webp` |
| `men_pakistani_18` | men | pakistani | 18 | `assets/images/home/men/wardrobe/regional/pakistani/style_18.png` | `/media/catalog/wardrobe_browse/men_pakistani_18.webp` |
| `men_shirts_01` | men | shirts | 1 | `assets/images/home/men/wardrobe/garments/shirts/style_01.png` | `/media/catalog/wardrobe_browse/men_shirts_01.webp` |
| `men_shirts_02` | men | shirts | 2 | `assets/images/home/men/wardrobe/garments/shirts/style_02.png` | `/media/catalog/wardrobe_browse/men_shirts_02.webp` |
| `men_shirts_03` | men | shirts | 3 | `assets/images/home/men/wardrobe/garments/shirts/style_03.png` | `/media/catalog/wardrobe_browse/men_shirts_03.webp` |
| `men_shirts_04` | men | shirts | 4 | `assets/images/home/men/wardrobe/garments/shirts/style_04.png` | `/media/catalog/wardrobe_browse/men_shirts_04.webp` |
| `men_shirts_05` | men | shirts | 5 | `assets/images/home/men/wardrobe/garments/shirts/style_05.png` | `/media/catalog/wardrobe_browse/men_shirts_05.webp` |
| `men_shirts_06` | men | shirts | 6 | `assets/images/home/men/wardrobe/garments/shirts/style_06.png` | `/media/catalog/wardrobe_browse/men_shirts_06.webp` |
| `men_shirts_07` | men | shirts | 7 | `assets/images/home/men/wardrobe/garments/shirts/style_07.png` | `/media/catalog/wardrobe_browse/men_shirts_07.webp` |
| `men_shirts_08` | men | shirts | 8 | `assets/images/home/men/wardrobe/garments/shirts/style_08.png` | `/media/catalog/wardrobe_browse/men_shirts_08.webp` |
| `men_shirts_09` | men | shirts | 9 | `assets/images/home/men/wardrobe/garments/shirts/style_09.png` | `/media/catalog/wardrobe_browse/men_shirts_09.webp` |
| `men_shirts_10` | men | shirts | 10 | `assets/images/home/men/wardrobe/garments/shirts/style_10.png` | `/media/catalog/wardrobe_browse/men_shirts_10.webp` |
| `women_arabian_01` | women | arabian | 1 | `assets/images/home/women/wardrobe/regional/arabian/style_01.png` | `/media/catalog/wardrobe_browse/women_arabian_01.webp` |
| `women_arabian_02` | women | arabian | 2 | `assets/images/home/women/wardrobe/regional/arabian/style_02.png` | `/media/catalog/wardrobe_browse/women_arabian_02.webp` |
| `women_arabian_03` | women | arabian | 3 | `assets/images/home/women/wardrobe/regional/arabian/style_03.png` | `/media/catalog/wardrobe_browse/women_arabian_03.webp` |
| `women_arabian_04` | women | arabian | 4 | `assets/images/home/women/wardrobe/regional/arabian/style_04.png` | `/media/catalog/wardrobe_browse/women_arabian_04.webp` |
| `women_arabian_05` | women | arabian | 5 | `assets/images/home/women/wardrobe/regional/arabian/style_05.png` | `/media/catalog/wardrobe_browse/women_arabian_05.webp` |
| `women_arabian_06` | women | arabian | 6 | `assets/images/home/women/wardrobe/regional/arabian/style_06.png` | `/media/catalog/wardrobe_browse/women_arabian_06.webp` |
| `women_arabian_07` | women | arabian | 7 | `assets/images/home/women/wardrobe/regional/arabian/style_07.png` | `/media/catalog/wardrobe_browse/women_arabian_07.webp` |
| `women_arabian_08` | women | arabian | 8 | `assets/images/home/women/wardrobe/regional/arabian/style_08.png` | `/media/catalog/wardrobe_browse/women_arabian_08.webp` |
| `women_arabian_09` | women | arabian | 9 | `assets/images/home/women/wardrobe/regional/arabian/style_09.png` | `/media/catalog/wardrobe_browse/women_arabian_09.webp` |
| `women_arabian_10` | women | arabian | 10 | `assets/images/home/women/wardrobe/regional/arabian/style_10.png` | `/media/catalog/wardrobe_browse/women_arabian_10.webp` |
| `women_arabian_11` | women | arabian | 11 | `assets/images/home/women/wardrobe/regional/arabian/style_11.png` | `/media/catalog/wardrobe_browse/women_arabian_11.webp` |
| `women_arabian_12` | women | arabian | 12 | `assets/images/home/women/wardrobe/regional/arabian/style_12.png` | `/media/catalog/wardrobe_browse/women_arabian_12.webp` |
| `women_arabian_13` | women | arabian | 13 | `assets/images/home/women/wardrobe/regional/arabian/style_13.png` | `/media/catalog/wardrobe_browse/women_arabian_13.webp` |
| `women_arabian_14` | women | arabian | 14 | `assets/images/home/women/wardrobe/regional/arabian/style_14.png` | `/media/catalog/wardrobe_browse/women_arabian_14.webp` |
| `women_arabian_15` | women | arabian | 15 | `assets/images/home/women/wardrobe/regional/arabian/style_15.png` | `/media/catalog/wardrobe_browse/women_arabian_15.webp` |
| `women_arabian_16` | women | arabian | 16 | `assets/images/home/women/wardrobe/regional/arabian/style_16.png` | `/media/catalog/wardrobe_browse/women_arabian_16.webp` |
| `women_arabian_17` | women | arabian | 17 | `assets/images/home/women/wardrobe/regional/arabian/style_17.png` | `/media/catalog/wardrobe_browse/women_arabian_17.webp` |
| `women_bottoms_01` | women | bottoms | 1 | `assets/images/home/women/wardrobe/garments/bottoms/style_01.png` | `/media/catalog/wardrobe_browse/women_bottoms_01.webp` |
| `women_bottoms_02` | women | bottoms | 2 | `assets/images/home/women/wardrobe/garments/bottoms/style_02.png` | `/media/catalog/wardrobe_browse/women_bottoms_02.webp` |
| `women_bottoms_03` | women | bottoms | 3 | `assets/images/home/women/wardrobe/garments/bottoms/style_03.png` | `/media/catalog/wardrobe_browse/women_bottoms_03.webp` |
| `women_bottoms_04` | women | bottoms | 4 | `assets/images/home/women/wardrobe/garments/bottoms/style_04.png` | `/media/catalog/wardrobe_browse/women_bottoms_04.webp` |
| `women_bottoms_05` | women | bottoms | 5 | `assets/images/home/women/wardrobe/garments/bottoms/style_05.png` | `/media/catalog/wardrobe_browse/women_bottoms_05.webp` |
| `women_bottoms_06` | women | bottoms | 6 | `assets/images/home/women/wardrobe/garments/bottoms/style_06.png` | `/media/catalog/wardrobe_browse/women_bottoms_06.webp` |
| `women_bottoms_07` | women | bottoms | 7 | `assets/images/home/women/wardrobe/garments/bottoms/style_07.png` | `/media/catalog/wardrobe_browse/women_bottoms_07.webp` |
| `women_bottoms_08` | women | bottoms | 8 | `assets/images/home/women/wardrobe/garments/bottoms/style_08.png` | `/media/catalog/wardrobe_browse/women_bottoms_08.webp` |
| `women_chinese_01` | women | chinese | 1 | `assets/images/home/women/wardrobe/regional/chinese/style_01.png` | `/media/catalog/wardrobe_browse/women_chinese_01.webp` |
| `women_chinese_02` | women | chinese | 2 | `assets/images/home/women/wardrobe/regional/chinese/style_02.png` | `/media/catalog/wardrobe_browse/women_chinese_02.webp` |
| `women_chinese_03` | women | chinese | 3 | `assets/images/home/women/wardrobe/regional/chinese/style_03.png` | `/media/catalog/wardrobe_browse/women_chinese_03.webp` |
| `women_chinese_04` | women | chinese | 4 | `assets/images/home/women/wardrobe/regional/chinese/style_04.png` | `/media/catalog/wardrobe_browse/women_chinese_04.webp` |
| `women_chinese_05` | women | chinese | 5 | `assets/images/home/women/wardrobe/regional/chinese/style_05.png` | `/media/catalog/wardrobe_browse/women_chinese_05.webp` |
| `women_chinese_06` | women | chinese | 6 | `assets/images/home/women/wardrobe/regional/chinese/style_06.png` | `/media/catalog/wardrobe_browse/women_chinese_06.webp` |
| `women_chinese_07` | women | chinese | 7 | `assets/images/home/women/wardrobe/regional/chinese/style_07.png` | `/media/catalog/wardrobe_browse/women_chinese_07.webp` |
| `women_chinese_08` | women | chinese | 8 | `assets/images/home/women/wardrobe/regional/chinese/style_08.png` | `/media/catalog/wardrobe_browse/women_chinese_08.webp` |
| `women_chinese_09` | women | chinese | 9 | `assets/images/home/women/wardrobe/regional/chinese/style_09.png` | `/media/catalog/wardrobe_browse/women_chinese_09.webp` |
| `women_chinese_10` | women | chinese | 10 | `assets/images/home/women/wardrobe/regional/chinese/style_10.png` | `/media/catalog/wardrobe_browse/women_chinese_10.webp` |
| `women_chinese_11` | women | chinese | 11 | `assets/images/home/women/wardrobe/regional/chinese/style_11.png` | `/media/catalog/wardrobe_browse/women_chinese_11.webp` |
| `women_chinese_12` | women | chinese | 12 | `assets/images/home/women/wardrobe/regional/chinese/style_12.png` | `/media/catalog/wardrobe_browse/women_chinese_12.webp` |
| `women_chinese_13` | women | chinese | 13 | `assets/images/home/women/wardrobe/regional/chinese/style_13.png` | `/media/catalog/wardrobe_browse/women_chinese_13.webp` |
| `women_chinese_14` | women | chinese | 14 | `assets/images/home/women/wardrobe/regional/chinese/style_14.png` | `/media/catalog/wardrobe_browse/women_chinese_14.webp` |
| `women_indian_01` | women | indian | 1 | `assets/images/home/women/wardrobe/regional/indian/style_01.png` | `/media/catalog/wardrobe_browse/women_indian_01.webp` |
| `women_indian_02` | women | indian | 2 | `assets/images/home/women/wardrobe/regional/indian/style_02.png` | `/media/catalog/wardrobe_browse/women_indian_02.webp` |
| `women_indian_03` | women | indian | 3 | `assets/images/home/women/wardrobe/regional/indian/style_03.png` | `/media/catalog/wardrobe_browse/women_indian_03.webp` |
| `women_indian_04` | women | indian | 4 | `assets/images/home/women/wardrobe/regional/indian/style_04.png` | `/media/catalog/wardrobe_browse/women_indian_04.webp` |
| `women_indian_05` | women | indian | 5 | `assets/images/home/women/wardrobe/regional/indian/style_05.png` | `/media/catalog/wardrobe_browse/women_indian_05.webp` |
| `women_indian_06` | women | indian | 6 | `assets/images/home/women/wardrobe/regional/indian/style_06.png` | `/media/catalog/wardrobe_browse/women_indian_06.webp` |
| `women_indian_07` | women | indian | 7 | `assets/images/home/women/wardrobe/regional/indian/style_07.png` | `/media/catalog/wardrobe_browse/women_indian_07.webp` |
| `women_indian_08` | women | indian | 8 | `assets/images/home/women/wardrobe/regional/indian/style_08.png` | `/media/catalog/wardrobe_browse/women_indian_08.webp` |
| `women_indian_09` | women | indian | 9 | `assets/images/home/women/wardrobe/regional/indian/style_09.png` | `/media/catalog/wardrobe_browse/women_indian_09.webp` |
| `women_indian_10` | women | indian | 10 | `assets/images/home/women/wardrobe/regional/indian/style_10.png` | `/media/catalog/wardrobe_browse/women_indian_10.webp` |
| `women_indian_11` | women | indian | 11 | `assets/images/home/women/wardrobe/regional/indian/style_11.png` | `/media/catalog/wardrobe_browse/women_indian_11.webp` |
| `women_indian_12` | women | indian | 12 | `assets/images/home/women/wardrobe/regional/indian/style_12.png` | `/media/catalog/wardrobe_browse/women_indian_12.webp` |
| `women_indian_13` | women | indian | 13 | `assets/images/home/women/wardrobe/regional/indian/style_13.png` | `/media/catalog/wardrobe_browse/women_indian_13.webp` |
| `women_indian_14` | women | indian | 14 | `assets/images/home/women/wardrobe/regional/indian/style_14.png` | `/media/catalog/wardrobe_browse/women_indian_14.webp` |
| `women_indian_15` | women | indian | 15 | `assets/images/home/women/wardrobe/regional/indian/style_15.png` | `/media/catalog/wardrobe_browse/women_indian_15.webp` |
| `women_jackets_01` | women | jackets | 1 | `assets/images/home/women/wardrobe/garments/jackets/style_01.png` | `/media/catalog/wardrobe_browse/women_jackets_01.webp` |
| `women_jackets_02` | women | jackets | 2 | `assets/images/home/women/wardrobe/garments/jackets/style_02.png` | `/media/catalog/wardrobe_browse/women_jackets_02.webp` |
| `women_jackets_03` | women | jackets | 3 | `assets/images/home/women/wardrobe/garments/jackets/style_03.png` | `/media/catalog/wardrobe_browse/women_jackets_03.webp` |
| `women_jackets_04` | women | jackets | 4 | `assets/images/home/women/wardrobe/garments/jackets/style_04.png` | `/media/catalog/wardrobe_browse/women_jackets_04.webp` |
| `women_jackets_05` | women | jackets | 5 | `assets/images/home/women/wardrobe/garments/jackets/style_05.png` | `/media/catalog/wardrobe_browse/women_jackets_05.webp` |
| `women_jackets_06` | women | jackets | 6 | `assets/images/home/women/wardrobe/garments/jackets/style_06.png` | `/media/catalog/wardrobe_browse/women_jackets_06.webp` |
| `women_jackets_07` | women | jackets | 7 | `assets/images/home/women/wardrobe/garments/jackets/style_07.png` | `/media/catalog/wardrobe_browse/women_jackets_07.webp` |
| `women_jackets_08` | women | jackets | 8 | `assets/images/home/women/wardrobe/garments/jackets/style_08.png` | `/media/catalog/wardrobe_browse/women_jackets_08.webp` |
| `women_jackets_09` | women | jackets | 9 | `assets/images/home/women/wardrobe/garments/jackets/style_09.png` | `/media/catalog/wardrobe_browse/women_jackets_09.webp` |
| `women_jackets_10` | women | jackets | 10 | `assets/images/home/women/wardrobe/garments/jackets/style_10.png` | `/media/catalog/wardrobe_browse/women_jackets_10.webp` |
| `women_jackets_11` | women | jackets | 11 | `assets/images/home/women/wardrobe/garments/jackets/style_11.png` | `/media/catalog/wardrobe_browse/women_jackets_11.webp` |
| `women_jackets_12` | women | jackets | 12 | `assets/images/home/women/wardrobe/garments/jackets/style_12.png` | `/media/catalog/wardrobe_browse/women_jackets_12.webp` |
| `women_jackets_13` | women | jackets | 13 | `assets/images/home/women/wardrobe/garments/jackets/style_13.png` | `/media/catalog/wardrobe_browse/women_jackets_13.webp` |
| `women_jackets_14` | women | jackets | 14 | `assets/images/home/women/wardrobe/garments/jackets/style_14.png` | `/media/catalog/wardrobe_browse/women_jackets_14.webp` |
| `women_jackets_15` | women | jackets | 15 | `assets/images/home/women/wardrobe/garments/jackets/style_15.png` | `/media/catalog/wardrobe_browse/women_jackets_15.webp` |
| `women_jackets_16` | women | jackets | 16 | `assets/images/home/women/wardrobe/garments/jackets/style_16.png` | `/media/catalog/wardrobe_browse/women_jackets_16.webp` |
| `women_jackets_17` | women | jackets | 17 | `assets/images/home/women/wardrobe/garments/jackets/style_17.png` | `/media/catalog/wardrobe_browse/women_jackets_17.webp` |
| `women_jackets_18` | women | jackets | 18 | `assets/images/home/women/wardrobe/garments/jackets/style_18.png` | `/media/catalog/wardrobe_browse/women_jackets_18.webp` |
| `women_jackets_19` | women | jackets | 19 | `assets/images/home/women/wardrobe/garments/jackets/style_19.png` | `/media/catalog/wardrobe_browse/women_jackets_19.webp` |
| `women_jackets_20` | women | jackets | 20 | `assets/images/home/women/wardrobe/garments/jackets/style_20.png` | `/media/catalog/wardrobe_browse/women_jackets_20.webp` |
| `women_jackets_21` | women | jackets | 21 | `assets/images/home/women/wardrobe/garments/jackets/style_21.png` | `/media/catalog/wardrobe_browse/women_jackets_21.webp` |
| `women_korean_01` | women | korean | 1 | `assets/images/home/women/wardrobe/regional/korean/style_01.png` | `/media/catalog/wardrobe_browse/women_korean_01.webp` |
| `women_korean_02` | women | korean | 2 | `assets/images/home/women/wardrobe/regional/korean/style_02.png` | `/media/catalog/wardrobe_browse/women_korean_02.webp` |
| `women_korean_03` | women | korean | 3 | `assets/images/home/women/wardrobe/regional/korean/style_03.png` | `/media/catalog/wardrobe_browse/women_korean_03.webp` |
| `women_korean_04` | women | korean | 4 | `assets/images/home/women/wardrobe/regional/korean/style_04.png` | `/media/catalog/wardrobe_browse/women_korean_04.webp` |
| `women_korean_05` | women | korean | 5 | `assets/images/home/women/wardrobe/regional/korean/style_05.png` | `/media/catalog/wardrobe_browse/women_korean_05.webp` |
| `women_korean_06` | women | korean | 6 | `assets/images/home/women/wardrobe/regional/korean/style_06.png` | `/media/catalog/wardrobe_browse/women_korean_06.webp` |
| `women_korean_07` | women | korean | 7 | `assets/images/home/women/wardrobe/regional/korean/style_07.png` | `/media/catalog/wardrobe_browse/women_korean_07.webp` |
| `women_korean_08` | women | korean | 8 | `assets/images/home/women/wardrobe/regional/korean/style_08.png` | `/media/catalog/wardrobe_browse/women_korean_08.webp` |
| `women_korean_09` | women | korean | 9 | `assets/images/home/women/wardrobe/regional/korean/style_09.png` | `/media/catalog/wardrobe_browse/women_korean_09.webp` |
| `women_korean_10` | women | korean | 10 | `assets/images/home/women/wardrobe/regional/korean/style_10.png` | `/media/catalog/wardrobe_browse/women_korean_10.webp` |
| `women_korean_11` | women | korean | 11 | `assets/images/home/women/wardrobe/regional/korean/style_11.png` | `/media/catalog/wardrobe_browse/women_korean_11.webp` |
| `women_korean_12` | women | korean | 12 | `assets/images/home/women/wardrobe/regional/korean/style_12.png` | `/media/catalog/wardrobe_browse/women_korean_12.webp` |
| `women_korean_13` | women | korean | 13 | `assets/images/home/women/wardrobe/regional/korean/style_13.png` | `/media/catalog/wardrobe_browse/women_korean_13.webp` |
| `women_pakistani_01` | women | pakistani | 1 | `assets/images/home/women/wardrobe/regional/pakistani/style_01.png` | `/media/catalog/wardrobe_browse/women_pakistani_01.webp` |
| `women_pakistani_02` | women | pakistani | 2 | `assets/images/home/women/wardrobe/regional/pakistani/style_02.png` | `/media/catalog/wardrobe_browse/women_pakistani_02.webp` |
| `women_pakistani_03` | women | pakistani | 3 | `assets/images/home/women/wardrobe/regional/pakistani/style_03.png` | `/media/catalog/wardrobe_browse/women_pakistani_03.webp` |
| `women_pakistani_04` | women | pakistani | 4 | `assets/images/home/women/wardrobe/regional/pakistani/style_04.png` | `/media/catalog/wardrobe_browse/women_pakistani_04.webp` |
| `women_pakistani_05` | women | pakistani | 5 | `assets/images/home/women/wardrobe/regional/pakistani/style_05.png` | `/media/catalog/wardrobe_browse/women_pakistani_05.webp` |
| `women_pakistani_06` | women | pakistani | 6 | `assets/images/home/women/wardrobe/regional/pakistani/style_06.png` | `/media/catalog/wardrobe_browse/women_pakistani_06.webp` |
| `women_pakistani_07` | women | pakistani | 7 | `assets/images/home/women/wardrobe/regional/pakistani/style_07.png` | `/media/catalog/wardrobe_browse/women_pakistani_07.webp` |
| `women_pakistani_08` | women | pakistani | 8 | `assets/images/home/women/wardrobe/regional/pakistani/style_08.png` | `/media/catalog/wardrobe_browse/women_pakistani_08.webp` |
| `women_pakistani_09` | women | pakistani | 9 | `assets/images/home/women/wardrobe/regional/pakistani/style_09.png` | `/media/catalog/wardrobe_browse/women_pakistani_09.webp` |
| `women_pakistani_10` | women | pakistani | 10 | `assets/images/home/women/wardrobe/regional/pakistani/style_10.png` | `/media/catalog/wardrobe_browse/women_pakistani_10.webp` |
| `women_pakistani_11` | women | pakistani | 11 | `assets/images/home/women/wardrobe/regional/pakistani/style_11.png` | `/media/catalog/wardrobe_browse/women_pakistani_11.webp` |
| `women_pakistani_12` | women | pakistani | 12 | `assets/images/home/women/wardrobe/regional/pakistani/style_12.png` | `/media/catalog/wardrobe_browse/women_pakistani_12.webp` |
| `women_pakistani_13` | women | pakistani | 13 | `assets/images/home/women/wardrobe/regional/pakistani/style_13.png` | `/media/catalog/wardrobe_browse/women_pakistani_13.webp` |
| `women_pakistani_14` | women | pakistani | 14 | `assets/images/home/women/wardrobe/regional/pakistani/style_14.png` | `/media/catalog/wardrobe_browse/women_pakistani_14.webp` |
| `women_pakistani_15` | women | pakistani | 15 | `assets/images/home/women/wardrobe/regional/pakistani/style_15.png` | `/media/catalog/wardrobe_browse/women_pakistani_15.webp` |
| `women_pakistani_16` | women | pakistani | 16 | `assets/images/home/women/wardrobe/regional/pakistani/style_16.png` | `/media/catalog/wardrobe_browse/women_pakistani_16.webp` |
| `women_pakistani_17` | women | pakistani | 17 | `assets/images/home/women/wardrobe/regional/pakistani/style_17.png` | `/media/catalog/wardrobe_browse/women_pakistani_17.webp` |
| `women_pakistani_18` | women | pakistani | 18 | `assets/images/home/women/wardrobe/regional/pakistani/style_18.png` | `/media/catalog/wardrobe_browse/women_pakistani_18.webp` |
| `women_shirts_01` | women | shirts | 1 | `assets/images/home/women/wardrobe/garments/shirts/style_01.png` | `/media/catalog/wardrobe_browse/women_shirts_01.webp` |
| `women_shirts_02` | women | shirts | 2 | `assets/images/home/women/wardrobe/garments/shirts/style_02.png` | `/media/catalog/wardrobe_browse/women_shirts_02.webp` |
| `women_shirts_03` | women | shirts | 3 | `assets/images/home/women/wardrobe/garments/shirts/style_03.png` | `/media/catalog/wardrobe_browse/women_shirts_03.webp` |
| `women_shirts_04` | women | shirts | 4 | `assets/images/home/women/wardrobe/garments/shirts/style_04.png` | `/media/catalog/wardrobe_browse/women_shirts_04.webp` |
| `women_shirts_05` | women | shirts | 5 | `assets/images/home/women/wardrobe/garments/shirts/style_05.png` | `/media/catalog/wardrobe_browse/women_shirts_05.webp` |
| `women_shirts_06` | women | shirts | 6 | `assets/images/home/women/wardrobe/garments/shirts/style_06.png` | `/media/catalog/wardrobe_browse/women_shirts_06.webp` |
| `women_shirts_07` | women | shirts | 7 | `assets/images/home/women/wardrobe/garments/shirts/style_07.png` | `/media/catalog/wardrobe_browse/women_shirts_07.webp` |
| `women_shirts_08` | women | shirts | 8 | `assets/images/home/women/wardrobe/garments/shirts/style_08.png` | `/media/catalog/wardrobe_browse/women_shirts_08.webp` |
| `women_shirts_09` | women | shirts | 9 | `assets/images/home/women/wardrobe/garments/shirts/style_09.png` | `/media/catalog/wardrobe_browse/women_shirts_09.webp` |
| `women_shirts_10` | women | shirts | 10 | `assets/images/home/women/wardrobe/garments/shirts/style_10.png` | `/media/catalog/wardrobe_browse/women_shirts_10.webp` |
| `women_skirts_01` | women | skirts | 1 | `assets/images/home/women/wardrobe/garments/skirts/style_01.png` | `/media/catalog/wardrobe_browse/women_skirts_01.webp` |
| `women_skirts_02` | women | skirts | 2 | `assets/images/home/women/wardrobe/garments/skirts/style_02.png` | `/media/catalog/wardrobe_browse/women_skirts_02.webp` |
| `women_skirts_03` | women | skirts | 3 | `assets/images/home/women/wardrobe/garments/skirts/style_03.png` | `/media/catalog/wardrobe_browse/women_skirts_03.webp` |
| `women_skirts_04` | women | skirts | 4 | `assets/images/home/women/wardrobe/garments/skirts/style_04.png` | `/media/catalog/wardrobe_browse/women_skirts_04.webp` |
| `women_skirts_05` | women | skirts | 5 | `assets/images/home/women/wardrobe/garments/skirts/style_05.png` | `/media/catalog/wardrobe_browse/women_skirts_05.webp` |
| `women_skirts_06` | women | skirts | 6 | `assets/images/home/women/wardrobe/garments/skirts/style_06.png` | `/media/catalog/wardrobe_browse/women_skirts_06.webp` |
| `women_skirts_07` | women | skirts | 7 | `assets/images/home/women/wardrobe/garments/skirts/style_07.png` | `/media/catalog/wardrobe_browse/women_skirts_07.webp` |
| `women_skirts_08` | women | skirts | 8 | `assets/images/home/women/wardrobe/garments/skirts/style_08.png` | `/media/catalog/wardrobe_browse/women_skirts_08.webp` |
| `women_skirts_09` | women | skirts | 9 | `assets/images/home/women/wardrobe/garments/skirts/style_09.png` | `/media/catalog/wardrobe_browse/women_skirts_09.webp` |
| `women_skirts_10` | women | skirts | 10 | `assets/images/home/women/wardrobe/garments/skirts/style_10.png` | `/media/catalog/wardrobe_browse/women_skirts_10.webp` |
| `women_skirts_11` | women | skirts | 11 | `assets/images/home/women/wardrobe/garments/skirts/style_11.png` | `/media/catalog/wardrobe_browse/women_skirts_11.webp` |
| `women_skirts_12` | women | skirts | 12 | `assets/images/home/women/wardrobe/garments/skirts/style_12.png` | `/media/catalog/wardrobe_browse/women_skirts_12.webp` |
| `women_skirts_13` | women | skirts | 13 | `assets/images/home/women/wardrobe/garments/skirts/style_13.png` | `/media/catalog/wardrobe_browse/women_skirts_13.webp` |
| `women_skirts_14` | women | skirts | 14 | `assets/images/home/women/wardrobe/garments/skirts/style_14.png` | `/media/catalog/wardrobe_browse/women_skirts_14.webp` |
| `women_skirts_15` | women | skirts | 15 | `assets/images/home/women/wardrobe/garments/skirts/style_15.png` | `/media/catalog/wardrobe_browse/women_skirts_15.webp` |
| `women_skirts_16` | women | skirts | 16 | `assets/images/home/women/wardrobe/garments/skirts/style_16.png` | `/media/catalog/wardrobe_browse/women_skirts_16.webp` |
| `women_tops_01` | women | tops | 1 | `assets/images/home/women/wardrobe/garments/tops/style_01.png` | `/media/catalog/wardrobe_browse/women_tops_01.webp` |
| `women_tops_02` | women | tops | 2 | `assets/images/home/women/wardrobe/garments/tops/style_02.png` | `/media/catalog/wardrobe_browse/women_tops_02.webp` |
| `women_tops_03` | women | tops | 3 | `assets/images/home/women/wardrobe/garments/tops/style_03.png` | `/media/catalog/wardrobe_browse/women_tops_03.webp` |
| `women_tops_04` | women | tops | 4 | `assets/images/home/women/wardrobe/garments/tops/style_04.png` | `/media/catalog/wardrobe_browse/women_tops_04.webp` |
| `women_tops_05` | women | tops | 5 | `assets/images/home/women/wardrobe/garments/tops/style_05.png` | `/media/catalog/wardrobe_browse/women_tops_05.webp` |
| `women_tops_06` | women | tops | 6 | `assets/images/home/women/wardrobe/garments/tops/style_06.png` | `/media/catalog/wardrobe_browse/women_tops_06.webp` |
| `women_tops_07` | women | tops | 7 | `assets/images/home/women/wardrobe/garments/tops/style_07.png` | `/media/catalog/wardrobe_browse/women_tops_07.webp` |
| `women_tops_08` | women | tops | 8 | `assets/images/home/women/wardrobe/garments/tops/style_08.png` | `/media/catalog/wardrobe_browse/women_tops_08.webp` |
| `women_tops_09` | women | tops | 9 | `assets/images/home/women/wardrobe/garments/tops/style_09.png` | `/media/catalog/wardrobe_browse/women_tops_09.webp` |
| `women_tops_10` | women | tops | 10 | `assets/images/home/women/wardrobe/garments/tops/style_10.png` | `/media/catalog/wardrobe_browse/women_tops_10.webp` |
| `women_tops_11` | women | tops | 11 | `assets/images/home/women/wardrobe/garments/tops/style_11.png` | `/media/catalog/wardrobe_browse/women_tops_11.webp` |

---

## 7. Home UI-only assets (not style_id rows)

- `assets/images/home/ui/beauty_beard_styles.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/beauty_hair_color.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/beauty_hair_styles.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/beauty_hijab_styles.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/beauty_virtual_tryon.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/couple_style_1.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/couple_style_2.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/couple_style_3.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/home_studio_card_dark.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/home_studio_card_light.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/home_studio_model_dark.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/home_studio_model_light.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/occasion_casual.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/occasion_formal.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/occasion_wedding.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/outfit_change_1.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/outfit_change_2.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/outfit_change_3.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/preset_gym.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/preset_interview_dark.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/preset_interview_light.png` — Home section card / beauty lab icon (not a style_id)
- `assets/images/home/ui/preset_wedding_guest.png` — Home section card / beauty lab icon (not a style_id)

## 8. Wardrobe rail preview tiles

- `assets/images/wardrobe/ui/arabian_rail_01.png` — region `arabian`, category `arabian_traditional`
- `assets/images/wardrobe/ui/arabian_rail_02.png` — region `arabian`, category `arabian_traditional`
- `assets/images/wardrobe/ui/arabian_rail_03.png` — region `arabian`, category `arabian_traditional`
- `assets/images/wardrobe/ui/chinese_rail_01.png` — region `chinese`, category `chinese_traditional`
- `assets/images/wardrobe/ui/chinese_rail_02.png` — region `chinese`, category `chinese_traditional`
- `assets/images/wardrobe/ui/chinese_rail_03.png` — region `chinese`, category `chinese_traditional`
- `assets/images/wardrobe/ui/indian_rail_01.png` — region `indian`, category `indian_traditional`
- `assets/images/wardrobe/ui/indian_rail_02.png` — region `indian`, category `indian_traditional`
- `assets/images/wardrobe/ui/indian_rail_03.png` — region `indian`, category `indian_traditional`
- `assets/images/wardrobe/ui/korean_rail_01.png` — region `korean`, category `korean_traditional`
- `assets/images/wardrobe/ui/korean_rail_02.png` — region `korean`, category `korean_traditional`
- `assets/images/wardrobe/ui/korean_rail_03.png` — region `korean`, category `korean_traditional`
- `assets/images/wardrobe/ui/pakistani_rail_01.png` — region `pakistani`, category `pakistani_traditional`
- `assets/images/wardrobe/ui/pakistani_rail_02.png` — region `pakistani`, category `pakistani_traditional`
- `assets/images/wardrobe/ui/pakistani_rail_03.png` — region `pakistani`, category `pakistani_traditional`

---

## 9. API checklist for backend

1. Upload each local `style_XX.png` → WebP at suggested `/media/catalog/...` path.
2. For each item return JSON with **`style_id`** (or `id`) matching table above.
3. `GET /catalog/{category_id}?gender=men&tab=casual` — filter items by gender/tab.
4. `GET /home/feed?gender=women` — sections `outfit_change`, `occasions`, etc. with `thumbnail_url`.
5. `GET /wardrobe/categories?gender=men` — five traditional categories with hero/thumbnail URLs.

CSV export: `docs/BACKEND_ASSET_CATALOG.csv` (same data, import to Sheets).
