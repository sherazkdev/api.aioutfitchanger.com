# Mobile App — Backend API Call Guide (Real Endpoints)

**Production base URL**

```text
https://appworkspro.com/api/v1
```

**Swagger UI (browser testing)** — deploy ke baad:

```text
https://appworkspro.com/api-docs
```

OpenAPI JSON:

```text
https://appworkspro.com/api/v1/openapi
```

Login se `access_token` lo → Swagger mein **Authorize** → `Bearer <token>` (ya sirf token paste karo agar UI Bearer khud lagaye).

Local dev (agar `npm run build` + `next start` chal raha ho):

```text
http://localhost:3000/api/v1
```

Har response ka **standard envelope** (backend code: `src/lib/server/http.ts`):

**Success**

```json
{
  "data": { ... },
  "error": null
}
```

**Error**

```json
{
  "data": null,
  "error": {
    "code": "VALIDATION",
    "message": "Human readable message"
  }
}
```

**Headers (JSON APIs)**

| Header | Value |
|--------|--------|
| `Content-Type` | `application/json` |
| `Accept` | `application/json` |
| `Authorization` | `Bearer <access_token>` (jab login ho) |

Optional: `Accept-Language` — home/catalog localized titles ke liye.

---

## 1. Health / metadata (login ke baghair)

### `GET /app/metadata`

```bash
curl -s "https://appworkspro.com/api/v1/app/metadata"
```

Auth **nahi** chahiye. App version / feature flags check karne ke liye.

---

## 2. Authentication

### 2.1 Register — `POST /auth/register`

```bash
curl -s -X POST "https://appworkspro.com/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test_user@example.com\",\"password\":\"TestPass123!\",\"display_name\":\"Test User\"}"
```

**Body**

| Field | Required | Notes |
|-------|----------|--------|
| `email` | Yes | |
| `password` | Yes | min 8 chars |
| `display_name` | No | |

**Success `data` (shape)**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_at": "2026-10-08T12:00:00.000Z",
  "user": {
    "id": "674a...",
    "email": "test_user@example.com",
    "display_name": "Test User",
    "role": "user"
  }
}
```

**Common errors:** `409 CONFLICT` (email already), `422 VALIDATION`, `429 RATE_LIMIT`

---

### 2.2 Login — `POST /auth/login`

```bash
curl -s -X POST "https://appworkspro.com/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test_user@example.com\",\"password\":\"TestPass123!\"}"
```

Response shape **register jaisa** (`access_token`, `refresh_token`, `user`).

**Errors:** `401 UNAUTHORIZED`, `403 FORBIDDEN` (disabled account)

---

### 2.3 Refresh — `POST /auth/refresh`

Access token expire hone par:

```bash
curl -s -X POST "https://appworkspro.com/api/v1/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\":\"<REFRESH_TOKEN>\"}"
```

**Success `data`**

```json
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_at": "...",
  "token_type": "Bearer"
}
```

**Flutter rule:** `401` on protected API → ek baar refresh → phir original request retry → phir bhi fail → login screen.

---

### 2.4 Logout — `POST /auth/logout`

Bearer token ke sath (session invalidate).

---

## 3. User profile / gender (Couple + catalog)

### `GET /users/me` — Bearer required

Current user profile.

### `GET /users/me/preferences`

```json
{
  "style_gender_preference": "men",
  "language_code": "en",
  ...
}
```

### `PATCH /users/me/preferences`

Couple try-on ke liye profile gender set kar sakte ho:

```bash
curl -s -X PATCH "https://appworkspro.com/api/v1/users/me/preferences" \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"style_gender_preference\":\"men\"}"
```

**Note:** Try-on generate par `person_gender` bhejna behtar hai; warna backend user preference use karta hai (`generate/route.ts`).

---

## 4. Home & catalog (UI ke liye — generation ref yahan se nahi)

### Home feed — `GET /home/feed?gender=men|women`

```bash
curl -s "https://appworkspro.com/api/v1/home/feed?gender=women"
```

Auth optional (public cached content).

### Style grid — `GET /catalog/{categoryId}?gender=&tab=`

Examples:

```bash
# Hair styles
curl -s "https://appworkspro.com/api/v1/catalog/hair_styles?gender=women"

# Hijab
curl -s "https://appworkspro.com/api/v1/catalog/hijab_styles?gender=women"

# Wardrobe shirt tab
curl -s "https://appworkspro.com/api/v1/catalog/wardrobe_browse?gender=men&tab=shirts"
```

**Important:** Thumbnail `image_url` sirf UI ke liye. **Try-on generation** ke liye backend apne catalog se reference resolve karta hai — mobile ko bundled PNG BFL ko bhejne ki zaroorat **nahi** jab API use ho.

---

## 5. Try-On — main flow (Hair, Hijab, Outfit, Couple)

Yeh **production generation** path hai. Mobile ko **direct BFL call nahi** karna chahiye.

### Step A — person image ko base64 banao

Backend accept karta hai:

1. **Data URL (recommended)**

```text
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

2. **Raw base64** (server ise `image/jpeg` maan leta hai)

PNG bhi chal sakta hai agar `data:image/png;base64,...` ho.

**Mat bhejo:** file path, `file://`, multipart (is route par JSON hi hai).

**Size:** bahut choti image par `PERSON_TOO_SMALL` / validation fail ho sakta hai.

---

### Step B — `POST /try-on/generate`

**Auth:** `Authorization: Bearer <access_token>` **required**

**Rate limit:** ~10 requests / minute / user (429 `RATE_LIMIT`)

#### Example — Hair Style (`men_hair_styles_02`)

PowerShell (image download + generate):

```powershell
$token = "YOUR_ACCESS_TOKEN"
$imgUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=768&h=1024&fit=crop&q=85"
$bytes = (Invoke-WebRequest -Uri $imgUrl -UseBasicParsing).Content
$b64 = [Convert]::ToBase64String($bytes)
$dataUrl = "data:image/jpeg;base64,$b64"

$body = @{
  source_image_base64 = $dataUrl
  style_id            = "men_hair_styles_02"
  category_id         = "hair_styles"
  person_gender       = "men"
  width               = 768
  height              = 1024
} | ConvertTo-Json

Invoke-RestMethod -Method POST `
  -Uri "https://appworkspro.com/api/v1/try-on/generate" `
  -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
  -Body $body
```

#### Example — Hijab (`women_hijab_04`)

```json
{
  "source_image_base64": "data:image/jpeg;base64,...",
  "style_id": "women_hijab_04",
  "category_id": "hijab_styles",
  "person_gender": "women",
  "width": 768,
  "height": 1024
}
```

#### Example — Wardrobe top (Phase 1)

```json
{
  "source_image_base64": "data:image/jpeg;base64,...",
  "style_id": "women_tops_01",
  "category_id": "wardrobe_browse",
  "person_gender": "women",
  "width": 768,
  "height": 1024
}
```

#### Example — Couple (`couple_02`)

**`person_gender` zaroori** (ya profile preference set):

```json
{
  "source_image_base64": "data:image/jpeg;base64,...",
  "style_id": "couple_02",
  "category_id": "couple_duo",
  "person_gender": "men",
  "width": 768,
  "height": 1024
}
```

Female garment ke liye `"person_gender": "women"` same `style_id` ke sath.

---

### Request body reference

| Field | Required | Description |
|-------|----------|-------------|
| `source_image_base64` | **Yes** | User photo (data URL ya raw base64) |
| `style_id` | **Yes** | e.g. `men_hair_styles_02`, `women_hijab_04` |
| `category_id` | Strongly recommended | `hair_styles`, `hijab_styles`, `wardrobe_browse`, `couple_duo`, etc. |
| `person_gender` | Couple + recommended | `"men"` \| `"women"` (alias: `gender`) |
| `width` | No | default **768** |
| `height` | No | default **1024** |
| `prompt` | No | Usually **omit** — server catalog COMMAND use karta hai |
| `style_reference_image_base64` | No | Sirf custom ref override; normal catalog par **omit** |

Backend khud decide karta hai:

- **Beauty** (hair, hijab, beard, hair color) → BFL `flux-2-pro`
- **Outfit / wardrobe / couple** → BFL **VTO v2** (mobile engine choose **nahi** kare)

---

### Step C — Generate response (real shape)

Production test se (`artifacts/external-source-tests/.../api-job.json`):

```json
{
  "data": {
    "job_id": "6ac61694f3495b3f21c99402",
    "external_job_id": "6df04980-ddd4-432d-be25-aa05e847718a",
    "polling_url": "/api/v1/try-on/jobs/6ac61694f3495b3f21c99402",
    "status": "queued"
  },
  "error": null
}
```

**Save karo:** `data.job_id` — polling ke liye.

---

### Step D — Poll job — `GET /try-on/jobs/{jobId}`

**Auth:** Bearer required  
**Interval:** ~2–3 seconds  
**Kab band karo:** `completed` \| `failed` \| `cancelled` \| timeout (~3–5 min)

```bash
curl -s "https://appworkspro.com/api/v1/try-on/jobs/JOB_ID_HERE" \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

**Processing**

```json
{
  "data": {
    "job_id": "6ac61694f3495b3f21c99402",
    "status": "processing",
    "result_image_url": null,
    "result_image_absolute_url": null,
    "error": null
  },
  "error": null
}
```

**Completed**

```json
{
  "data": {
    "job_id": "6ac61694f3495b3f21c99402",
    "status": "completed",
    "result_image_url": "/api/v1/files/uploads/.../result.jpg",
    "result_image_absolute_url": "https://appworkspro.com/api/v1/files/uploads/.../result.jpg",
    "error": null
  },
  "error": null
}
```

**UI ke liye:** `result_image_absolute_url` use karo (full HTTPS URL).

**Failed**

```json
{
  "data": {
    "job_id": "...",
    "status": "failed",
    "result_image_url": null,
    "result_image_absolute_url": null,
    "error": "Generation failed"
  },
  "error": null
}
```

---

### Step E — Cancel (optional) — `DELETE /try-on/jobs/{jobId}`

User cancel kare to status `cancelled`.

---

## 6. `category_id` cheat sheet (real IDs)

| Feature | `category_id` | Example `style_id` |
|---------|----------------|-------------------|
| Hair style | `hair_styles` | `men_hair_styles_02`, `women_hair_styles_04` |
| Hair color | `hair_color` | `men_hair_color_03` |
| Beard | `beard_styles` | `men_beard_03` |
| Hijab | `hijab_styles` | `women_hijab_04`, `women_hijab_05` |
| Virtual try-on | `virtual_try_on` | `women_tryon_01` |
| Outfit change | `outfit_change` | `women_outfit_change_01` |
| Wardrobe garments | `wardrobe_browse` | `men_shirts_01`, `women_tops_01` |
| Occasions | `occasions` | `women_occasions_casual_01` (pattern) |
| Couple | `couple_duo` | `couple_02` |
| Presets | `presets` | `men_preset_gym_01` (pattern) |

Tile tap par **wahi** `style_id` + `category_id` API tak pohonchni chahiye — label/index se mat banao.

---

## 7. Try-on errors (generate)

| HTTP | `error.code` | Meaning |
|------|----------------|---------|
| 400 | `INVALID_JSON` | Body JSON invalid |
| 401 | `UNAUTHORIZED` | Token missing/invalid |
| 422 | `VALIDATION` | Missing fields, bad image, couple gender missing |
| 429 | `RATE_LIMIT` | Bahut requests |
| 502 | `TRY_ON_FAILED` | Provider/start error |
| 503 | `SERVER_CONFIG` | Server env (e.g. BFL key) |

Couple without gender:

```text
error.code: VALIDATION
message: person_gender (men|women) required for couple_duo try-on...
```

---

## 8. Flutter / Dio — minimal pseudocode

```dart
// 1) Login once, store access_token + refresh_token

Future<TryOnResult> generateTryOn({
  required String sourceBase64DataUrl,
  required String styleId,
  required String categoryId,
  String? personGender,
}) async {
  final gen = await dio.post(
    '/try-on/generate',
    data: {
      'source_image_base64': sourceBase64DataUrl,
      'style_id': styleId,
      'category_id': categoryId,
      if (personGender != null) 'person_gender': personGender,
      'width': 768,
      'height': 1024,
    },
  );
  final jobId = gen.data['data']['job_id'] as String;

  while (true) {
    await Future.delayed(const Duration(seconds: 3));
    final poll = await dio.get('/try-on/jobs/$jobId');
    final data = poll.data['data'];
    final status = data['status'] as String;
    if (status == 'completed') {
      return TryOnResult(url: data['result_image_absolute_url'] as String);
    }
    if (status == 'failed' || status == 'cancelled') {
      throw Exception(data['error'] ?? status);
    }
  }
}
```

`BaseOptions(baseUrl: 'https://appworkspro.com/api/v1')`  
Interceptor: `Authorization: Bearer $accessToken`

---

## 9. History API (optional — agar server history use karo)

| Method | Path |
|--------|------|
| `GET` | `/history` |
| `POST` | `/history` |
| `GET` | `/history/{id}` |

Local-only history abhi bhi app mein ho sakti hai; backend history alag endpoint hai.

---

## 10. Media URLs (catalog thumbnails)

Public catalog images (reference / CDN):

```text
https://appworkspro.com/media/catalog/hijab_styles/women_hijab_04.png
https://appworkspro.com/media/catalog/hair_styles/men_hair_styles_02.png
```

Generation ke liye mobile in URLs ko manually BFL ko **nahi** bhejta jab backend API use ho — server `resolveGarmentImage` se load karta hai.

---

## 11. End-to-end checklist (mobile integration)

1. `POST /auth/login` → token save  
2. User photo → `data:image/jpeg;base64,...` (beauty ke liye zyada compress mat karo)  
3. `POST /try-on/generate` with exact `style_id` + `category_id`  
4. Poll `GET /try-on/jobs/{job_id}` until `completed`  
5. Show `result_image_absolute_url`  
6. Double-tap par doosra job **na** banao jab tak pehla khatam na ho  
7. Network mein sirf `appworkspro.com` — **direct `api.bfl.ai` nahi** production mein  

---

## 12. Local test script (repo mein)

```bash
npx tsx artifacts/phase4-production-qa.mjs https://appworkspro.com
```

Ya beauty comparison:

```bash
npx tsx artifacts/external-source-tests/run-beauty-comparison.mjs https://appworkspro.com
```

---

**Source of truth (code):**

- `src/app/api/v1/try-on/generate/route.ts`
- `src/app/api/v1/try-on/jobs/[jobId]/route.ts`
- `src/lib/server/tryOn/jobResponse.ts`
- `artifacts/phase4-production-qa.mjs`
