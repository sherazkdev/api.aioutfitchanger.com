# Phase 2.4 P0 bulk execution

**Remaining P0 (queue):** 0 / 149  
**Bulk run:** 93 replacements this session (`artifacts/phase2-p0-bulk-run.log`); 0 failures; not stopped.  
**Partial gate (pre-bulk):** `couple_01_male`, `women_indian_01` — asset QA PASS, VTO smoke PASS (`artifacts/phase2-partial-fix-smoke/`).  
**Deploy:** none.

## Family smokes (representative BFL VTO)

| Family | style_id | BFL |
|--------|----------|-----|
| couple_duo | couple_02 (male split) | PASS |
| arabian | men_arabian_03 | PASS |
| indian | women_indian_02 | PASS |
| pakistani | men_pakistani_02 | PASS |
| chinese | men_chinese_02 | PASS |
| korean | men_korean_02 | PASS |
| casual | men_casual_02 | PASS |
| formal | men_formal_02 | PASS |
| virtual_try_on | men_tryon_02 | PASS |
| outfit_change | men_outfit_change_02 | PASS |

## Validator (`npx tsx artifacts/validate-phase2-assets-after-repair.mjs`)

Still **fails** with 15 `bad_hash_still_present` entries: legacy **combined** `couple_01`–`couple_11` PNGs (routing unchanged; split `_male`/`_female` assets are replaced) and **P1** `men_tryon_02`–`men_tryon_05` (not in P0 pending list).
