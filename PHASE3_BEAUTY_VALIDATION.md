# Phase 3 — Beauty / FLUX validation

**Date:** 2026-10-07  
**Scope:** 56 catalog styles (`region` ∈ hair_style, hair_color, beard, hijab)  
**Constraints:** No Phase 1 / Phase 2 / prompt / Beauty code changes; no deploy.

## 1. Counts by category

| Region (COMMAND) | Catalog category_id | Count |
|------------------|---------------------|------:|
| hair_style | hair_styles | 16 |
| hair_color | hair_color | 20 |
| beard | beard_styles | 10 |
| hijab | hijab_styles | 10 |
| **Total Beauty / FLUX** | | **56** |

## 2. Routing audit

**Result: PASS**

- All 56 styles: `shouldUseVtoEngine` = false, Phase 1 = false, Phase 2 = false → **FLUX-2-pro** (`buildFluxEditPrompt` → `buildFluxPrompt`).
- No overlap with Phase 1 (105) or Phase 2 (258).
- All 56 reference PNGs present under `public/media/catalog/{category}/`.
- Machine audit: `artifacts/phase3-beauty-audit.json` (`routing.all_flux: true`).

## 3. Prompt audit (actual FLUX string via `buildFluxPrompt`)

**Result: PASS — 0 flags across 56 styles**

Checked for each style:

- `TRY-ON EDIT` identity lock + region transfer block + COMMAND action + negative guardrails
- No VTO outfit wrapper (`wearing the garments of image 2`)
- No generic full-image regeneration / identity-replacement wording
- Region-specific `ONLY` / preserve-face-clothing-background language present in stored COMMAND

**No prompt changes made.**

## 4. Representative FLUX smokes (12)

Engine: `POST /v1/flux-2-pro` with `input_image` (person) + `input_image_2` (catalog ref).  
Artifacts: `artifacts/phase3-beauty-flux-smoke/{style_id}/` (prompt + result.jpg).

| style_id | region | Identity | Face | Target transform | Non-target preserve | Background | Overall |
|----------|--------|----------|------|------------------|---------------------|------------|---------|
| men_hair_styles_02 | hair_style | PASS | PASS | PASS | PASS | PASS | **PASS** |
| women_hair_styles_04 | hair_style | PASS | PASS | PASS | PARTIAL | PASS | **PARTIAL** |
| men_hair_styles_07 | hair_style | PASS | PASS | PASS | PASS | PASS | **PASS** |
| men_hair_color_03 | hair_color | PASS | PASS | PASS | PASS | PASS | **PASS** |
| women_hair_color_05 | hair_color | PASS | PASS | PASS | PARTIAL | PASS | **PARTIAL** |
| men_hair_color_08 | hair_color | PASS | PASS | PASS | PASS | PASS | **PASS** |
| men_beard_03 | beard | PASS | PASS | PASS | PASS | PASS | **PASS** |
| men_beard_06 | beard | PASS | PASS | PASS | PASS | PASS | **PASS** |
| men_beard_09 | beard | PASS | PASS | PASS | PASS | PASS | **PASS** |
| women_hijab_02 | hijab | PASS | PASS | PASS | PARTIAL | PASS | **PARTIAL** |
| women_hijab_05 | hijab | PASS | PASS | PARTIAL | PARTIAL | PASS | **PARTIAL** |
| women_hijab_08 | hijab | PASS | PASS | PARTIAL | PARTIAL | PASS | **PARTIAL** |

All 12 BFL jobs completed (`bfl_ok: true`).

## 5. PASS / PARTIAL / FAIL totals (smokes)

| Grade | Count |
|-------|------:|
| PASS | 7 |
| PARTIAL | 5 |
| FAIL | 0 |

## 6. Failures and root causes

No FAIL grades. PARTIAL patterns:

| Pattern | Styles | Likely cause |
|---------|--------|----------------|
| Hand pose + sheer/mesh top vs plain source tee | women_hair_styles_04, women_hair_color_05, women_hijab_02 | **FLUX/model limitation** — reference plate styling bleeds into global appearance; prompts already lock clothing/background |
| Hijab coverage incomplete (hair still visible) | women_hijab_05, women_hijab_08 | **FLUX/model limitation** + **source/reference mismatch** (loose hair on source; ref shows partial drape) |
| Hijab drape OK but wardrobe drift | women_hijab_02 | **Reference asset styling** (mesh sleeves on plate) + FLUX coupling |

**Not attributed to:** routing (all FLUX), prompt defects (audit clean), or missing assets.

**No global prompt rewrite recommended** from this sample.

## 7. Regression

| Check | Result |
|-------|--------|
| `npm run build` | PASS |
| Phase 1 (`test:wardrobe-phase1`) | 105 styles, 11 tests pass |
| Phase 2 (`test:full-outfit-phase2`) | 258 + 105 + 56 = 419, 18 tests pass |
| Beauty (`test:beauty-flux`) | 56 styles, 4 tests pass |
| `verify-production-prompts` | 419/419, mismatch 0 |

## 8. Phase 3 completion

**Declared complete for catalog + routing + prompt contract:** all 56 Beauty styles mapped, audited, and regression-clean.

**Operational note:** Representative smokes show **strong male hair/beard** localized edits; **female hijab** samples are **PARTIAL** on strict non-target preservation — track in production QA with user selfies before deploy; optional follow-up is per-style ref or source-image guidance, not a blanket prompt change.

**Deploy:** not performed.
