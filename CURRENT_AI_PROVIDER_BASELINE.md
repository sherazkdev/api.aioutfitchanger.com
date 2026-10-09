# Current AI provider baseline (pre–BytePlus evaluation)

Captured from repository code at checkpoint time. **No secret values** — environment variable names only.

## Summary

| Feature | Provider | Model / endpoint ID | Primary files | ENV |
| --- | --- | --- | --- | --- |
| Beauty / localized try-on (beard, hair_color, hair_style, hijab) | BFL (Black Forest Labs) | `flux-2-pro` → `POST /v1/flux-2-pro` | `src/lib/server/bfl.ts`, `src/app/api/v1/try-on/generate/route.ts`, `src/lib/server/bfl/tryOnEngine.ts` | `BFL_API_KEY`, `BFL_API_BASE` |
| Outfit / wardrobe / couple / presets try-on | BFL | Virtual Try-On v2 → `POST /v1/flux-tools/vto-v2` | Same as above + prompt builders under `src/lib/server/bfl/` | `BFL_API_KEY`, `BFL_API_BASE` |
| Try-on job completion polling | BFL | Uses BFL `polling_url` or `GET /v1/get_result?id=` | `src/lib/server/bfl.ts`, `src/app/api/v1/try-on/jobs/[jobId]/route.ts` | `BFL_API_KEY`, `BFL_POLL_MIN_INTERVAL_MS` |
| CMS string localization (optional) | Self-hosted [LibreTranslate](https://libretranslate.com/) | No model ID in code; `POST {LIBRETRANSLATE_URL}/translate` | `src/lib/server/i18n/translate.ts`, `src/app/api/v1/admin/localization/backfill/route.ts` | `LIBRETRANSLATE_URL` |
| Password reset email | Resend | Resend Email API (not image generation) | `src/lib/server/emails/email.service.ts`, `src/app/api/v1/auth/forgot-password/route.ts` | `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_FROM_NAME`, `RESET_PASSWORD_URL` |
| Push notifications | Firebase Admin (FCM) | N/A | `src/lib/server/fcm.ts` | `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` |

**Groq:** No references in `src/` or production scripts. **Not used** in this backend.

**BytePlus:** Not integrated in this checkpoint.

---

## BFL — FLUX-2 Pro (`flux-2-pro`)

### Purpose

Localized photorealistic edits: beard, hair color, hair style, hijab, and any catalog `COMMAND:` where `region` is not `outfit`. Also used when outfit categories are not selected and VTO routing is false.

### Routing (`shouldUseVtoEngine` = false)

- `promptCommand` starts with `COMMAND:` and `parseStyleCommand().region !== "outfit"`.
- `category_id` is not in: `virtual_try_on`, `outfit_change`, `wardrobe_browse`, `occasions`, `couple_duo`, `presets`.

### Request (production)

From `src/app/api/v1/try-on/generate/route.ts`:

| Parameter | Value |
| --- | --- |
| `prompt` | `buildFluxEditPrompt(catalogCommand, hasReferenceStyle)` |
| `input_image` | Person image as data URL |
| `input_image_2` | Optional catalog/reference garment (data URL) when resolved |
| `width` | `body.width ?? 768` |
| `height` | `body.height ?? 1024` |
| `disable_pup` | `true` |

### HTTP

- **Base URL:** `BFL_API_BASE` (default `https://api.bfl.ai`)
- **Path:** `/v1/flux-2-pro`
- **Auth header:** `x-key: BFL_API_KEY`
- **Client:** `bflStartGeneration()` in `src/lib/server/bfl.ts`

### Response handling

- Start: `{ id, polling_url, status? }`
- Poll: `bflPollResult(polling_url)` → `result.sample` URL when status maps to `completed` (`mapBflStatus`)
- Errors: thrown as `BFL_GENERATE_FAILED:status:body` or `BFL_POLL_FAILED`; job marked `failed`, API returns `502 TRY_ON_FAILED` or validation errors

### Fallback

- If garment cannot be resolved for FLUX path, generation may proceed **text-only** (no `input_image_2`) — see `generate/route.ts` catch on `resolveGarmentImage`.
- No alternate image provider; missing `BFL_API_KEY` → `503 SERVER_CONFIG`.

---

## BFL — Virtual Try-On v2 (`vto-v2`)

### Purpose

Full-garment virtual try-on with identity/pose preservation for outfit pipelines (Phase 1 wardrobe single-garment, Phase 2 full outfit, couple duo split plates).

### Routing (`shouldUseVtoEngine` = true)

- `COMMAND:` with `region=outfit`, **or**
- `category_id` ∈ `virtual_try_on`, `outfit_change`, `wardrobe_browse`, `occasions`, `couple_duo`, `presets`.

### Prompt selection

1. Phase 1 wardrobe: `shouldUseWardrobePhase1VtoPrompt` → `buildWardrobePhase1VtoPrompt`
2. Phase 2 full outfit: `shouldUseFullOutfitPhase2VtoPrompt` → `buildFullOutfitPhase2VtoPrompt`
3. Else: default short VTO string in `buildVtoPrompt`

### Request (production)

| Parameter | Value |
| --- | --- |
| `prompt` | From `buildVtoPrompt(...)` |
| `person` | Person data URL |
| `garment` | Resolved catalog garment data URL (`resolveGarmentImage`, couple gender routing) |
| `output_format` | `"jpeg"` |

### HTTP

- **Path:** `/v1/flux-tools/vto-v2`
- **Client:** `bflStartVtoV2()` in `src/lib/server/bfl.ts`

### Response handling

Same polling pipeline as FLUX (`TryOnJob.pollingUrl`, `jobs/[jobId]` GET).

### Fallback

- `COUPLE_PERSON_GENDER_REQUIRED` → `422`
- `GARMENT_NOT_FOUND` / `GARMENT_FILE_MISSING` → `422`
- No non-BFL VTO fallback

---

## Poll throttling

- **File:** `src/lib/server/tryOn/pollThrottle.ts`
- **ENV:** `BFL_POLL_MIN_INTERVAL_MS` (default **1500** ms per job id)
- Skips upstream BFL poll when clients poll too fast; returns last known job state

---

## LibreTranslate (optional, non–try-on)

- **Model ID:** none in repo (LibreTranslate instance default)
- **Endpoint:** `{LIBRETRANSLATE_URL}/translate` JSON `{ q, source, target, format: "text" }`
- **Fallback:** If `LIBRETRANSLATE_URL` unset or request fails, returns **source text** unchanged (`translate.ts`)

---

## Local / investigation scripts (same BFL models)

These call BFL directly (not via Next API) for QA; same model IDs:

| Script | Engine |
| --- | --- |
| `scripts/prompt-bfl-local-test.mjs` | `flux-2-pro` |
| `scripts/try-on-audit.mjs` | `flux-2-pro` + `vto-v2` |
| `scripts/ai-module-audit.mjs` | both |
| `artifacts/hijab-identity-reference-test/run-ab-test.mjs` | `flux-2-pro` |
| `artifacts/phase3-beauty-flux-smoke.mjs` | `flux-2-pro` |
| `artifacts/validate-phase1-smoke-bfl.mjs`, `validate-phase2-smoke-bfl.mjs` | `vto-v2` |

---

## Files controlling provider / model selection

| File | Role |
| --- | --- |
| `src/lib/server/bfl.ts` | Engine enum, endpoints, HTTP to BFL |
| `src/lib/server/bfl/tryOnEngine.ts` | VTO vs FLUX routing and prompt wrappers |
| `src/lib/server/bfl/promptBuilder.ts` | FLUX prompt expansion from `COMMAND:` |
| `src/lib/server/bfl/wardrobePhase1VtoPrompt.ts` | Phase 1 VTO prompts |
| `src/lib/server/bfl/fullOutfitPhase2VtoPrompt.ts` | Phase 2 VTO prompts |
| `src/lib/server/bfl/resolveGarmentImage.ts` | Garment plate resolution |
| `src/lib/server/bfl/coupleDuoGarmentRouting.ts` | Couple duo garment paths |
| `src/app/api/v1/try-on/generate/route.ts` | Production entry: starts BFL job |
| `src/app/api/v1/try-on/jobs/[jobId]/route.ts` | Poll + persist result |
| `src/lib/server/env.ts` | `BFL_API_KEY`, `BFL_API_BASE` schema |

---

## OpenAPI note

`src/lib/openapi/mobile-v1-openapi.ts` documents that the server picks **flux-2-pro vs vto-v2**; clients poll `GET /api/v1/try-on/jobs/{jobId}`.

---

*Rollback: restore this commit and ensure `BFL_API_KEY` / `BFL_API_BASE` point at BFL; no BytePlus env vars are required for this baseline.*
