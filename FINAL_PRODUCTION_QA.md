# Final production readiness QA (Phase 4)

**Date:** 2026-10-07  
**Deploy:** not performed  
**Artifacts:** `artifacts/phase4-production-qa.json`, `artifacts/phase4-e2e-smoke/`

---

## 1. Regression summary

| Check | Expected | Result |
|--------|----------|--------|
| `npm run build` | PASS | **PASS** |
| Phase 1 (`test:wardrobe-phase1`) | 105 styles | **PASS** (11 tests) |
| Phase 2 (`test:full-outfit-phase2`) | 258 + 105 + 56 = 419 | **PASS** (18 tests) |
| Beauty (`test:beauty-flux`) | 56 | **PASS** (4 tests) |
| Couple routing (`test:couple-duo-routing`) | split paths | **PASS** (4 tests) |
| Asset validator (`validate-phase2-assets-after-repair`) | ok, active bad hashes 0 | **PASS** (`ok: true`, 0 errors) |
| 419 prompts (`verify-production-prompts`) | mismatch 0 | **PASS** (419/419) |

---

## 2. End-to-end smoke (`POST /api/v1/try-on/generate`)

**16 representative jobs** via local production server (`next start`, `http://localhost:3000`).  
All **16/16** jobs returned HTTP 200 and completed polling with result images.

| Category | Key | style_id | Overall (visual QA) |
|----------|-----|----------|---------------------|
| Phase 1 top | top | women_tops_01 | PASS |
| Phase 1 shirt | shirt | men_shirts_01 | PASS |
| Phase 1 bottom | bottom | women_bottoms_01 | PASS |
| Phase 1 skirt | skirt | women_skirts_01 | PASS |
| Phase 1 jacket | jacket | men_jackets_01 | PASS |
| Phase 2 Arabian | arabian | men_arabian_03 | PASS |
| Phase 2 Indian | indian | women_indian_02 | PASS |
| Phase 2 Pakistani | pakistani | men_pakistani_02 | PASS |
| Couple male | couple_male | couple_02 + `person_gender=men` | PASS |
| Couple female | couple_female | couple_02 + `person_gender=women` | PASS |
| Beauty hair_style | hair_style | men_hair_styles_02 | PASS |
| Beauty hair_color | hair_color | men_hair_color_03 | PASS |
| Beauty beard | beard | men_beard_03 | PASS |
| Beauty hijab | hijab_02 | women_hijab_02 | PASS |
| Beauty hijab | hijab_05 | women_hijab_05 | PARTIAL |
| Beauty hijab | hijab_08 | women_hijab_08 | PASS |

**Totals:** **15 PASS · 1 PARTIAL · 0 FAIL** (16 API jobs).

Non-hijab smokes: **13/13 PASS** on identity, face, body, pose, background, target transform, no extra people.

---

## 3. Hijab final gate (API, better source photo)

Source: full-length female studio photo (`photo-1517841905240…`).  
Engine: FLUX via try-on API (catalog COMMAND + `buildFluxEditPrompt`).

| style_id | Coverage | Face | Outfit | Pose | Background | Overall |
|----------|----------|------|--------|------|------------|---------|
| women_hijab_02 | Full; hair covered | PASS | PASS (denim/hoodie kept) | PASS | PASS | **PASS** |
| women_hijab_05 | Brown wrap; **hair peek** at neck | PASS | PASS | PASS | PASS | **PARTIAL** |
| women_hijab_08 | Full; embellished wrap | PASS | PASS | PASS | PASS | **PASS** |

**Conclusion:** No reproducible prompt defect. Residual **PARTIAL** on `women_hijab_05` matches **FLUX + reference drape** limitation (visible hair strand). Document as known limitation; no global Beauty prompt change.

---

## 4. Couple routing result

| Check | Result |
|--------|--------|
| `person_gender=men` → `couple_02_male.png` | **PASS** (unit + E2E job OK) |
| `person_gender=women` → `couple_02_female.png` | **PASS** (unit + E2E job OK) |
| `resolveGarmentImage` without gender | **Throws `COUPLE_PERSON_GENDER_REQUIRED`** |
| Combined `couple_XX.png` as VTO garment | **Never selected** (`combined_not_routed: true`) |
| Authenticated user, no `person_gender` | **Falls back** to `User.preferences.styleGenderPreference` (default `women`) — not 422 |

Expected garment paths recorded under `artifacts/phase4-e2e-smoke/couple_*/expected_garment.txt`.

---

## 5. API error-path result

| Case | Status | Envelope | Stack / secrets |
|------|--------|----------|-----------------|
| Missing `source_image_base64` | 422 `VALIDATION` | Clean | No stack |
| Missing `style_id` | 422 `VALIDATION` | Clean | No stack |
| Invalid `style_id` + tiny image | 422 `VALIDATION` | Clean | No stack |
| Malformed JSON body | **500** | Generic | No stack trace in body |
| Couple + tiny image (no `person_gender`) | 422 (image validation before/alongside routing) | Clean | No stack |
| Tiny 1×1 person image | 422 `VALIDATION` | Clean | No stack |

**Note:** Malformed JSON should ideally be **400**; current **500** is a minor hygiene item, not a secret leak.

---

## 6. Known limitations

1. **Hijab FLUX:** Occasional incomplete hair concealment (`women_hijab_05`) and reference-driven styling bleed under strict QA — model/reference limited, not prompt.
2. **Couple gender 422:** Implemented on resolver; authenticated API users almost always have `styleGenderPreference` default `women` — clients should send `person_gender` for explicit control.
3. **Mobile app:** Production Flutter may still call BFL directly (see prior audits); backend readiness ≠ mobile wiring.
4. **Malformed JSON:** Returns 500 instead of 400.

---

## 7. Blockers

**None** for backend catalog + try-on API deploy.  
**Non-blockers:** hijab PARTIAL on select styles; JSON parse status code; mobile client integration.

---

## 8. Final decision

## **READY WITH KNOWN LIMITATIONS**

- All automated regressions green (419/419, validator, build).
- Full cross-pipeline API smokes complete with **0 FAIL**.
- Hijab gate improved vs Phase 3 direct FLUX on 2/3 styles; one **PARTIAL** remains documented.
- **Do not deploy** until product accepts hijab limitation and schedules mobile/API client `person_gender` for couple_duo.
