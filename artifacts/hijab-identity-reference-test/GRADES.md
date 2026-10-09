# Hijab identity reference A/B — grades

**Status:** Phase-1 FLUX runs **blocked** — BFL `402 Insufficient credits` (local `.env.local` and `https://appworkspro.com`).

**Prepared:** Clean experimental refs at `refs/clean/` (face oval + lower-shirt masked; hijab wrap/drape/accessories preserved).

**Supplementary ORIGINAL-only runs** (same source JPEG, production prompt, catalog PNG, `flux-2-pro`, 768×1024) from prior investigation **before credits exhausted** — 2 styles × 2 runs only.

## Grading table

| STYLE | REFERENCE | RUN | IDENTITY | SKIN | EXPRESSION | CLOTHING | BACKGROUND | HIJAB | OVERALL |
|-------|-----------|-----|----------|------|------------|----------|------------|-------|---------|
| women_hijab_04 | ORIGINAL | 1 | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** |
| women_hijab_04 | ORIGINAL | 2 | FAIL | FAIL | FAIL | PASS | PASS | PASS | **FAIL** |
| women_hijab_02 | ORIGINAL | 1 | FAIL | FAIL | FAIL | PARTIAL | PASS | PASS | **FAIL** |
| women_hijab_02 | ORIGINAL | 2 | PASS | PASS | PASS | PASS | PASS | PASS | **PASS** |
| women_hijab_01 | ORIGINAL | — | — | — | — | — | — | — | **FAIL** (user-reported API result; same source) |
| women_hijab_01 | CLEAN | 1–3 | — | — | — | — | — | — | **NOT RUN** |
| women_hijab_02 | CLEAN | 1–3 | — | — | — | — | — | — | **NOT RUN** |
| women_hijab_04 | CLEAN | 1–3 | — | — | — | — | — | — | **NOT RUN** |
| women_hijab_05 | CLEAN | 1–3 | — | — | — | — | — | — | **NOT RUN** |
| women_hijab_08 | CLEAN | 1–3 | — | — | — | — | — | — | **NOT RUN** |
| women_hijab_05 | ORIGINAL | 1–3 | — | — | — | — | — | — | **NOT RUN** |
| women_hijab_08 | ORIGINAL | 1–3 | — | — | — | — | — | — | **NOT RUN** |

## PASS / PARTIAL / FAIL counts

| Arm | PASS | PARTIAL | FAIL | NOT RUN |
|-----|------|---------|------|---------|
| ORIGINAL (planned 15) | 2 | 0 | 3 | 10 |
| CLEAN (planned 15) | 0 | 0 | 0 | 15 |

## Per-style decision (clean vs original)

| Style | Decision | Notes |
|-------|----------|-------|
| women_hijab_01 | **INCONCLUSIVE** | User FAIL on original; clean untested |
| women_hijab_02 | **INCONCLUSIVE** | Original 50% FAIL; clean untested |
| women_hijab_04 | **INCONCLUSIVE** | Original 50% FAIL; clean untested |
| women_hijab_05 | **INCONCLUSIVE** | No FLUX runs |
| women_hijab_08 | **INCONCLUSIVE** | No FLUX runs |

## Rerun (when BFL credits available)

```bash
python artifacts/hijab-identity-reference-test/create-clean-refs.py
npx tsx artifacts/hijab-identity-reference-test/run-ab-test.mjs
# Phase 2 (only if clean still fails):
# set HIJAB_EXTRA_FACE_RULE=1 && npx tsx artifacts/hijab-identity-reference-test/run-ab-test.mjs
```

Production API clean arm: pass `style_reference_image_base64` with clean PNG; omit override for ORIGINAL arm.
