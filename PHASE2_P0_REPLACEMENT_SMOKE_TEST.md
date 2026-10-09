# Phase 2.4 P0 batch 1 — replacement smoke test

**Generated:** 2026-10-06  
**Prompts:** Phase 2 production (frozen). **Deploy:** none. **Routing:** unchanged (`couple_01` still uses combined PNG in prod; smoke used `couple_01_male.png`).

## Replacement asset status (10 targets)

| Target | Status | Source |
|--------|--------|--------|
| `couple_01_male` | REPLACED | Split crop from `couple_01.png` + plain fill |
| `couple_01_female` | REPLACED | Split crop from `couple_01.png` + plain fill |
| `men_arabian_01` | REPLACED | Donor `men_arabian_02` (studio male thobe/bisht) |
| `women_indian_01` | REPLACED | Donor `women_indian_02` (female indian plate) |
| `men_pakistani_01` | REPLACED | Generated studio male shalwar kameez |
| `men_chinese_01` | REPLACED | Generated studio male Chinese-formal |
| `men_korean_01` | REPLACED | Generated studio male Korean casual |
| `men_casual_01` | REPLACED | Generated studio male casual |
| `men_formal_01` | REPLACED | Generated studio male suit |
| `men_tryon_01` | REPLACED | Generated studio male full outfit |

Backups: `artifacts/phase2-original-assets-backup/{couple_duo,wardrobe_browse,occasions,virtual_try_on}/`  
Log: `artifacts/phase2-replacement-log.json`

## BFL smoke (Phase 2 prompt, local new PNGs)

| style_id | Asset QA | Identity | Background | Outfit | Extra people | Result |
|----------|----------|----------|------------|--------|--------------|--------|
| couple_01 (male split ref) | PARTIAL | PASS | PASS | PASS | PASS | PASS |
| men_arabian_01 | PASS | PASS | PASS | PASS | PASS | PASS |
| women_indian_01 | PARTIAL | PASS | PASS | PASS | PASS | PASS |
| men_pakistani_01 | PASS | PASS | PASS | PASS | PASS | PASS |
| men_chinese_01 | PASS | PASS | PASS | PASS | PASS | PASS |
| men_korean_01 | PASS | PASS | PASS | PASS | PASS | PASS |
| men_casual_01 | PASS | PASS | PASS | PASS | PASS | PASS |
| men_formal_01 | PASS | PASS | PASS | PASS | PASS | PASS |
| men_tryon_01 | PASS | PASS | PASS | PASS | PASS | PASS |

**Asset QA notes:** `couple_01_male` crop still shows a sliver of partner fabric on the right edge — needs cleaner isolation before wide P0 couple rollout. `women_indian_01` / `men_arabian_01` reuse slot-02 art (interim; unique slot-01 art still needed).

**BFL API:** 9/9 jobs **PASS**. Artifacts: `artifacts/phase2-p0-batch1-smoke/{style_id}/`.

## Validator

`npx tsx artifacts/validate-phase2-assets-after-repair.mjs` — **fails** until remaining unreplaced BAD hashes are cleared (expected: legacy `couple_02`–`couple_11` combined PNGs, etc.). Batch-1 in-place files **did** change SHA256 (see log).

## Stop rule

Fewer than **2** styles with person recreation / background leakage / extra people / weak transfer on this batch → **do not stop**.

## Continue remaining P0?

**Yes, with conditions:** Gender-correct + studio replacements clearly improve VTO vs pre-repair. Before scaling couple_duo, use **cleaner single-subject exports** (not tight crops with partner bleed). Prefer **unique per-slot** art over copying `_02` into `_01` where catalog requires distinct looks.
