# Phase 2 full-outfit audit (audit only)

**Generated:** 2026-10-06T11:59:54.124Z  
**Status:** No production code changed. Phase 1 (105) and beauty (56) untouched.

---

## Executive summary

| Metric | Value |
|--------|------:|
| **Phase 2 full-outfit styles (legacy VTO)** | **258** |
| Expected from prior regression | 258 |
| Phase 1 excluded (frozen) | 105 |
| Beauty / FLUX excluded | 56 |
| Catalog total | 419 |

**Current production prompt (Phase 2 styles today):** generic `buildVtoPrompt()` → `TRY-ON: The person of image 1 wearing the garments of image 2…`  
**Engine:** BFL Virtual Try-On v2 (`shouldUseVtoEngine` true, `shouldUseWardrobePhase1VtoPrompt` false)

---

## Proposed Phase 2 master prompt (not implemented)

Same structure for all **258** styles when approved:

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for {style_id}.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

{short_style_specific_instruction}
```

Style-specific lines are **shortened** from stored COMMAND (no duplicate “maintaining face/identity/pose”).

---

## Categories included (Phase 2)

| category_id | count |
|-------------|------:|
| wardrobe_browse | 154 |
| occasions | 50 |
| virtual_try_on | 20 |
| outfit_change | 13 |
| couple_duo | 11 |
| presets | 10 |

---

## Tabs included (Phase 2)

| tab_id | count |
|--------|------:|
| (none) | 44 |
| pakistani | 36 |
| arabian | 34 |
| indian | 30 |
| chinese | 28 |
| korean | 26 |
| casual | 20 |
| formal | 20 |
| wedding | 10 |
| preset_gym | 10 |

---

## Flags

### Styles NOT clearly full-outfit intent

_None in Phase 2 set._

### Missing reference PNG under `public/` (local workspace)

Count: **0** (CDN may still serve after `assets:sync` on server)


### Suspicious COMMANDs (short or missing region=outfit meta)

Count: **0**


---

## Representative proposed prompts (10 styles)

### `women_indian_01`

- **Category:** `wardrobe_browse`
- **Tab:** `indian`
- **Reference:** `/media/catalog/wardrobe_browse/women_indian_01.png`
- **Full-outfit intent:** Regional traditional ensemble (indian)
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for women_indian_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown), including textile, color, drape, embroidery and accessories.
```

### `men_arabian_01`

- **Category:** `wardrobe_browse`
- **Tab:** `arabian`
- **Reference:** `/media/catalog/wardrobe_browse/men_arabian_01.png`
- **Full-outfit intent:** Regional traditional ensemble (arabian)
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for men_arabian_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown), including cut, textile, color and trims.
```

### `men_korean_01`

- **Category:** `wardrobe_browse`
- **Tab:** `korean`
- **Reference:** `/media/catalog/wardrobe_browse/men_korean_01.png`
- **Full-outfit intent:** Regional traditional ensemble (korean)
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for men_korean_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the Korean-inspired outfit as shown, including silhouette, textile, color and styling details.
```

### `women_pakistani_01`

- **Category:** `wardrobe_browse`
- **Tab:** `pakistani`
- **Reference:** `/media/catalog/wardrobe_browse/women_pakistani_01.png`
- **Full-outfit intent:** Regional traditional ensemble (pakistani)
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for women_pakistani_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown), including textile, color, drape and embellishment.
```

### `men_chinese_01`

- **Category:** `wardrobe_browse`
- **Tab:** `chinese`
- **Reference:** `/media/catalog/wardrobe_browse/men_chinese_01.png`
- **Full-outfit intent:** Regional traditional ensemble (chinese)
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for men_chinese_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the Chinese-inspired outfit (qipao, cheongsam, or formal wear as shown), including silhouette, textile, color and details.
```

### `women_formal_01`

- **Category:** `occasions`
- **Tab:** `formal`
- **Reference:** `/media/catalog/occasions/women_formal_01.png`
- **Full-outfit intent:** Occasion ensemble (formal)
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for women_formal_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the formal occasion outfit from image 2, including garment type, fit, fabric, embellishment, and accessories.
```

### `men_preset_gym_01`

- **Category:** `presets`
- **Tab:** `preset_gym`
- **Reference:** `/media/catalog/presets/men_preset_gym_01.png`
- **Full-outfit intent:** Preset look (preset_gym)
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for men_preset_gym_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the gym preset outfit from image 2, including all visible layers and accessories.
```

### `couple_01`

- **Category:** `couple_duo`
- **Tab:** `—`
- **Reference:** `/media/catalog/couple_duo/couple_01.png`
- **Full-outfit intent:** Coordinated duo look reference
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for couple_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the coordinated couple/duo outfit from image 2, including colors, top/bottom pairing, and styling details.
```

### `women_outfit_change_01`

- **Category:** `outfit_change`
- **Tab:** `—`
- **Reference:** `/media/catalog/outfit_change/women_outfit_change_01.png`
- **Full-outfit intent:** Full outfit replacement reference
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for women_outfit_change_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the full replacement outfit from image 2, including silhouette, layering, fabric, color, and visible accessories.
```

### `men_tryon_01`

- **Category:** `virtual_try_on`
- **Tab:** `—`
- **Reference:** `/media/catalog/virtual_try_on/men_tryon_01.png`
- **Full-outfit intent:** Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere)
- **Engine:** BFL VTO v2

**Current production prompt:**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_01). Photorealistic, no text or watermarks.
```

**Proposed Phase 2 prompt:**

```text
Edit image 1 directly. Keep the same person, face, identity, body proportions, pose, camera, lighting and background.

Replace ONLY the visible clothing/outfit with the outfit shown in image 2.

Use image 2 only as the outfit reference for men_tryon_01.
Match the visible outfit design, color, cut, fabric, drape, pattern, length and details.

Keep the original person and scene unchanged.
Do not recreate the person or full image.
Photorealistic.

Match the full try-on outfit ensemble from image 2, including all visible garment layers and footwear if shown.
```

---

## Files that would change if Phase 2 is approved (proposal only)

| File | Change |
|------|--------|
| `src/lib/server/bfl/fullOutfitPhase2VtoPrompt.ts` | **NEW** — gate + master prompt + short style-specific templates |
| `src/lib/server/bfl/tryOnEngine.ts` | Branch: Phase 1 → Phase 2 → legacy `TRY-ON` fallback (only if any edge case remains) |
| `src/app/api/v1/try-on/generate/route.ts` | No change expected if `buildVtoPrompt` remains single entry |
| `scripts/wardrobe-phase1-prompt.test.ts` | Unchanged (Phase 1 frozen) |
| `scripts/full-outfit-phase2-prompt.test.ts` | **NEW** — 258-style resolution tests |
| `PHASE2_FULL_OUTFIT_AUDIT.md` | This document |
| `src/lib/server/bfl/wardrobePhase1VtoPrompt.ts` | **DO NOT MODIFY** |

---

## Full style inventory (258 styles)

| style_id | category | tab | engine | reference | full_outfit? | local PNG |
|----------|----------|-----|--------|-----------|------------|-----------|
| couple_01 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_01.png | Yes | Yes |
| couple_02 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_02.png | Yes | Yes |
| couple_03 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_03.png | Yes | Yes |
| couple_04 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_04.png | Yes | Yes |
| couple_05 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_05.png | Yes | Yes |
| couple_06 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_06.png | Yes | Yes |
| couple_07 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_07.png | Yes | Yes |
| couple_08 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_08.png | Yes | Yes |
| couple_09 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_09.png | Yes | Yes |
| couple_10 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_10.png | Yes | Yes |
| couple_11 | couple_duo | — | VTO v2 | /media/catalog/couple_duo/couple_11.png | Yes | Yes |
| men_casual_01 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_01.png | Yes | Yes |
| men_casual_02 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_02.png | Yes | Yes |
| men_casual_03 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_03.png | Yes | Yes |
| men_casual_04 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_04.png | Yes | Yes |
| men_casual_05 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_05.png | Yes | Yes |
| men_casual_06 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_06.png | Yes | Yes |
| men_casual_07 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_07.png | Yes | Yes |
| men_casual_08 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_08.png | Yes | Yes |
| men_casual_09 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_09.png | Yes | Yes |
| men_casual_10 | occasions | casual | VTO v2 | /media/catalog/occasions/men_casual_10.png | Yes | Yes |
| men_formal_01 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_01.png | Yes | Yes |
| men_formal_02 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_02.png | Yes | Yes |
| men_formal_03 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_03.png | Yes | Yes |
| men_formal_04 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_04.png | Yes | Yes |
| men_formal_05 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_05.png | Yes | Yes |
| men_formal_06 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_06.png | Yes | Yes |
| men_formal_07 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_07.png | Yes | Yes |
| men_formal_08 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_08.png | Yes | Yes |
| men_formal_09 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_09.png | Yes | Yes |
| men_formal_10 | occasions | formal | VTO v2 | /media/catalog/occasions/men_formal_10.png | Yes | Yes |
| women_casual_01 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_01.png | Yes | Yes |
| women_casual_02 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_02.png | Yes | Yes |
| women_casual_03 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_03.png | Yes | Yes |
| women_casual_04 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_04.png | Yes | Yes |
| women_casual_05 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_05.png | Yes | Yes |
| women_casual_06 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_06.png | Yes | Yes |
| women_casual_07 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_07.png | Yes | Yes |
| women_casual_08 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_08.png | Yes | Yes |
| women_casual_09 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_09.png | Yes | Yes |
| women_casual_10 | occasions | casual | VTO v2 | /media/catalog/occasions/women_casual_10.png | Yes | Yes |
| women_formal_01 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_01.png | Yes | Yes |
| women_formal_02 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_02.png | Yes | Yes |
| women_formal_03 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_03.png | Yes | Yes |
| women_formal_04 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_04.png | Yes | Yes |
| women_formal_05 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_05.png | Yes | Yes |
| women_formal_06 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_06.png | Yes | Yes |
| women_formal_07 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_07.png | Yes | Yes |
| women_formal_08 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_08.png | Yes | Yes |
| women_formal_09 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_09.png | Yes | Yes |
| women_formal_10 | occasions | formal | VTO v2 | /media/catalog/occasions/women_formal_10.png | Yes | Yes |
| women_wedding_01 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_01.png | Yes | Yes |
| women_wedding_02 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_02.png | Yes | Yes |
| women_wedding_03 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_03.png | Yes | Yes |
| women_wedding_04 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_04.png | Yes | Yes |
| women_wedding_05 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_05.png | Yes | Yes |
| women_wedding_06 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_06.png | Yes | Yes |
| women_wedding_07 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_07.png | Yes | Yes |
| women_wedding_08 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_08.png | Yes | Yes |
| women_wedding_09 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_09.png | Yes | Yes |
| women_wedding_10 | occasions | wedding | VTO v2 | /media/catalog/occasions/women_wedding_10.png | Yes | Yes |
| men_outfit_change_01 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/men_outfit_change_01.png | Yes | Yes |
| men_outfit_change_02 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/men_outfit_change_02.png | Yes | Yes |
| women_outfit_change_01 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_01.png | Yes | Yes |
| women_outfit_change_02 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_02.png | Yes | Yes |
| women_outfit_change_03 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_03.png | Yes | Yes |
| women_outfit_change_04 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_04.png | Yes | Yes |
| women_outfit_change_05 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_05.png | Yes | Yes |
| women_outfit_change_06 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_06.png | Yes | Yes |
| women_outfit_change_07 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_07.png | Yes | Yes |
| women_outfit_change_08 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_08.png | Yes | Yes |
| women_outfit_change_09 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_09.png | Yes | Yes |
| women_outfit_change_10 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_10.png | Yes | Yes |
| women_outfit_change_11 | outfit_change | — | VTO v2 | /media/catalog/outfit_change/women_outfit_change_11.png | Yes | Yes |
| men_preset_gym_01 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_01.png | Yes | Yes |
| men_preset_gym_02 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_02.png | Yes | Yes |
| men_preset_gym_03 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_03.png | Yes | Yes |
| men_preset_gym_04 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_04.png | Yes | Yes |
| men_preset_gym_05 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_05.png | Yes | Yes |
| men_preset_gym_06 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_06.png | Yes | Yes |
| men_preset_gym_07 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_07.png | Yes | Yes |
| men_preset_gym_08 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_08.png | Yes | Yes |
| men_preset_gym_09 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_09.png | Yes | Yes |
| men_preset_gym_10 | presets | preset_gym | VTO v2 | /media/catalog/presets/men_preset_gym_10.png | Yes | Yes |
| men_tryon_01 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_01.png | Yes | Yes |
| men_tryon_02 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_02.png | Yes | Yes |
| men_tryon_03 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_03.png | Yes | Yes |
| men_tryon_04 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_04.png | Yes | Yes |
| men_tryon_05 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_05.png | Yes | Yes |
| men_tryon_06 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_06.png | Yes | Yes |
| men_tryon_07 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_07.png | Yes | Yes |
| men_tryon_08 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_08.png | Yes | Yes |
| men_tryon_09 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_09.png | Yes | Yes |
| men_tryon_10 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/men_tryon_10.png | Yes | Yes |
| women_tryon_01 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_01.png | Yes | Yes |
| women_tryon_02 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_02.png | Yes | Yes |
| women_tryon_03 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_03.png | Yes | Yes |
| women_tryon_04 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_04.png | Yes | Yes |
| women_tryon_05 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_05.png | Yes | Yes |
| women_tryon_06 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_06.png | Yes | Yes |
| women_tryon_07 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_07.png | Yes | Yes |
| women_tryon_08 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_08.png | Yes | Yes |
| women_tryon_09 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_09.png | Yes | Yes |
| women_tryon_10 | virtual_try_on | — | VTO v2 | /media/catalog/virtual_try_on/women_tryon_10.png | Yes | Yes |
| men_arabian_01 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_01.png | Yes | Yes |
| men_arabian_02 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_02.png | Yes | Yes |
| men_arabian_03 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_03.png | Yes | Yes |
| men_arabian_04 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_04.png | Yes | Yes |
| men_arabian_05 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_05.png | Yes | Yes |
| men_arabian_06 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_06.png | Yes | Yes |
| men_arabian_07 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_07.png | Yes | Yes |
| men_arabian_08 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_08.png | Yes | Yes |
| men_arabian_09 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_09.png | Yes | Yes |
| men_arabian_10 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_10.png | Yes | Yes |
| men_arabian_11 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_11.png | Yes | Yes |
| men_arabian_12 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_12.png | Yes | Yes |
| men_arabian_13 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_13.png | Yes | Yes |
| men_arabian_14 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_14.png | Yes | Yes |
| men_arabian_15 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_15.png | Yes | Yes |
| men_arabian_16 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_16.png | Yes | Yes |
| men_arabian_17 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/men_arabian_17.png | Yes | Yes |
| men_chinese_01 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_01.png | Yes | Yes |
| men_chinese_02 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_02.png | Yes | Yes |
| men_chinese_03 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_03.png | Yes | Yes |
| men_chinese_04 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_04.png | Yes | Yes |
| men_chinese_05 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_05.png | Yes | Yes |
| men_chinese_06 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_06.png | Yes | Yes |
| men_chinese_07 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_07.png | Yes | Yes |
| men_chinese_08 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_08.png | Yes | Yes |
| men_chinese_09 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_09.png | Yes | Yes |
| men_chinese_10 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_10.png | Yes | Yes |
| men_chinese_11 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_11.png | Yes | Yes |
| men_chinese_12 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_12.png | Yes | Yes |
| men_chinese_13 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_13.png | Yes | Yes |
| men_chinese_14 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/men_chinese_14.png | Yes | Yes |
| men_indian_01 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_01.png | Yes | Yes |
| men_indian_02 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_02.png | Yes | Yes |
| men_indian_03 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_03.png | Yes | Yes |
| men_indian_04 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_04.png | Yes | Yes |
| men_indian_05 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_05.png | Yes | Yes |
| men_indian_06 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_06.png | Yes | Yes |
| men_indian_07 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_07.png | Yes | Yes |
| men_indian_08 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_08.png | Yes | Yes |
| men_indian_09 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_09.png | Yes | Yes |
| men_indian_10 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_10.png | Yes | Yes |
| men_indian_11 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_11.png | Yes | Yes |
| men_indian_12 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_12.png | Yes | Yes |
| men_indian_13 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_13.png | Yes | Yes |
| men_indian_14 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_14.png | Yes | Yes |
| men_indian_15 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/men_indian_15.png | Yes | Yes |
| men_korean_01 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_01.png | Yes | Yes |
| men_korean_02 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_02.png | Yes | Yes |
| men_korean_03 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_03.png | Yes | Yes |
| men_korean_04 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_04.png | Yes | Yes |
| men_korean_05 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_05.png | Yes | Yes |
| men_korean_06 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_06.png | Yes | Yes |
| men_korean_07 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_07.png | Yes | Yes |
| men_korean_08 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_08.png | Yes | Yes |
| men_korean_09 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_09.png | Yes | Yes |
| men_korean_10 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_10.png | Yes | Yes |
| men_korean_11 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_11.png | Yes | Yes |
| men_korean_12 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_12.png | Yes | Yes |
| men_korean_13 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/men_korean_13.png | Yes | Yes |
| men_pakistani_01 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_01.png | Yes | Yes |
| men_pakistani_02 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_02.png | Yes | Yes |
| men_pakistani_03 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_03.png | Yes | Yes |
| men_pakistani_04 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_04.png | Yes | Yes |
| men_pakistani_05 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_05.png | Yes | Yes |
| men_pakistani_06 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_06.png | Yes | Yes |
| men_pakistani_07 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_07.png | Yes | Yes |
| men_pakistani_08 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_08.png | Yes | Yes |
| men_pakistani_09 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_09.png | Yes | Yes |
| men_pakistani_10 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_10.png | Yes | Yes |
| men_pakistani_11 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_11.png | Yes | Yes |
| men_pakistani_12 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_12.png | Yes | Yes |
| men_pakistani_13 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_13.png | Yes | Yes |
| men_pakistani_14 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_14.png | Yes | Yes |
| men_pakistani_15 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_15.png | Yes | Yes |
| men_pakistani_16 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_16.png | Yes | Yes |
| men_pakistani_17 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_17.png | Yes | Yes |
| men_pakistani_18 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/men_pakistani_18.png | Yes | Yes |
| women_arabian_01 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_01.png | Yes | Yes |
| women_arabian_02 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_02.png | Yes | Yes |
| women_arabian_03 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_03.png | Yes | Yes |
| women_arabian_04 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_04.png | Yes | Yes |
| women_arabian_05 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_05.png | Yes | Yes |
| women_arabian_06 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_06.png | Yes | Yes |
| women_arabian_07 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_07.png | Yes | Yes |
| women_arabian_08 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_08.png | Yes | Yes |
| women_arabian_09 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_09.png | Yes | Yes |
| women_arabian_10 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_10.png | Yes | Yes |
| women_arabian_11 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_11.png | Yes | Yes |
| women_arabian_12 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_12.png | Yes | Yes |
| women_arabian_13 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_13.png | Yes | Yes |
| women_arabian_14 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_14.png | Yes | Yes |
| women_arabian_15 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_15.png | Yes | Yes |
| women_arabian_16 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_16.png | Yes | Yes |
| women_arabian_17 | wardrobe_browse | arabian | VTO v2 | /media/catalog/wardrobe_browse/women_arabian_17.png | Yes | Yes |
| women_chinese_01 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_01.png | Yes | Yes |
| women_chinese_02 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_02.png | Yes | Yes |
| women_chinese_03 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_03.png | Yes | Yes |
| women_chinese_04 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_04.png | Yes | Yes |
| women_chinese_05 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_05.png | Yes | Yes |
| women_chinese_06 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_06.png | Yes | Yes |
| women_chinese_07 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_07.png | Yes | Yes |
| women_chinese_08 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_08.png | Yes | Yes |
| women_chinese_09 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_09.png | Yes | Yes |
| women_chinese_10 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_10.png | Yes | Yes |
| women_chinese_11 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_11.png | Yes | Yes |
| women_chinese_12 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_12.png | Yes | Yes |
| women_chinese_13 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_13.png | Yes | Yes |
| women_chinese_14 | wardrobe_browse | chinese | VTO v2 | /media/catalog/wardrobe_browse/women_chinese_14.png | Yes | Yes |
| women_indian_01 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_01.png | Yes | Yes |
| women_indian_02 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_02.png | Yes | Yes |
| women_indian_03 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_03.png | Yes | Yes |
| women_indian_04 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_04.png | Yes | Yes |
| women_indian_05 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_05.png | Yes | Yes |
| women_indian_06 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_06.png | Yes | Yes |
| women_indian_07 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_07.png | Yes | Yes |
| women_indian_08 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_08.png | Yes | Yes |
| women_indian_09 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_09.png | Yes | Yes |
| women_indian_10 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_10.png | Yes | Yes |
| women_indian_11 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_11.png | Yes | Yes |
| women_indian_12 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_12.png | Yes | Yes |
| women_indian_13 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_13.png | Yes | Yes |
| women_indian_14 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_14.png | Yes | Yes |
| women_indian_15 | wardrobe_browse | indian | VTO v2 | /media/catalog/wardrobe_browse/women_indian_15.png | Yes | Yes |
| women_korean_01 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_01.png | Yes | Yes |
| women_korean_02 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_02.png | Yes | Yes |
| women_korean_03 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_03.png | Yes | Yes |
| women_korean_04 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_04.png | Yes | Yes |
| women_korean_05 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_05.png | Yes | Yes |
| women_korean_06 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_06.png | Yes | Yes |
| women_korean_07 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_07.png | Yes | Yes |
| women_korean_08 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_08.png | Yes | Yes |
| women_korean_09 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_09.png | Yes | Yes |
| women_korean_10 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_10.png | Yes | Yes |
| women_korean_11 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_11.png | Yes | Yes |
| women_korean_12 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_12.png | Yes | Yes |
| women_korean_13 | wardrobe_browse | korean | VTO v2 | /media/catalog/wardrobe_browse/women_korean_13.png | Yes | Yes |
| women_pakistani_01 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_01.png | Yes | Yes |
| women_pakistani_02 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_02.png | Yes | Yes |
| women_pakistani_03 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_03.png | Yes | Yes |
| women_pakistani_04 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_04.png | Yes | Yes |
| women_pakistani_05 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_05.png | Yes | Yes |
| women_pakistani_06 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_06.png | Yes | Yes |
| women_pakistani_07 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_07.png | Yes | Yes |
| women_pakistani_08 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_08.png | Yes | Yes |
| women_pakistani_09 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_09.png | Yes | Yes |
| women_pakistani_10 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_10.png | Yes | Yes |
| women_pakistani_11 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_11.png | Yes | Yes |
| women_pakistani_12 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_12.png | Yes | Yes |
| women_pakistani_13 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_13.png | Yes | Yes |
| women_pakistani_14 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_14.png | Yes | Yes |
| women_pakistani_15 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_15.png | Yes | Yes |
| women_pakistani_16 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_16.png | Yes | Yes |
| women_pakistani_17 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_17.png | Yes | Yes |
| women_pakistani_18 | wardrobe_browse | pakistani | VTO v2 | /media/catalog/wardrobe_browse/women_pakistani_18.png | Yes | Yes |

---

## Per-style audit (all 258 styles)

Each entry: style_id, category, tab, stored COMMAND, current production prompt, engine, reference path, full-outfit intent, misclassification flag.

### `couple_01`

| Field | Value |
|-------|-------|
| **style_id** | `couple_01` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_01 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_01). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_01). Photorealistic, no text or watermarks.
```

### `couple_02`

| Field | Value |
|-------|-------|
| **style_id** | `couple_02` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_02 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_02). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_02). Photorealistic, no text or watermarks.
```

### `couple_03`

| Field | Value |
|-------|-------|
| **style_id** | `couple_03` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_03 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_03). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_03). Photorealistic, no text or watermarks.
```

### `couple_04`

| Field | Value |
|-------|-------|
| **style_id** | `couple_04` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_04 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_04). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_04). Photorealistic, no text or watermarks.
```

### `couple_05`

| Field | Value |
|-------|-------|
| **style_id** | `couple_05` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_05 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_05). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_05). Photorealistic, no text or watermarks.
```

### `couple_06`

| Field | Value |
|-------|-------|
| **style_id** | `couple_06` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_06 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_06). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_06). Photorealistic, no text or watermarks.
```

### `couple_07`

| Field | Value |
|-------|-------|
| **style_id** | `couple_07` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_07 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_07). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_07). Photorealistic, no text or watermarks.
```

### `couple_08`

| Field | Value |
|-------|-------|
| **style_id** | `couple_08` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_08 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_08). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_08). Photorealistic, no text or watermarks.
```

### `couple_09`

| Field | Value |
|-------|-------|
| **style_id** | `couple_09` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_09 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_09). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_09). Photorealistic, no text or watermarks.
```

### `couple_10`

| Field | Value |
|-------|-------|
| **style_id** | `couple_10` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_10 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_10). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_10). Photorealistic, no text or watermarks.
```

### `couple_11`

| Field | Value |
|-------|-------|
| **style_id** | `couple_11` |
| **category** | `couple_duo` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/couple_duo/couple_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Coordinated duo look reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=couple_11 | category=couple_duo | pipeline=neutral | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact coordinated couple/duo outfit ensemble from image 2 (style couple_11). Copy coordinated colors, top and bottom pieces, and styling cues exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style couple_11). Photorealistic, no text or watermarks.
```

### `men_casual_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_01` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_01 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_01, look #01). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_01). Photorealistic, no text or watermarks.
```

### `men_casual_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_02` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_02 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_02, look #02). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_02). Photorealistic, no text or watermarks.
```

### `men_casual_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_03` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_03 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_03, look #03). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_03). Photorealistic, no text or watermarks.
```

### `men_casual_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_04` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_04 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_04, look #04). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_04). Photorealistic, no text or watermarks.
```

### `men_casual_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_05` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_05 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_05, look #05). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_05). Photorealistic, no text or watermarks.
```

### `men_casual_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_06` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_06 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_06, look #06). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_06). Photorealistic, no text or watermarks.
```

### `men_casual_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_07` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_07 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_07, look #07). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_07). Photorealistic, no text or watermarks.
```

### `men_casual_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_08` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_08 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_08, look #08). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_08). Photorealistic, no text or watermarks.
```

### `men_casual_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_09` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_09 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_09, look #09). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_09). Photorealistic, no text or watermarks.
```

### `men_casual_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_casual_10` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_casual_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_casual_10 | category=occasions | pipeline=men | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style men_casual_10, look #10). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_casual_10). Photorealistic, no text or watermarks.
```

### `men_formal_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_01` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_01 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_01, look #01). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_01). Photorealistic, no text or watermarks.
```

### `men_formal_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_02` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_02 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_02, look #02). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_02). Photorealistic, no text or watermarks.
```

### `men_formal_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_03` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_03 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_03, look #03). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_03). Photorealistic, no text or watermarks.
```

### `men_formal_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_04` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_04 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_04, look #04). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_04). Photorealistic, no text or watermarks.
```

### `men_formal_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_05` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_05 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_05, look #05). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_05). Photorealistic, no text or watermarks.
```

### `men_formal_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_06` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_06 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_06, look #06). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_06). Photorealistic, no text or watermarks.
```

### `men_formal_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_07` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_07 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_07, look #07). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_07). Photorealistic, no text or watermarks.
```

### `men_formal_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_08` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_08 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_08, look #08). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_08). Photorealistic, no text or watermarks.
```

### `men_formal_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_09` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_09 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_09, look #09). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_09). Photorealistic, no text or watermarks.
```

### `men_formal_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_formal_10` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/men_formal_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_formal_10 | category=occasions | pipeline=men | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style men_formal_10, look #10). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_formal_10). Photorealistic, no text or watermarks.
```

### `women_casual_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_01` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_01 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_01, look #01). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_01). Photorealistic, no text or watermarks.
```

### `women_casual_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_02` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_02 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_02, look #02). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_02). Photorealistic, no text or watermarks.
```

### `women_casual_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_03` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_03 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_03, look #03). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_03). Photorealistic, no text or watermarks.
```

### `women_casual_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_04` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_04 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_04, look #04). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_04). Photorealistic, no text or watermarks.
```

### `women_casual_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_05` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_05 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_05, look #05). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_05). Photorealistic, no text or watermarks.
```

### `women_casual_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_06` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_06 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_06, look #06). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_06). Photorealistic, no text or watermarks.
```

### `women_casual_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_07` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_07 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_07, look #07). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_07). Photorealistic, no text or watermarks.
```

### `women_casual_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_08` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_08 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_08, look #08). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_08). Photorealistic, no text or watermarks.
```

### `women_casual_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_09` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_09 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_09, look #09). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_09). Photorealistic, no text or watermarks.
```

### `women_casual_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_casual_10` |
| **category** | `occasions` |
| **tab** | `casual` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_casual_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (casual) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_casual_10 | category=occasions | pipeline=women | tab=casual | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact casual daywear outfit from image 2 (style women_casual_10, look #10). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_casual_10). Photorealistic, no text or watermarks.
```

### `women_formal_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_01` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_01 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_01, look #01). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_01). Photorealistic, no text or watermarks.
```

### `women_formal_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_02` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_02 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_02, look #02). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_02). Photorealistic, no text or watermarks.
```

### `women_formal_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_03` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_03 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_03, look #03). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_03). Photorealistic, no text or watermarks.
```

### `women_formal_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_04` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_04 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_04, look #04). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_04). Photorealistic, no text or watermarks.
```

### `women_formal_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_05` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_05 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_05, look #05). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_05). Photorealistic, no text or watermarks.
```

### `women_formal_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_06` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_06 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_06, look #06). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_06). Photorealistic, no text or watermarks.
```

### `women_formal_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_07` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_07 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_07, look #07). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_07). Photorealistic, no text or watermarks.
```

### `women_formal_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_08` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_08 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_08, look #08). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_08). Photorealistic, no text or watermarks.
```

### `women_formal_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_09` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_09 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_09, look #09). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_09). Photorealistic, no text or watermarks.
```

### `women_formal_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_formal_10` |
| **category** | `occasions` |
| **tab** | `formal` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_formal_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (formal) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_formal_10 | category=occasions | pipeline=women | tab=formal | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact formal occasion outfit with tailored fit from image 2 (style women_formal_10, look #10). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_formal_10). Photorealistic, no text or watermarks.
```

### `women_wedding_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_01` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_01 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_01, look #01). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_01). Photorealistic, no text or watermarks.
```

### `women_wedding_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_02` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_02 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_02, look #02). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_02). Photorealistic, no text or watermarks.
```

### `women_wedding_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_03` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_03 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_03, look #03). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_03). Photorealistic, no text or watermarks.
```

### `women_wedding_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_04` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_04 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_04, look #04). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_04). Photorealistic, no text or watermarks.
```

### `women_wedding_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_05` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_05 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_05, look #05). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_05). Photorealistic, no text or watermarks.
```

### `women_wedding_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_06` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_06 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_06, look #06). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_06). Photorealistic, no text or watermarks.
```

### `women_wedding_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_07` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_07 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_07, look #07). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_07). Photorealistic, no text or watermarks.
```

### `women_wedding_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_08` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_08 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_08, look #08). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_08). Photorealistic, no text or watermarks.
```

### `women_wedding_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_09` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_09 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_09, look #09). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_09). Photorealistic, no text or watermarks.
```

### `women_wedding_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_wedding_10` |
| **category** | `occasions` |
| **tab** | `wedding` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/occasions/women_wedding_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Occasion ensemble (wedding) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_wedding_10 | category=occasions | pipeline=women | tab=wedding | region=outfit | The person of image 1, maintaining exactly their face, identity, skin tone, and pose, wearing the exact wedding or festive occasion outfit with ceremonial details from image 2 (style women_wedding_10, look #10). Reproduce garment type, fit, fabric, color, embellishment, and accessories exactly as in image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_wedding_10). Photorealistic, no text or watermarks.
```

### `men_outfit_change_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_outfit_change_01` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/men_outfit_change_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_outfit_change_01 | category=outfit_change | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style men_outfit_change_01). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_outfit_change_01). Photorealistic, no text or watermarks.
```

### `men_outfit_change_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_outfit_change_02` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/men_outfit_change_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_outfit_change_02 | category=outfit_change | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style men_outfit_change_02). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_outfit_change_02). Photorealistic, no text or watermarks.
```

### `women_outfit_change_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_01` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_01 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_01). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_01). Photorealistic, no text or watermarks.
```

### `women_outfit_change_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_02` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_02 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_02). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_02). Photorealistic, no text or watermarks.
```

### `women_outfit_change_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_03` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_03 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_03). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_03). Photorealistic, no text or watermarks.
```

### `women_outfit_change_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_04` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_04 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_04). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_04). Photorealistic, no text or watermarks.
```

### `women_outfit_change_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_05` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_05 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_05). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_05). Photorealistic, no text or watermarks.
```

### `women_outfit_change_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_06` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_06 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_06). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_06). Photorealistic, no text or watermarks.
```

### `women_outfit_change_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_07` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_07 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_07). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_07). Photorealistic, no text or watermarks.
```

### `women_outfit_change_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_08` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_08 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_08). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_08). Photorealistic, no text or watermarks.
```

### `women_outfit_change_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_09` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_09 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_09). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_09). Photorealistic, no text or watermarks.
```

### `women_outfit_change_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_10` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_10 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_10). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_10). Photorealistic, no text or watermarks.
```

### `women_outfit_change_11`

| Field | Value |
|-------|-------|
| **style_id** | `women_outfit_change_11` |
| **category** | `outfit_change` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/outfit_change/women_outfit_change_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Full outfit replacement reference |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_outfit_change_11 | category=outfit_change | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact replacement outfit from image 2 (style women_outfit_change_11). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_outfit_change_11). Photorealistic, no text or watermarks.
```

### `men_preset_gym_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_01` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_01 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_01). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_01). Photorealistic, no text or watermarks.
```

### `men_preset_gym_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_02` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_02 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_02). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_02). Photorealistic, no text or watermarks.
```

### `men_preset_gym_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_03` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_03 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_03). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_03). Photorealistic, no text or watermarks.
```

### `men_preset_gym_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_04` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_04 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_04). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_04). Photorealistic, no text or watermarks.
```

### `men_preset_gym_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_05` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_05 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_05). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_05). Photorealistic, no text or watermarks.
```

### `men_preset_gym_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_06` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_06 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_06). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_06). Photorealistic, no text or watermarks.
```

### `men_preset_gym_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_07` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_07 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_07). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_07). Photorealistic, no text or watermarks.
```

### `men_preset_gym_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_08` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_08 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_08). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_08). Photorealistic, no text or watermarks.
```

### `men_preset_gym_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_09` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_09 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_09). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_09). Photorealistic, no text or watermarks.
```

### `men_preset_gym_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_preset_gym_10` |
| **category** | `presets` |
| **tab** | `preset_gym` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/presets/men_preset_gym_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Preset look (preset_gym) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_preset_gym_10 | category=presets | pipeline=men | tab=preset_gym | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact preset fashion look from image 2 (preset men_preset_gym_10). Match every visible garment layer and accessory from image 2 with photorealistic fidelity.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_preset_gym_10). Photorealistic, no text or watermarks.
```

### `men_tryon_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_01` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_01 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_01). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_01). Photorealistic, no text or watermarks.
```

### `men_tryon_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_02` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_02 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_02). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_02). Photorealistic, no text or watermarks.
```

### `men_tryon_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_03` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_03 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_03). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_03). Photorealistic, no text or watermarks.
```

### `men_tryon_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_04` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_04 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_04). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_04). Photorealistic, no text or watermarks.
```

### `men_tryon_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_05` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_05 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_05). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_05). Photorealistic, no text or watermarks.
```

### `men_tryon_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_06` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_06 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_06). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_06). Photorealistic, no text or watermarks.
```

### `men_tryon_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_07` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_07 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_07). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_07). Photorealistic, no text or watermarks.
```

### `men_tryon_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_08` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_08 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_08). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_08). Photorealistic, no text or watermarks.
```

### `men_tryon_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_09` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_09 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_09). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_09). Photorealistic, no text or watermarks.
```

### `men_tryon_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_tryon_10` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/men_tryon_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_tryon_10 | category=virtual_try_on | pipeline=men | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style men_tryon_10). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_tryon_10). Photorealistic, no text or watermarks.
```

### `women_tryon_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_01` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_01 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_01). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_01). Photorealistic, no text or watermarks.
```

### `women_tryon_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_02` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_02 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_02). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_02). Photorealistic, no text or watermarks.
```

### `women_tryon_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_03` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_03 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_03). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_03). Photorealistic, no text or watermarks.
```

### `women_tryon_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_04` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_04 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_04). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_04). Photorealistic, no text or watermarks.
```

### `women_tryon_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_05` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_05 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_05). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_05). Photorealistic, no text or watermarks.
```

### `women_tryon_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_06` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_06 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_06). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_06). Photorealistic, no text or watermarks.
```

### `women_tryon_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_07` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_07 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_07). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_07). Photorealistic, no text or watermarks.
```

### `women_tryon_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_08` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_08 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_08). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_08). Photorealistic, no text or watermarks.
```

### `women_tryon_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_09` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_09 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_09). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_09). Photorealistic, no text or watermarks.
```

### `women_tryon_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_tryon_10` |
| **category** | `virtual_try_on` |
| **tab** | `—` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/virtual_try_on/women_tryon_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Legacy VTO slot (full look reference; grid may map to wardrobe elsewhere) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_tryon_10 | category=virtual_try_on | pipeline=women | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact full outfit ensemble for virtual try-on from image 2 (style women_tryon_10). Transfer silhouette, fit, fabric texture, color, patterns, layering, and footwear (if visible) exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_tryon_10). Photorealistic, no text or watermarks.
```

### `men_arabian_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_01` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_01 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_01). Photorealistic, no text or watermarks.
```

### `men_arabian_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_02` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_02 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_02). Photorealistic, no text or watermarks.
```

### `men_arabian_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_03` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_03 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_03). Photorealistic, no text or watermarks.
```

### `men_arabian_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_04` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_04 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_04). Photorealistic, no text or watermarks.
```

### `men_arabian_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_05` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_05 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_05). Photorealistic, no text or watermarks.
```

### `men_arabian_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_06` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_06 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_06). Photorealistic, no text or watermarks.
```

### `men_arabian_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_07` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_07 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_07). Photorealistic, no text or watermarks.
```

### `men_arabian_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_08` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_08 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_08). Photorealistic, no text or watermarks.
```

### `men_arabian_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_09` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_09 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_09). Photorealistic, no text or watermarks.
```

### `men_arabian_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_10` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_10 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_10). Photorealistic, no text or watermarks.
```

### `men_arabian_11`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_11` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_11 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_11). Photorealistic, no text or watermarks.
```

### `men_arabian_12`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_12` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_12 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_12). Photorealistic, no text or watermarks.
```

### `men_arabian_13`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_13` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_13 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_13). Photorealistic, no text or watermarks.
```

### `men_arabian_14`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_14` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_14.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_14 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_14, slot 14). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_14). Photorealistic, no text or watermarks.
```

### `men_arabian_15`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_15` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_15.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_15 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_15, slot 15). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_15). Photorealistic, no text or watermarks.
```

### `men_arabian_16`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_16` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_16.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_16 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_16, slot 16). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_16). Photorealistic, no text or watermarks.
```

### `men_arabian_17`

| Field | Value |
|-------|-------|
| **style_id** | `men_arabian_17` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_arabian_17.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_arabian_17 | category=wardrobe_browse | pipeline=men | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (man's arabian catalog men_arabian_17, slot 17). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_arabian_17). Photorealistic, no text or watermarks.
```

### `men_chinese_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_01` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_01 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_01). Photorealistic, no text or watermarks.
```

### `men_chinese_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_02` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_02 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_02). Photorealistic, no text or watermarks.
```

### `men_chinese_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_03` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_03 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_03). Photorealistic, no text or watermarks.
```

### `men_chinese_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_04` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_04 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_04). Photorealistic, no text or watermarks.
```

### `men_chinese_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_05` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_05 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_05). Photorealistic, no text or watermarks.
```

### `men_chinese_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_06` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_06 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_06). Photorealistic, no text or watermarks.
```

### `men_chinese_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_07` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_07 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_07). Photorealistic, no text or watermarks.
```

### `men_chinese_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_08` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_08 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_08). Photorealistic, no text or watermarks.
```

### `men_chinese_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_09` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_09 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_09). Photorealistic, no text or watermarks.
```

### `men_chinese_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_10` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_10 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_10). Photorealistic, no text or watermarks.
```

### `men_chinese_11`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_11` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_11 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_11). Photorealistic, no text or watermarks.
```

### `men_chinese_12`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_12` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_12 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_12). Photorealistic, no text or watermarks.
```

### `men_chinese_13`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_13` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_13 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_13). Photorealistic, no text or watermarks.
```

### `men_chinese_14`

| Field | Value |
|-------|-------|
| **style_id** | `men_chinese_14` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_chinese_14.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_chinese_14 | category=wardrobe_browse | pipeline=men | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (man's chinese catalog men_chinese_14, slot 14). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_chinese_14). Photorealistic, no text or watermarks.
```

### `men_indian_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_01` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_01 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_01). Photorealistic, no text or watermarks.
```

### `men_indian_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_02` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_02 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_02). Photorealistic, no text or watermarks.
```

### `men_indian_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_03` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_03 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_03). Photorealistic, no text or watermarks.
```

### `men_indian_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_04` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_04 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_04). Photorealistic, no text or watermarks.
```

### `men_indian_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_05` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_05 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_05). Photorealistic, no text or watermarks.
```

### `men_indian_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_06` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_06 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_06). Photorealistic, no text or watermarks.
```

### `men_indian_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_07` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_07 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_07). Photorealistic, no text or watermarks.
```

### `men_indian_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_08` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_08 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_08). Photorealistic, no text or watermarks.
```

### `men_indian_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_09` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_09 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_09). Photorealistic, no text or watermarks.
```

### `men_indian_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_10` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_10 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_10). Photorealistic, no text or watermarks.
```

### `men_indian_11`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_11` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_11 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_11). Photorealistic, no text or watermarks.
```

### `men_indian_12`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_12` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_12 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_12). Photorealistic, no text or watermarks.
```

### `men_indian_13`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_13` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_13 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_13). Photorealistic, no text or watermarks.
```

### `men_indian_14`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_14` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_14.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_14 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_14, slot 14). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_14). Photorealistic, no text or watermarks.
```

### `men_indian_15`

| Field | Value |
|-------|-------|
| **style_id** | `men_indian_15` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_indian_15.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_indian_15 | category=wardrobe_browse | pipeline=men | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (man's indian catalog men_indian_15, slot 15). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_indian_15). Photorealistic, no text or watermarks.
```

### `men_korean_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_01` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_01 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_01). Photorealistic, no text or watermarks.
```

### `men_korean_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_02` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_02 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_02). Photorealistic, no text or watermarks.
```

### `men_korean_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_03` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_03 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_03). Photorealistic, no text or watermarks.
```

### `men_korean_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_04` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_04 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_04). Photorealistic, no text or watermarks.
```

### `men_korean_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_05` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_05 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_05). Photorealistic, no text or watermarks.
```

### `men_korean_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_06` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_06 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_06). Photorealistic, no text or watermarks.
```

### `men_korean_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_07` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_07 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_07). Photorealistic, no text or watermarks.
```

### `men_korean_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_08` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_08 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_08). Photorealistic, no text or watermarks.
```

### `men_korean_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_09` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_09 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_09). Photorealistic, no text or watermarks.
```

### `men_korean_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_10` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_10 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_10). Photorealistic, no text or watermarks.
```

### `men_korean_11`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_11` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_11 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_11). Photorealistic, no text or watermarks.
```

### `men_korean_12`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_12` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_12 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_12). Photorealistic, no text or watermarks.
```

### `men_korean_13`

| Field | Value |
|-------|-------|
| **style_id** | `men_korean_13` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_korean_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_korean_13 | category=wardrobe_browse | pipeline=men | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (man's korean catalog men_korean_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_korean_13). Photorealistic, no text or watermarks.
```

### `men_pakistani_01`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_01` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_01 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_01). Photorealistic, no text or watermarks.
```

### `men_pakistani_02`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_02` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_02 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_02). Photorealistic, no text or watermarks.
```

### `men_pakistani_03`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_03` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_03 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_03). Photorealistic, no text or watermarks.
```

### `men_pakistani_04`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_04` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_04 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_04). Photorealistic, no text or watermarks.
```

### `men_pakistani_05`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_05` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_05 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_05). Photorealistic, no text or watermarks.
```

### `men_pakistani_06`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_06` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_06 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_06). Photorealistic, no text or watermarks.
```

### `men_pakistani_07`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_07` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_07 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_07). Photorealistic, no text or watermarks.
```

### `men_pakistani_08`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_08` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_08 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_08). Photorealistic, no text or watermarks.
```

### `men_pakistani_09`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_09` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_09 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_09). Photorealistic, no text or watermarks.
```

### `men_pakistani_10`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_10` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_10 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_10). Photorealistic, no text or watermarks.
```

### `men_pakistani_11`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_11` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_11 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_11). Photorealistic, no text or watermarks.
```

### `men_pakistani_12`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_12` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_12 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_12). Photorealistic, no text or watermarks.
```

### `men_pakistani_13`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_13` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_13 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_13). Photorealistic, no text or watermarks.
```

### `men_pakistani_14`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_14` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_14.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_14 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_14, slot 14). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_14). Photorealistic, no text or watermarks.
```

### `men_pakistani_15`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_15` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_15.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_15 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_15, slot 15). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_15). Photorealistic, no text or watermarks.
```

### `men_pakistani_16`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_16` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_16.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_16 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_16, slot 16). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_16). Photorealistic, no text or watermarks.
```

### `men_pakistani_17`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_17` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_17.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_17 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_17, slot 17). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_17). Photorealistic, no text or watermarks.
```

### `men_pakistani_18`

| Field | Value |
|-------|-------|
| **style_id** | `men_pakistani_18` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/men_pakistani_18.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=men_pakistani_18 | category=wardrobe_browse | pipeline=men | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (man's pakistani catalog men_pakistani_18, slot 18). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style men_pakistani_18). Photorealistic, no text or watermarks.
```

### `women_arabian_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_01` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_01 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_01). Photorealistic, no text or watermarks.
```

### `women_arabian_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_02` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_02 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_02). Photorealistic, no text or watermarks.
```

### `women_arabian_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_03` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_03 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_03). Photorealistic, no text or watermarks.
```

### `women_arabian_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_04` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_04 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_04). Photorealistic, no text or watermarks.
```

### `women_arabian_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_05` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_05 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_05). Photorealistic, no text or watermarks.
```

### `women_arabian_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_06` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_06 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_06). Photorealistic, no text or watermarks.
```

### `women_arabian_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_07` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_07 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_07). Photorealistic, no text or watermarks.
```

### `women_arabian_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_08` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_08 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_08). Photorealistic, no text or watermarks.
```

### `women_arabian_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_09` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_09 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_09). Photorealistic, no text or watermarks.
```

### `women_arabian_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_10` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_10 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_10). Photorealistic, no text or watermarks.
```

### `women_arabian_11`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_11` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_11 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_11). Photorealistic, no text or watermarks.
```

### `women_arabian_12`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_12` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_12 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_12). Photorealistic, no text or watermarks.
```

### `women_arabian_13`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_13` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_13 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_13). Photorealistic, no text or watermarks.
```

### `women_arabian_14`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_14` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_14.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_14 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_14, slot 14). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_14). Photorealistic, no text or watermarks.
```

### `women_arabian_15`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_15` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_15.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_15 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_15, slot 15). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_15). Photorealistic, no text or watermarks.
```

### `women_arabian_16`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_16` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_16.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_16 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_16, slot 16). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_16). Photorealistic, no text or watermarks.
```

### `women_arabian_17`

| Field | Value |
|-------|-------|
| **style_id** | `women_arabian_17` |
| **category** | `wardrobe_browse` |
| **tab** | `arabian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_arabian_17.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (arabian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_arabian_17 | category=wardrobe_browse | pipeline=women | tab=arabian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Arabian traditional garment (thobe, kandura, abaya, or regional robe as shown) from image 2 (woman's arabian catalog women_arabian_17, slot 17). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_arabian_17). Photorealistic, no text or watermarks.
```

### `women_chinese_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_01` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_01 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_01). Photorealistic, no text or watermarks.
```

### `women_chinese_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_02` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_02 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_02). Photorealistic, no text or watermarks.
```

### `women_chinese_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_03` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_03 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_03). Photorealistic, no text or watermarks.
```

### `women_chinese_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_04` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_04 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_04). Photorealistic, no text or watermarks.
```

### `women_chinese_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_05` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_05 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_05). Photorealistic, no text or watermarks.
```

### `women_chinese_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_06` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_06 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_06). Photorealistic, no text or watermarks.
```

### `women_chinese_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_07` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_07 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_07). Photorealistic, no text or watermarks.
```

### `women_chinese_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_08` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_08 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_08). Photorealistic, no text or watermarks.
```

### `women_chinese_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_09` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_09 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_09). Photorealistic, no text or watermarks.
```

### `women_chinese_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_10` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_10 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_10). Photorealistic, no text or watermarks.
```

### `women_chinese_11`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_11` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_11 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_11). Photorealistic, no text or watermarks.
```

### `women_chinese_12`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_12` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_12 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_12). Photorealistic, no text or watermarks.
```

### `women_chinese_13`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_13` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_13 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_13). Photorealistic, no text or watermarks.
```

### `women_chinese_14`

| Field | Value |
|-------|-------|
| **style_id** | `women_chinese_14` |
| **category** | `wardrobe_browse` |
| **tab** | `chinese` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_chinese_14.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (chinese) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_chinese_14 | category=wardrobe_browse | pipeline=women | tab=chinese | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Chinese-inspired outfit (qipao, cheongsam, or modern Chinese formal wear as shown) from image 2 (woman's chinese catalog women_chinese_14, slot 14). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_chinese_14). Photorealistic, no text or watermarks.
```

### `women_indian_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_01` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_01 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_01). Photorealistic, no text or watermarks.
```

### `women_indian_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_02` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_02 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_02). Photorealistic, no text or watermarks.
```

### `women_indian_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_03` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_03 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_03). Photorealistic, no text or watermarks.
```

### `women_indian_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_04` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_04 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_04). Photorealistic, no text or watermarks.
```

### `women_indian_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_05` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_05 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_05). Photorealistic, no text or watermarks.
```

### `women_indian_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_06` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_06 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_06). Photorealistic, no text or watermarks.
```

### `women_indian_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_07` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_07 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_07). Photorealistic, no text or watermarks.
```

### `women_indian_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_08` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_08 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_08). Photorealistic, no text or watermarks.
```

### `women_indian_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_09` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_09 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_09). Photorealistic, no text or watermarks.
```

### `women_indian_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_10` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_10 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_10). Photorealistic, no text or watermarks.
```

### `women_indian_11`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_11` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_11 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_11). Photorealistic, no text or watermarks.
```

### `women_indian_12`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_12` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_12 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_12). Photorealistic, no text or watermarks.
```

### `women_indian_13`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_13` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_13 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_13). Photorealistic, no text or watermarks.
```

### `women_indian_14`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_14` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_14.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_14 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_14, slot 14). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_14). Photorealistic, no text or watermarks.
```

### `women_indian_15`

| Field | Value |
|-------|-------|
| **style_id** | `women_indian_15` |
| **category** | `wardrobe_browse` |
| **tab** | `indian` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_indian_15.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (indian) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_indian_15 | category=wardrobe_browse | pipeline=women | tab=indian | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Indian outfit (saree, lehenga, kurta, or dupatta set as shown) from image 2 (woman's indian catalog women_indian_15, slot 15). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_indian_15). Photorealistic, no text or watermarks.
```

### `women_korean_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_01` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_01 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_01). Photorealistic, no text or watermarks.
```

### `women_korean_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_02` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_02 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_02). Photorealistic, no text or watermarks.
```

### `women_korean_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_03` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_03 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_03). Photorealistic, no text or watermarks.
```

### `women_korean_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_04` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_04 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_04). Photorealistic, no text or watermarks.
```

### `women_korean_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_05` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_05 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_05). Photorealistic, no text or watermarks.
```

### `women_korean_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_06` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_06 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_06). Photorealistic, no text or watermarks.
```

### `women_korean_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_07` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_07 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_07). Photorealistic, no text or watermarks.
```

### `women_korean_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_08` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_08 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_08). Photorealistic, no text or watermarks.
```

### `women_korean_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_09` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_09 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_09). Photorealistic, no text or watermarks.
```

### `women_korean_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_10` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_10 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_10). Photorealistic, no text or watermarks.
```

### `women_korean_11`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_11` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_11 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_11). Photorealistic, no text or watermarks.
```

### `women_korean_12`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_12` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_12 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_12). Photorealistic, no text or watermarks.
```

### `women_korean_13`

| Field | Value |
|-------|-------|
| **style_id** | `women_korean_13` |
| **category** | `wardrobe_browse` |
| **tab** | `korean` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_korean_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (korean) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_korean_13 | category=wardrobe_browse | pipeline=women | tab=korean | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact Korean-inspired outfit (modern Korean street or traditional-inspired silhouette as shown) from image 2 (woman's korean catalog women_korean_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_korean_13). Photorealistic, no text or watermarks.
```

### `women_pakistani_01`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_01` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_01.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_01 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_01, slot 01). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_01). Photorealistic, no text or watermarks.
```

### `women_pakistani_02`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_02` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_02.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_02 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_02, slot 02). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_02). Photorealistic, no text or watermarks.
```

### `women_pakistani_03`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_03` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_03.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_03 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_03, slot 03). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_03). Photorealistic, no text or watermarks.
```

### `women_pakistani_04`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_04` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_04.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_04 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_04, slot 04). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_04). Photorealistic, no text or watermarks.
```

### `women_pakistani_05`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_05` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_05.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_05 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_05, slot 05). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_05). Photorealistic, no text or watermarks.
```

### `women_pakistani_06`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_06` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_06.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_06 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_06, slot 06). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_06). Photorealistic, no text or watermarks.
```

### `women_pakistani_07`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_07` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_07.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_07 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_07, slot 07). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_07). Photorealistic, no text or watermarks.
```

### `women_pakistani_08`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_08` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_08.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_08 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_08, slot 08). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_08). Photorealistic, no text or watermarks.
```

### `women_pakistani_09`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_09` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_09.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_09 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_09, slot 09). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_09). Photorealistic, no text or watermarks.
```

### `women_pakistani_10`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_10` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_10.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_10 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_10, slot 10). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_10). Photorealistic, no text or watermarks.
```

### `women_pakistani_11`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_11` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_11.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_11 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_11, slot 11). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_11). Photorealistic, no text or watermarks.
```

### `women_pakistani_12`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_12` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_12.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_12 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_12, slot 12). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_12). Photorealistic, no text or watermarks.
```

### `women_pakistani_13`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_13` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_13.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_13 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_13, slot 13). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_13). Photorealistic, no text or watermarks.
```

### `women_pakistani_14`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_14` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_14.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_14 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_14, slot 14). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_14). Photorealistic, no text or watermarks.
```

### `women_pakistani_15`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_15` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_15.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_15 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_15, slot 15). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_15). Photorealistic, no text or watermarks.
```

### `women_pakistani_16`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_16` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_16.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_16 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_16, slot 16). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_16). Photorealistic, no text or watermarks.
```

### `women_pakistani_17`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_17` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_17.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_17 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_17, slot 17). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_17). Photorealistic, no text or watermarks.
```

### `women_pakistani_18`

| Field | Value |
|-------|-------|
| **style_id** | `women_pakistani_18` |
| **category** | `wardrobe_browse` |
| **tab** | `pakistani` |
| **engine** | BFL Virtual Try-On v2 |
| **reference image** | `/media/catalog/wardrobe_browse/women_pakistani_18.png` |
| **local PNG present** | Yes |
| **full-outfit reference intent** | Regional traditional ensemble (pakistani) |
| **misclassification flag** | _None_ |

**Stored COMMAND:**

```text
COMMAND: style_ref=women_pakistani_18 | category=wardrobe_browse | pipeline=women | tab=pakistani | region=outfit | The person of image 1, maintaining exactly their face, identity, and pose, wearing the exact traditional Pakistani outfit (shalwar kameez, kurta, dupatta, or waistcoat as shown) from image 2 (woman's pakistani catalog women_pakistani_18, slot 18). Copy cut, drape, textile, color, print, embroidery, trims, and accessories exactly from image 2.
```

**Current production prompt (`buildVtoPrompt`, legacy):**

```text
TRY-ON: The person of image 1 wearing the garments of image 2. Preserve face, identity, hair, body proportions, pose, camera angle, lighting, and background from image 1. Transfer only the outfit from image 2 (catalog style women_pakistani_18). Photorealistic, no text or watermarks.
```

