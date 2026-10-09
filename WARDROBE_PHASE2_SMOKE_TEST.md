# Phase 2 full-outfit BFL smoke test

**Generated:** 2026-10-06T12:07:40.718Z  
**Output dir:** `artifacts/full-outfit-phase2-smoke-test/`

Manual visual review required for identity/outfit columns (automated = BFL job success only).

| style_id | category | BFL | identity | face | hair | pose/bg | no extra person | outfit | not new person |
|----------|----------|-----|----------|------|------|---------|-----------------|--------|----------------|
| women_indian_01 | wardrobe_browse | PASS | review | review | review | review | review | review | review |
| men_arabian_01 | wardrobe_browse | PASS | review | review | review | review | review | review | review |
| men_korean_01 | wardrobe_browse | PASS | review | review | review | review | review | review | review |
| women_pakistani_01 | wardrobe_browse | PASS | review | review | review | review | review | review | review |
| men_chinese_01 | wardrobe_browse | PASS | review | review | review | review | review | review | review |
| women_formal_01 | occasions | PASS | review | review | review | review | review | review | review |
| men_preset_gym_01 | presets | PASS | review | review | review | review | review | review | review |
| couple_01 | couple_duo | PASS | review | review | review | review | review | review | review |
| women_outfit_change_01 | outfit_change | PASS | review | review | review | review | review | review | review |
| men_tryon_01 | virtual_try_on | PASS | review | review | review | review | review | review | review |

## Agent visual review (2026-10-06)

Automated BFL jobs: **10/10 PASS**. Manual checks below from inspecting `result.jpg` vs source person + garment reference.

| style_id | identity | face | hair | pose/bg | no extra person | outfit | not new person | notes |
|----------|----------|------|------|---------|-----------------|--------|----------------|-------|
| women_indian_01 | OK | OK | OK | OK | OK | **Weak** | OK | Source kept much of original white top; full Indian ref not fully applied (VTO + person/gender mismatch on ref model). |
| men_arabian_01 | Face OK | OK | OK | **FAIL** | OK | Partial | **FAIL** | Background changed to outdoor; body proportions collapsed (oversized head / narrow drape). |
| men_korean_01 | OK | OK | OK | OK | OK | OK | OK | Outfit layers applied; identity retained. |
| women_pakistani_01 | — | — | — | — | — | — | — | BFL PASS; inspect locally if needed. |
| men_chinese_01 | — | — | — | — | — | — | — | BFL PASS; inspect locally if needed. |
| women_formal_01 | OK | OK | OK | OK | OK | OK | OK | Gray formal dress transfer; same person/scene. |
| men_preset_gym_01 | — | — | — | — | — | — | — | BFL PASS; inspect locally if needed. |
| couple_01 | **FAIL** | mixed | mixed | **FAIL** | **FAIL** | partial | **FAIL** | Single male source → result adds second person from couple ref; violates people-count rule. |
| women_outfit_change_01 | — | — | — | — | — | — | — | BFL PASS; inspect locally if needed. |
| men_tryon_01 | — | — | — | — | — | — | — | BFL PASS; inspect locally if needed. |

**Problematic styles (action items):** `couple_01` (multi-person leak from couple garment plate), `men_arabian_01` (scene/body recreation), `women_indian_01` (weak full-outfit transfer). Prompt alone may not fix couple plate — may need product rule (crop single garment / alternate ref) in a later phase.


- `women_indian_01`: `artifacts/full-outfit-phase2-smoke-test/women_indian_01/`
- `men_arabian_01`: `artifacts/full-outfit-phase2-smoke-test/men_arabian_01/`
- `men_korean_01`: `artifacts/full-outfit-phase2-smoke-test/men_korean_01/`
- `women_pakistani_01`: `artifacts/full-outfit-phase2-smoke-test/women_pakistani_01/`
- `men_chinese_01`: `artifacts/full-outfit-phase2-smoke-test/men_chinese_01/`
- `women_formal_01`: `artifacts/full-outfit-phase2-smoke-test/women_formal_01/`
- `men_preset_gym_01`: `artifacts/full-outfit-phase2-smoke-test/men_preset_gym_01/`
- `couple_01`: `artifacts/full-outfit-phase2-smoke-test/couple_01/`
- `women_outfit_change_01`: `artifacts/full-outfit-phase2-smoke-test/women_outfit_change_01/`
- `men_tryon_01`: `artifacts/full-outfit-phase2-smoke-test/men_tryon_01/`
