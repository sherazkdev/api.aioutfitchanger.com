# Cursor prompt — Flutter app (copy-paste to mobile repo)

**Instructions for you (product owner):**  
Open the **Flutter mobile app** project in Cursor (folder with `pubspec.yaml`).  
Create a **new chat**, paste **everything inside the box below**, and send.  
When the agent finishes, copy the **full final report** (sections 1–12) and send it back to the backend team chat.

---

```
You are inside the Flutter AI Outfit Changer mobile app repository.

GOAL
Production backend (https://appworkspro.com/api/v1) gives GOOD try-on results in controlled API tests.
The SAME style on the REAL APP often looks WORSE (identity drift, shirt/pose change, hijab bleed, etc.).

We need EVIDENCE of what the app actually sends — NOT guesses.

DO NOT change backend code.
DO NOT deploy.
You MAY add temporary DEBUG logging in Flutter (kDebugMode only) if needed, but prefer read-only audit first.

REFERENCE — correct backend contract (source of truth)

Base URL: https://appworkspro.com/api/v1

Envelope: { "data": ..., "error": null } or { "data": null, "error": { "code", "message" } }

Auth:
- POST /auth/login → data.access_token
- Header: Authorization: Bearer <access_token>
- POST /auth/refresh on 401 (retry once)

Try-on (production path we want):
1. POST /try-on/generate
   Body (catalog styles):
   {
     "source_image_base64": "data:image/jpeg;base64,...",
     "style_id": "<exact catalog id>",
     "category_id": "<exact category>",
     "person_gender": "men" | "women",  // required for couple_duo; recommended always
     "width": 768,
     "height": 1024
   }
   Do NOT send: mobile-built BFL prompt, bundled reference PNG, BFL API key, engine name.

2. GET /try-on/jobs/{job_id} every ~2–3s until status completed | failed | cancelled
   Use data.result_image_absolute_url for UI.

History (what we saw in logs):
- GET /history?page=&limit=
- Items may have style_id: null if POST /history omitted style_id when saving.

Swagger (after backend deploy): https://appworkspro.com/api-docs
OpenAPI: https://appworkspro.com/api/v1/openapi

YOUR TASKS

STEP 1 — Map the REAL production generation chain
Find actual files/classes (names may differ from audit):
- Try-on screen entry
- tryOnProvider (or equivalent)
- TryOnRepository interface + TryOnRepositoryImpl
- TryOnApiRepository vs BflRemoteDataSource
- Which path runs on RELEASE/production build by default?

Print exact call chain as:
Screen → … → HTTP client → URL path

STEP 2 — Confirm: app calls OUR backend or BFL directly?
Search for:
- api.bfl.ai
- flux-2-pro
- BflRemoteDataSource
- tryOnApiRepository / /try-on/generate

Answer YES/NO with file:line references:
- [ ] Production default uses POST /try-on/generate
- [ ] Production default uses direct BFL
- [ ] Silent fallback: API fail → BFL direct (FORBIDDEN)

STEP 3 — For ONE test case document exact outbound request
Use this scenario (same as backend QA):
- style_id: men_hair_styles_02
- category_id: hair_styles
- person_gender: men
- Source: user picks a normal front-facing photo (white t-shirt if possible)

Add kDebugMode interceptor (or document from existing Dio logger) that logs SANITIZED:

| Field | Value |
|-------|--------|
| Full request URL (host + path) | |
| HTTP method | |
| Authorization present? (yes/no, never log token) | |
| style_id | |
| category_id | |
| person_gender / gender | |
| width, height | |
| source_image_base64 length (chars) | |
| source mime (jpeg/png) | |
| source dimensions BEFORE compress (WxH) | |
| source dimensions AFTER compress (WxH) | |
| JPEG quality / maxWidth if ImageCompressor | |
| Is style_reference / garment image sent? | |
| Is custom prompt field sent? | |
| Request body keys (list only) | |

STEP 4 — Navigation: style_id / category_id integrity
Trace from Beauty Lab / catalog tile tap → TryOnRouteArgs → generate():
- Could tile index or label replace style_id?
- Could wrong category_id be sent (e.g. virtual_try_on instead of hair_styles)?
List every mapping point with file:line.

STEP 5 — Image pipeline
Document image_picker → crop (skipped for beauty?) → ImageCompressor → base64:
- Exact compressor settings (read constants)
- EXIF/orientation handling
- Does app send file path instead of base64 anywhere?

STEP 6 — Job polling
- Poll URL pattern: /try-on/jobs/{id} or wrong path?
- Double POST generate on double-tap?
- Poll interval?

STEP 7 — Result + history
- Which URL field is shown: result_image_absolute_url vs wrong field?
- On save history POST /history: are style_id, category_id, try_on_job_id sent?

STEP 8 — Couple (quick)
For couple_duo: is person_gender sent?

STEP 9 — Compare to backend test (known good)
Backend test with clean male_src produced PASS (white v-neck preserved).
If app sends different bytes/dimensions/params, list DIFF table:

| # | Backend test | App actual | Impact |
|---|--------------|------------|--------|

STEP 10 — Optional: capture one real device run
Run app on device with Dio/HTTP logger, one men_hair_styles_02 generation.
Paste sanitized log lines (NO full JWT, NO full base64).

OUTPUT FORMAT (required — user will paste this back)

## 1. Production generation chain (actual)
## 2. Backend API vs direct BFL (default path)
## 3. Sanitized generate request table (men_hair_styles_02)
## 4. style_id / category_id trace
## 5. Image compression/crop settings
## 6. Polling + job id handling
## 7. History save payload
## 8. Diff vs backend contract (list every mismatch)
## 9. Root cause hypothesis (MOBILE only, with evidence)
## 10. Recommended mobile fixes (ordered, no backend changes)
## 11. Files you read (paths)
## 12. Files you would change (if user approves next task)

If Flutter repo is missing TryOnApiRepository wiring, state clearly:
"BLOCKED: production still uses BflRemoteDataSource" with evidence.

Do not implement fixes unless user explicitly asks in a follow-up.
```

---

## Tumhare liye short summary (Urdu)

1. **Swagger** backend repo mein add hai → deploy ke baad:  
   `https://appworkspro.com/api-docs`  
   Abhi production par nahi dikhega jab tak VPS par latest code deploy na ho.

2. **Mere test vs app** — backend API clean photo par theek; app shayad:
   - abhi bhi **direct BFL** use karti hai, ya
   - **galat compress / galat source** (purani generated image), ya
   - **style_id / category_id** galat, ya
   - **history** mein `style_id: null` (alag issue)

3. **Upar wala prompt** mobile repo Cursor chat mein paste karo → jo report aaye woh **poori yahan bhej dena** — phir exact fix bata sakte hain.

---

## Swagger deploy (backend team)

Repo paths:
- `src/app/api-docs/` → UI
- `src/app/api/v1/openapi/route.ts` → spec

Production par test ke liye ek baar deploy chahiye (`git pull`, `npm ci`, `npm run build`, PM2 restart).
