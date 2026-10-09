# Phase 2.3 asset repair plan

**Generated:** 2026-10-06T12:57:38.136Z  
**Source:** `artifacts/phase2-asset-qa-visual.json`  
**No catalog PNG overwrites yet. No prompt/deploy changes.**

---

## Manifest totals

| Metric | Count |
|--------|------:|
| Total styles | 258 |
| KEEP (GOOD) | 13 |
| MANUAL_REVIEW | 103 |
| REPLACE | 131 |
| SPLIT_COUPLE_REFERENCE | 11 |

---

## Priority (non-KEEP)

| Priority | Count |
|----------|------:|
| P0 | 138 |
| P1 | 51 |
| P2 | 56 |

---

## Cross-gender duplicates

- Duplicate SHA256 groups in catalog: **102**
- Cross-gender repair groups: **101**
- Wrong-gender style slots marked REPLACE: **114**

See `artifacts/phase2-cross-gender-repair-map.json`.

---

## Couple duo split (proposal)

11 styles → 22 single-subject targets (`*_male.png`, `*_female.png`).  
Map: `artifacts/couple-duo-split-map.json`

---

## Replacement queue by bucket

| Bucket | Queue items |
|--------|------------:|
| arabian | 23 |
| casual | 10 |
| chinese | 14 |
| couple_duo | 22 |
| formal | 10 |
| indian | 15 |
| korean | 13 |
| outfit_change | 7 |
| pakistani | 24 |
| virtual_try_on | 15 |
| **Total queue items** | **153** |

---

## Replacement asset contract

- correct gender
- correct outfit category/tab
- one person only
- no extra people
- no text/watermark
- plain or minimal background preferred
- outfit unobstructed
- no large props or animals
- no dramatic environment
- prefer standing, front or mild 3/4, full outfit visible

---

## Reuse scan (local)

- Candidate files found: **0**
- Still missing / must source: **22**

Details: `artifacts/phase2-reuse-candidates.json`

---

## Artifacts

| File |
|------|
| `artifacts/phase2-asset-repair-manifest.json` |
| `artifacts/phase2-cross-gender-repair-map.json` |
| `artifacts/couple-duo-split-map.json` |
| `artifacts/phase2-replacement-queue.json` |
| `artifacts/phase2-reuse-candidates.json` |
| `artifacts/validate-phase2-assets-after-repair.mjs` |
