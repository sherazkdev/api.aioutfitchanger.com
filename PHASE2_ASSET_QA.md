# Phase 2.2 full-outfit reference asset QA

**Generated:** 2026-10-06T12:50:14.181Z  
**Scope:** 258 Phase 2 VTO styles — visual + catalog cross-check.  
**No catalog or production changes.**

---

## Summary

| Status | Count |
|--------|------:|
| GOOD | 13 |
| REVIEW | 103 |
| BAD | 142 |
| **Total** | **258** |

---

## By bucket

| Bucket | GOOD | REVIEW | BAD | Total |
|--------|-----:|-------:|----:|------:|
| arabian | 1 | 10 | 23 | 34 |
| casual | 1 | 9 | 10 | 20 |
| chinese | 1 | 13 | 14 | 28 |
| couple_duo | 0 | 0 | 11 | 11 |
| formal | 0 | 10 | 10 | 20 |
| indian | 0 | 15 | 15 | 30 |
| korean | 0 | 13 | 13 | 26 |
| outfit_change | 0 | 6 | 7 | 13 |
| pakistani | 0 | 12 | 24 | 36 |
| presets | 10 | 0 | 0 | 10 |
| virtual_try_on | 0 | 5 | 15 | 20 |
| wedding | 0 | 10 | 0 | 10 |

---

## Cross-gender duplicate finding

**101** style pairs/groups share the exact same PNG between `men_*` and `women_*` slots (102 duplicate groups total in catalog).  
**73** of those groups are regional wardrobe (`arabian`, `indian`, `pakistani`, `chinese`, `korean`).  
For each shared file, **at most one gender slot can be GOOD**; the other is **BAD** unless the image is truly unisex (rare).

See `artifacts/phase2-asset-qa-index.json` → `duplicateGroups`.

---

## couple_duo (separate audit)

All `couple_01`–`couple_11` references are **full couple photographs** (2 people, linked poses).  
**None are safe** when image 1 contains a single person — VTO copies the second person.  
**Recommendation:** split male/female outfit plates or flat-lay; never use two-person photo as `garment` for solo try-on.

| style_id | People | Safe for 1-person image 1? | Status |
|----------|-------:|:--------------------------:|--------|
| couple_01 | 2 | No | BAD |
| couple_02 | 2 | No | BAD |
| couple_03 | 2 | No | BAD |
| couple_04 | 2 | No | BAD |
| couple_05 | 2 | No | BAD |
| couple_06 | 2 | No | BAD |
| couple_07 | 2 | No | BAD |
| couple_08 | 2 | No | BAD |
| couple_09 | 2 | No | BAD |
| couple_10 | 2 | No | BAD |
| couple_11 | 2 | No | BAD |

---

## BAD and REVIEW styles

| style_id | category/tab | gender | people | problem | recommended fix |
|----------|--------------|--------|-------:|---------|-----------------|
| couple_01 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_02 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_03 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo (same PNG as couple_08) | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_04 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_05 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_06 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_07 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_08 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo (same PNG as couple_08) | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_09 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_10 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| couple_11 | couple_duo/— | — | 2 | Two-person couple photo; VTO copies extra person when image 1 is solo | Split male/female single-subject outfit plates; never use couple photo as garment |
| men_arabian_01 | wardrobe_browse/arabian | men | 1 | Female model in hijab dress; outdoor park; wrong for men_arabian slot |  |
| men_arabian_03 | wardrobe_browse/arabian | men | 1 | Female model; ornate mask; outdoor desert |  |
| men_arabian_04 | wardrobe_browse/arabian | men | 1 | Female abaya; camels in background leak into VTO |  |
| men_arabian_05 | wardrobe_browse/arabian | men | 1 | Female abaya; ornate door/architecture background |  |
| men_arabian_06 | wardrobe_browse/arabian | men | 1 | Busy restaurant interior; strong scene contamination |  |
| men_arabian_07 | wardrobe_browse/arabian | men | 1 | Outdoor palm setting; low angle pose |  |
| men_arabian_08 | wardrobe_browse/arabian | men | 1 | Seated pose; props; otherwise clear abaya |  |
| men_arabian_09 | wardrobe_browse/arabian | men | 1 | Same PNG as men/women_arabian_10; female abaya; architectural BG |  |
| men_arabian_10 | wardrobe_browse/arabian | men | 1 | Same PNG as men/women_arabian_10; female abaya; architectural BG |  |
| men_arabian_12 | wardrobe_browse/arabian | men | 1 | Visually audited batch: typically female modest studio/outdoor mix |  |
| men_arabian_13 | wardrobe_browse/arabian | men | 1 | Female model; environmental background |  |
| men_arabian_14 | wardrobe_browse/arabian | men | 1 | Female model; shared men/women PNG |  |
| men_arabian_15 | wardrobe_browse/arabian | men | 1 | Female model; lifestyle background |  |
| men_arabian_16 | wardrobe_browse/arabian | men | 1 | Female model; cross-gender duplicate |  |
| men_arabian_17 | wardrobe_browse/arabian | men | 1 | Female model; cross-gender duplicate |  |
| men_casual_01 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_02 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_03 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_04 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_05 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_06 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_07 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_08 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_09 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_casual_10 | occasions/casual | men | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| men_chinese_01 | wardrobe_browse/chinese | men | 1 | Female Chinese formal; clean white studio; men slot wrong gender |  |
| men_chinese_02 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_03 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_04 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_05 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_06 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_07 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_08 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_09 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_10 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_11 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_12 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_13 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_chinese_14 | wardrobe_browse/chinese | men | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| men_formal_01 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_02 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_03 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_04 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_05 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_06 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_07 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_08 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_09 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_formal_10 | occasions/formal | men | 1 | Shared men/women formal PNG; female model occasion wear |  |
| men_indian_02 | wardrobe_browse/indian | men | 1 | Female saree-style; indoor styled set; clothing clear |  |
| men_indian_04 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_06 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_08 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_10 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_12 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_14 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_korean_01 | wardrobe_browse/korean | men | 1 | Female hanfu-style; outdoor foliage background; men slot wrong gender |  |
| men_korean_02 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_03 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_04 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_05 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_06 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_07 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_08 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_09 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_10 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_11 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_12 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_korean_13 | wardrobe_browse/korean | men | 1 | Shared men/women korean PNG; female model plates |  |
| men_pakistani_01 | wardrobe_browse/pakistani | men | 1 | Female kameez; outdoor bush/wall; men slot wrong gender |  |
| men_pakistani_02 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_03 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_04 | wardrobe_browse/pakistani | men | 1 | Same PNG as men_pakistani_05 and women pakistani 04/05 |  |
| men_pakistani_05 | wardrobe_browse/pakistani | men | 1 | Same PNG as men_pakistani_05 and women pakistani 04/05 |  |
| men_pakistani_06 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_07 | wardrobe_browse/pakistani | men | 1 | Same PNG as men_pakistani_08 / women 07/08 slots |  |
| men_pakistani_08 | wardrobe_browse/pakistani | men | 1 | Same PNG as men_pakistani_08 / women 07/08 slots |  |
| men_pakistani_09 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_10 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_11 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_12 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_13 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_14 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_15 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_pakistani_16 | wardrobe_browse/pakistani | men | 1 | Same PNG as men_pakistani_17 / women 16/17 |  |
| men_pakistani_17 | wardrobe_browse/pakistani | men | 1 | Same PNG as men_pakistani_17 / women 16/17 |  |
| men_pakistani_18 | wardrobe_browse/pakistani | men | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| men_tryon_01 | virtual_try_on/— | men | 1 | Same PNG as women_tryon_02 — cross-style-id duplicate |  |
| men_tryon_02 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| men_tryon_03 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| men_tryon_04 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| men_tryon_05 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_arabian_01 | wardrobe_browse/arabian | women | 1 | Female model in hijab dress; outdoor park; wrong for men_arabian slot |  |
| women_arabian_02 | wardrobe_browse/arabian | women | 1 | Clean male thobe/bisht studio plate |  |
| women_arabian_03 | wardrobe_browse/arabian | women | 1 | Female model; ornate mask; outdoor desert |  |
| women_arabian_04 | wardrobe_browse/arabian | women | 1 | Female abaya; camels in background leak into VTO |  |
| women_arabian_06 | wardrobe_browse/arabian | women | 1 | Busy restaurant interior; strong scene contamination |  |
| women_arabian_09 | wardrobe_browse/arabian | women | 1 | Same PNG as men/women_arabian_10; female abaya; architectural BG |  |
| women_arabian_10 | wardrobe_browse/arabian | women | 1 | Same PNG as men/women_arabian_10; female abaya; architectural BG |  |
| women_arabian_11 | wardrobe_browse/arabian | women | 1 | Male thobe correct but camel and night outdoor scene |  |
| women_indian_01 | wardrobe_browse/indian | women | 1 | Male sherwani/turban; outdoor field background |  |
| women_indian_03 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_05 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_07 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_09 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_11 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_13 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_15 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_outfit_change_01 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_02 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_03 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_04 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_05 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_06 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_07 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_pakistani_04 | wardrobe_browse/pakistani | women | 1 | Same PNG as men_pakistani_05 and women pakistani 04/05 |  |
| women_pakistani_05 | wardrobe_browse/pakistani | women | 1 | Same PNG as men_pakistani_05 and women pakistani 04/05 |  |
| women_pakistani_07 | wardrobe_browse/pakistani | women | 1 | Same PNG as men_pakistani_08 / women 07/08 slots |  |
| women_pakistani_08 | wardrobe_browse/pakistani | women | 1 | Same PNG as men_pakistani_08 / women 07/08 slots |  |
| women_pakistani_16 | wardrobe_browse/pakistani | women | 1 | Same PNG as men_pakistani_17 / women 16/17 |  |
| women_pakistani_17 | wardrobe_browse/pakistani | women | 1 | Same PNG as men_pakistani_17 / women 16/17 |  |
| women_tryon_01 | virtual_try_on/— | women | 1 | Same PNG as women_tryon_02 — cross-style-id duplicate |  |
| women_tryon_02 | virtual_try_on/— | women | 1 | Same PNG as women_tryon_02 — cross-style-id duplicate |  |
| women_tryon_03 | virtual_try_on/— | women | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_tryon_04 | virtual_try_on/— | women | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_tryon_05 | virtual_try_on/— | women | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_tryon_06 | virtual_try_on/— | women | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_tryon_07 | virtual_try_on/— | women | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_tryon_08 | virtual_try_on/— | women | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_tryon_09 | virtual_try_on/— | women | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_tryon_10 | virtual_try_on/— | women | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| men_arabian_11 | wardrobe_browse/arabian | men | 1 | Male thobe correct but camel and night outdoor scene |  |
| men_indian_01 | wardrobe_browse/indian | men | 1 | Male sherwani/turban; outdoor field background |  |
| men_indian_03 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_05 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_07 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_09 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_11 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_13 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_indian_15 | wardrobe_browse/indian | men | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| men_outfit_change_01 | outfit_change/— | men | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| men_outfit_change_02 | outfit_change/— | men | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| men_tryon_06 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| men_tryon_07 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| men_tryon_08 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| men_tryon_09 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| men_tryon_10 | virtual_try_on/— | men | 1 | virtual_try_on refs share PNGs across men/women style_ids; full-body on-model |  |
| women_arabian_05 | wardrobe_browse/arabian | women | 1 | Female abaya; ornate door/architecture background |  |
| women_arabian_07 | wardrobe_browse/arabian | women | 1 | Outdoor palm setting; low angle pose |  |
| women_arabian_08 | wardrobe_browse/arabian | women | 1 | Seated pose; props; otherwise clear abaya |  |
| women_arabian_12 | wardrobe_browse/arabian | women | 1 | Visually audited batch: typically female modest studio/outdoor mix |  |
| women_arabian_13 | wardrobe_browse/arabian | women | 1 | Female model; environmental background |  |
| women_arabian_14 | wardrobe_browse/arabian | women | 1 | Female model; shared men/women PNG |  |
| women_arabian_15 | wardrobe_browse/arabian | women | 1 | Female model; lifestyle background |  |
| women_arabian_16 | wardrobe_browse/arabian | women | 1 | Female model; cross-gender duplicate |  |
| women_arabian_17 | wardrobe_browse/arabian | women | 1 | Female model; cross-gender duplicate |  |
| women_casual_02 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_casual_03 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_casual_04 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_casual_05 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_casual_06 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_casual_07 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_casual_08 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_casual_09 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_casual_10 | occasions/casual | women | 1 | Same PNG as women_casual_*; female model in modest/casual dress (men slot wrong gender) |  |
| women_chinese_02 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_03 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_04 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_05 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_06 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_07 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_08 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_09 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_10 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_11 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_12 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_13 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_chinese_14 | wardrobe_browse/chinese | women | 1 | Shared men/women chinese PNG; female qipao/cheongsam-style plates |  |
| women_formal_01 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_02 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_03 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_04 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_05 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_06 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_07 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_08 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_09 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_formal_10 | occasions/formal | women | 1 | Shared men/women formal PNG; female model occasion wear |  |
| women_indian_02 | wardrobe_browse/indian | women | 1 | Female saree-style; indoor styled set; clothing clear |  |
| women_indian_04 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_06 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_08 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_10 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_12 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_indian_14 | wardrobe_browse/indian | women | 1 | Shared men/women PNG; regional on-model photo; verify gender per visible model |  |
| women_korean_01 | wardrobe_browse/korean | women | 1 | Female hanfu-style; outdoor foliage background; men slot wrong gender |  |
| women_korean_02 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_03 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_04 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_05 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_06 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_07 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_08 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_09 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_10 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_11 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_12 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_korean_13 | wardrobe_browse/korean | women | 1 | Shared men/women korean PNG; female model plates |  |
| women_outfit_change_08 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_09 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_10 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_outfit_change_11 | outfit_change/— | women | 1 | Shared men/women outfit_change PNG where paired; verify visible gender |  |
| women_pakistani_01 | wardrobe_browse/pakistani | women | 1 | Female kameez; outdoor bush/wall; men slot wrong gender |  |
| women_pakistani_02 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_03 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_06 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_09 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_10 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_11 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_12 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_13 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_14 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_15 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_pakistani_18 | wardrobe_browse/pakistani | women | 1 | Cross-gender duplicate PNG; predominantly female on-model regional plates in catalog |  |
| women_wedding_01 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_02 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_03 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_04 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_05 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_06 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_07 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_08 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_09 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |
| women_wedding_10 | occasions/wedding | women | 1 | Shared men/women wedding PNG; female model festive wear |  |

---

## Priority replacements (fix first)

1. **All `couple_duo` (11)** — split references; remove two-person garment plates.  
2. **Confirmed wrong-gender regional slots** — e.g. `men_arabian_01` / `women_indian_01` shared files where visible model ≠ catalog gender.  
3. **Outdoor/lifestyle regional plates** — replace with studio/plain-background same-gender plates.  
4. **Occasions / outfit_change / virtual_try_on** — stop sharing one PNG across `men_*` and `women_*`; replace with gender-matched assets.  
5. **Mislabeled duplicate slots** — `men_arabian_09`=`men_arabian_10`, pakistani 04/05, 07/08, 16/17, try-on cross-refs.

---

## Artifacts

| File | Purpose |
|------|---------|
| `PHASE2_ASSET_QA.md` | This report |
| `artifacts/phase2-asset-qa-index.json` | 258 rows + SHA256 duplicate groups |
| `artifacts/phase2-asset-qa-hash-assessments.json` | Per-file visual assessment (148 unique hashes) |
| `artifacts/phase2-asset-qa-results.json` | Machine-readable 258 outcomes |
| `artifacts/phase2-asset-qa-visual.json` | **258** per-`style_id` QA records (people count, scene, props, status, fix) |
| `artifacts/generate-phase2-visual-json.mjs` | Regenerate visual JSON from hash assessments + index (`node artifacts/generate-phase2-visual-json.mjs`) |

