# Phase 2 visual failure analysis (investigation only)

**Date:** 2026-10-06  
**Scope:** `couple_01`, `men_arabian_01`, `women_indian_01` — diagnosis, A/B prompts, 9-style family smokes.  
**Production:** unchanged. No deploy.

---

## 1. Per-style diagnosis

### `couple_01` (couple_duo)

| Field | Finding |
|-------|---------|
| **Production prompt (Phase 2 A)** | `artifacts/full-outfit-phase2-smoke-test/couple_01/prompt.txt` — full Phase 2 master + couple people-count tail (924 chars). |
| **Image 1 (person)** | Single adult male, marble-ish gray studio background (`source-person.jpg` in smoke dir). |
| **Image 2 (garment slot)** | **Two people** — full-body couple on plain studio beige (`public/media/catalog/couple_duo/couple_01.png`). Lifestyle/model plate, not isolated clothing. |
| **Result A** | `artifacts/full-outfit-phase2-smoke-test/couple_01/result.jpg` — **second person added**; male identity altered; couple composition copied from image 2. |
| **BFL payload** | Same as production route: `POST /v1/flux-tools/vto-v2` with `{ prompt, person, garment, output_format }` data URLs (`bfl-request-meta.json` in test dirs). |
| **Reference people count** | **2** |
| **Source people count** | **1** |
| **Reference vs source gender** | Ref: man + woman. Source: man only. |
| **Reference type** | Full **couple photograph** (two models, poses, faces, outfits). |
| **Likely cause** | **VTO v2 treats image 2 as a composite scene**, not decomposable “clothing only.” Dual-subject reference + “coordinated couple outfit” COMMAND semantics encourage copying both models. Prompt text cannot reliably override when the garment image **is** two people. |

**Targeted prompt B:** `artifacts/phase2-visual-failure-tests/ab/couple_01/B_targeted/prompt.txt` (464 chars, stricter “NEVER copy any person from image 2”).  
**Result B:** `.../B_targeted/result.jpg` — **still two different people**, full couple scene; **stricter prompt did not fix.**

---

### `men_arabian_01` (wardrobe_browse / arabian)

| Field | Finding |
|-------|---------|
| **Production prompt (A)** | `artifacts/full-outfit-phase2-smoke-test/men_arabian_01/prompt.txt` (838 chars). |
| **Image 1** | Single male, gray textured studio background. |
| **Image 2 (catalog)** | **`men_arabian_01.png` is NOT a men’s Arabian plate** — single **woman** in maroon dress + white hijab, **outdoor park** background (bare trees, path). Catalog row says `gender=men`, `tab=arabian`. |
| **Result A** | Outdoor background leaked; body collapsed / regenerated; face somewhat preserved but scene wrong. |
| **BFL payload** | `{ prompt, person, garment, output_format }` — see `artifacts/phase2-visual-failure-tests/ab/men_arabian_01/B_targeted/bfl-request-meta.json`. |
| **Reference people** | 1 (female model) |
| **Gender match** | **Mismatch** — catalog men, asset female |
| **Reference type** | Full **lifestyle model photo** with strong environment (not flat garment/product shot). |
| **Likely cause** | **Wrong/mislabeled reference asset** + **environment-rich garment image**. Model copies background and body context from image 2. Compare **`men_arabian_02.png`**: male model, studio beige, proper thobe/bisht — family test **succeeds** with same Phase 2 prompt. |

**Targeted prompt B:** `.../B_targeted/result.jpg` — **identity, pose, background preserved**; outfit only partially changed (maroon top — color bleed from ref, not full Arabian garment). **Prompt helped preservation; asset still wrong for outfit.**

---

### `women_indian_01` (wardrobe_browse / indian)

| Field | Finding |
|-------|---------|
| **Production prompt (A)** | `artifacts/full-outfit-phase2-smoke-test/women_indian_01/prompt.txt` (859 chars). |
| **Image 1** | Single female, dark gray studio background. |
| **Image 2 (catalog)** | **`women_indian_01.png` shows a male model** (white turban, sherwani, outdoor grass/trees). Catalog row: `gender=women`, `tab=indian`. |
| **Result A** | Identity OK; **original white embroidered top largely remains**; weak full-outfit replacement. |
| **Reference people** | 1 (male) |
| **Gender match** | **Mismatch** — women slot, male asset |
| **Reference type** | Full **on-model outdoor** photo (same file content as `men_indian_01` slot pattern). |
| **Likely cause** | **Wrong gender asset in women_indian_01 slot** + VTO difficulty replacing structured western/top garments with distant cultural silhouette. **`women_indian_02.png`** is a correct female saree-style plate; family test still shows **partial layering** (original garment visible under drape) — **prompt + engine limitation** on top of asset issues for `_01` only. |

**Targeted prompt B:** `.../B_targeted/result.jpg` — **clearer outfit swap** (white kurta-style with gold trim); identity/background preserved. **Prompt helps; fixing `women_indian_01` asset to female plate still required.**

---

## 2. A/B comparison (same person + reference + endpoint)

Visual grades: PASS / PARTIAL / FAIL (agent review of saved JPEGs).

| Check | couple_01 Current (A) | couple_01 Targeted (B) | men_arabian_01 Current (A) | men_arabian_01 Targeted (B) | women_indian_01 Current (A) | women_indian_01 Targeted (B) |
|-------|----------------------|------------------------|----------------------------|-----------------------------|----------------------------|------------------------------|
| Identity preserved | FAIL | FAIL | PARTIAL | PASS | PASS | PASS |
| Body preserved | FAIL | FAIL | FAIL | PASS | PASS | PASS |
| Pose preserved | PARTIAL | FAIL | FAIL | PASS | PASS | PASS |
| Background preserved | FAIL | FAIL | FAIL | PASS | PASS | PASS |
| Outfit transferred | PARTIAL | PARTIAL | PARTIAL | PARTIAL | FAIL | PARTIAL |
| Extra people | FAIL | FAIL | PASS | PASS | PASS | PASS |
| **Overall** | **FAIL** | **FAIL** | **FAIL** | **PARTIAL** | **PARTIAL** | **PARTIAL** |

**Artifacts:**  
- A: `artifacts/full-outfit-phase2-smoke-test/{style_id}/`  
- B: `artifacts/phase2-visual-failure-tests/ab/{style_id}/B_targeted/`

---

## 3. Family risk — 9 additional styles (Phase 2 prompt A only)

Same female/male Unsplash sources as smoke tests; gender matched to catalog where applicable.

| style_id | category | ref people | catalog gender | ref notes | Identity | Body/pose | Background | Outfit | Extra people | Overall |
|----------|----------|------------|----------------|-----------|----------|-----------|------------|--------|--------------|---------|
| couple_02 | couple_duo | 2 | — | couple plate | PASS | PASS | PASS | PARTIAL | PASS | PARTIAL |
| couple_03 | couple_duo | 2 | — | couple plate | PASS | PASS | PASS | PARTIAL | PASS | PARTIAL |
| couple_04 | couple_duo | 2 | — | couple plate | FAIL | FAIL | PARTIAL | PARTIAL | FAIL | FAIL |
| men_arabian_02 | arabian | 1 | men | studio male thobe | PASS | PASS | PASS | PASS | PASS | PASS |
| men_arabian_03 | arabian | 1 | men | studio plate | PARTIAL | FAIL | PASS | FAIL | FAIL | FAIL |
| men_arabian_04 | arabian | 1 | men | plate w/ camel | PARTIAL | PASS | FAIL | PARTIAL | PASS | PARTIAL |
| women_indian_02 | indian | 1 | women | female saree plate | PASS | PASS | PASS | PARTIAL | PASS | PARTIAL |
| women_indian_03 | indian | 1 | women | female plate | PASS | PASS | PASS | FAIL | PASS | PARTIAL |
| men_indian_01 | indian | 1 | men | male outdoor sherwani | PASS | PASS | PASS | PASS | PASS | PASS |

**Artifacts:** `artifacts/phase2-visual-failure-tests/family/{style_id}/`

**Pattern:**  
- **couple_duo:** inconsistent — sometimes single-person OK (`couple_02`, `couple_03`), sometimes catastrophic (`couple_01` A/B, `couple_04`). Category + **two-person reference** = high risk; not fixed by longer prompts.  
- **Arabian:** **`men_arabian_01` is an asset error**; other slots vary (`02` good, `03`/`04` ref/scene issues).  
- **Indian:** **`women_indian_01` asset is male**; `men_indian_01` good; women slots often **partial** drape/layering.

---

## 4. Recommendations (no production change yet)

| Issue | Recommendation |
|-------|----------------|
| **couple_duo** | **Reference / product fix primary:** supply **single-subject or split male/female clothing plates** (or crop/mannequin/flat-lay), not full couple photos in the `garment` slot. Optional small **couple-specific prompt** only after assets change. If two-person refs remain, treat as **known VTO limitation** — do not keep lengthening prompts. |
| **men_arabian_01** | **Replace `men_arabian_01` PNG** with correct **men’s Arabian studio plate** (validate like `men_arabian_02`). Audit arabian slots `01`, `03`, `04` for gender/scene. Optional: adopt **identity-first targeted prompt** for full-outfit regional tabs after asset fix. |
| **women_indian_01** | **Replace asset** with female indian plate (e.g. align with `women_indian_02` quality). Adopt **strong replacement prompt** variant for weak transfers after asset fix. Audit all `women_indian_*` vs `men_indian_*` for duplicate/wrong files. |

**Prompt-only fixes:** Help **identity/background** (`men_arabian_01` B) and **replacement strength** (`women_indian_01` B). **Do not fix** `couple_01` people-count failure.

---

## 5. Generated files (investigation artifacts)

| Path | Purpose |
|------|---------|
| `PHASE2_VISUAL_FAILURE_ANALYSIS.md` | This document |
| `artifacts/phase2-visual-failure-ab-family.mjs` | Runner (non-production) |
| `artifacts/phase2-visual-failure-tests/run-results.json` | BFL job summary |
| `artifacts/phase2-visual-failure-tests/ab/{style}/A_current/` | Prompt A + copied smoke result |
| `artifacts/phase2-visual-failure-tests/ab/{style}/B_targeted/` | Targeted prompt B + result + `bfl-request-meta.json` |
| `artifacts/phase2-visual-failure-tests/family/{style_id}/` | Family smokes (current Phase 2 prompt) |
| `artifacts/full-outfit-phase2-smoke-test/{style_id}/` | Original A baselines |

**BFL request shape (all runs):** `POST {BFL_API_BASE}/v1/flux-tools/vto-v2` with JSON `{ prompt, person: data:image/jpeg;base64,..., garment: data:image/png;base64,..., output_format: "jpeg" }` — matches `src/app/api/v1/try-on/generate/route.ts` VTO branch.
