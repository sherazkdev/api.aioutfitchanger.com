# Wardrobe Phase 1 — validation report

**Date:** 2026-10-06  
**Scope:** Regression (419 styles) + BFL smoke. **No deploy.** Production prompts/code unchanged for this validation.

---

## PHASE 1 VALIDATED — 105/105 prompt mapping confirmed and representative real BFL tests passed.

---

## 1. Full regression (419 styles)

Checked **every** catalog row in `BACKEND_PROMPT_CATALOG_OPTIMIZED.csv` using production helpers:

- `shouldUseWardrobePhase1VtoPrompt` + `buildVtoPrompt` → Phase 1 master (`Edit image 1 directly…`)
- Otherwise `shouldUseVtoEngine` → legacy VTO (`TRY-ON: The person of image 1…`) or FLUX path (non-VTO)

| Bucket | Count | Expected |
|--------|------:|---------:|
| **Phase 1 wardrobe garment** | **105** | 105 |
| Legacy VTO (`TRY-ON:` prefix) | 258 | 258 |
| Legacy FLUX (beauty / non-outfit) | 56 | 56 |
| **Legacy total** | **314** | 314 |
| **Catalog total** | **419** | 419 |

**Phase 1 by tab:**

| Tab | Count |
|-----|------:|
| tops | 11 |
| shirts | 20 |
| bottoms | 16 |
| skirts | 16 |
| jackets | 42 |

**Unexpected style IDs:** none (`unexpected: []`)

**Runner:** `npx tsx artifacts/validate-phase1-full-regression.mjs`

---

## 2. BFL smoke test

**Garment (Image 2):** Production CDN — `https://appworkspro.com/media/catalog/wardrobe_browse/{style_id}.png`

**Engine:** BFL Virtual Try-On v2 — `POST {BFL_API_BASE}/v1/flux-tools/vto-v2`  
**Prompt:** Production `buildVtoPrompt(stored COMMAND, style_id, wardrobe_browse)` from `src/lib/server/bfl/tryOnEngine.ts` (same as generate route VTO branch).

**Payload:** `{ prompt, person, garment, output_format: "jpeg" }` (matches `src/app/api/v1/try-on/generate/route.ts` VTO branch).

### Results table (representative styles)

| Style | Person fixture | Target | Identity preserved | Non-target clothes preserved | Garment matched | Result |
|---|---|---|---|---|---|---|
| women_skirts_03 | Female (shared root fixture) | skirt | Yes | Yes — top unchanged | Yes — ombre pleated skirt | **PASS** |
| women_tops_03 | Female | top | Yes | Waist-up frame | Yes | **PASS** |
| women_jackets_03 | Female | jacket | Yes | Outerwear expected | Yes — varsity jacket | **PASS** |
| men_bottoms_03 | Female | bottoms | Yes | Yes — top unchanged | Yes — patterned pants at hem | **PASS** |
| men_shirts_03 (initial) | Female | shirt | Yes | Waist-up | Yes | **PARTIAL** — wrong person gender for men’s SKU |
| **men_shirts_03 (final)** | **Male** | shirt | **Yes** — same face, hair, beard, smile, marble background | **Yes** — waist-up; lower body not in frame | **Yes** — yellow/black WARNING graphic shirt from ref | **PASS** |

### Final `men_shirts_03` verification (male person)

**Source:** `artifacts/wardrobe-phase1-smoke-test/men_shirts_03/source-person.jpg`  
(Unsplash male portrait — URL in `source-person-url.txt`)

| Check | Outcome |
|-------|---------|
| Same identity / face | Yes — same man, expression, beard, hairstyle |
| Same body (visible) | Yes — shoulders/neck consistent |
| Same pose | Yes — forward-facing headshot |
| Same background | Yes — grey marble backdrop |
| Lower-body unchanged | N/A (crop); no lower-body edit requested |
| Only shirt replaced | Yes — white V-neck → catalog WARNING-pattern shirt |
| Men’s shirt reference matched | Yes — yellow base + black WARNING band graphics |
| Not a newly generated person | Yes — clear edit of Image 1 |

**Artifacts:** `artifacts/wardrobe-phase1-smoke-test/men_shirts_03/` — `source-person.jpg`, `garment-reference.png`, `result.jpg`, `prompt.txt`, `stored-command.txt`, `bfl-metadata.json`

**Runner:** `npx tsx artifacts/run-men-shirts-03-male-validation.mjs`

---

## 3. Failed / problematic styles

| Style | Issue |
|-------|--------|
| men_shirts_03 (initial female fixture) | Superseded — **final male run PASS** (see above). |
| All other smoke styles | **PASS** |

---

## 4. Artifact paths

| Asset | Path |
|-------|------|
| **Report** | `D:\ai-outfit-changer\WARDROBE_PHASE1_SMOKE_TEST.md` |
| **Smoke output root** | `D:\ai-outfit-changer\artifacts\wardrobe-phase1-smoke-test\` |
| **Shared female fixture (first batch)** | `artifacts/wardrobe-phase1-smoke-test/source-person.jpg` |
| **Per-style folders** | `artifacts/wardrobe-phase1-smoke-test/{style_id}/` |
| **men_shirts_03 final validation** | `artifacts/wardrobe-phase1-smoke-test/men_shirts_03/` |

---

## 5. Example Phase 1 prompt (`men_shirts_03`)

See `artifacts/wardrobe-phase1-smoke-test/men_shirts_03/prompt.txt`.
