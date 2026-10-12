# Mobile app — backend API update (Oct 2026)

**Audience:** Flutter / mobile developer  
**Backend repo:** `api.aioutfitchanger.com` (deployed e.g. `https://appworkspro.com/api/v1`)  
**Git commit:** `feat: audit backend fixes for moderation, quotas, and reports` (`eb3d299` on `main`)

Use this doc after the server deploy. **Existing try-on/history request bodies are unchanged** unless noted below.

---

## Summary

| Area | Action in app |
|------|----------------|
| Content reports | Wire `POST /content-reports` (was missing on server) |
| Try-on errors | Handle `MODERATION_BLOCKED`, `DAILY_LIMIT` |
| FCM logout | Call `DELETE /users/me/fcm-token` + `deleteToken()` |
| History sync | Handle `already_exists`; stop duplicate local rows |
| Other APIs | No request param changes |

---

## 1. New: Content reports

**`POST /api/v1/content-reports`**  
**Auth:** `Authorization: Bearer <access_token>`  
**Content-Type:** `application/json`

### Request body

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `reason` | string | **Yes** | Min 3 characters |
| `details` | string | No | Optional description |
| `reporter_email` | string | No | Fallback contact |
| `look_id` | string | No* | Server history id |
| `history_id` | string | No* | Alias of `look_id` |
| `try_on_job_id` | string | No* | Try-on job id |
| `job_id` | string | No* | Alias of `try_on_job_id` |
| `content_type` | string | No | `look` or `try_on_job` if only generic id |
| `content_id` | string | No | Generic reference |

\*Send at least one of: `look_id` / `history_id` or `try_on_job_id` / `job_id`.

### Success response (`200`)

```json
{
  "data": {
    "id": "674a...",
    "status": "open",
    "created_at": "2026-10-12T10:00:00.000Z"
  },
  "error": null
}
```

### Errors

| HTTP | `error.code` | When |
|------|----------------|------|
| 401 | `UNAUTHORIZED` | No/invalid token |
| 422 | `VALIDATION` | Missing/short `reason` |
| 400 | `INVALID_JSON` | Bad body |

---

## 2. New: FCM token revoke

**`DELETE /api/v1/users/me/fcm-token`**  
**Auth:** Bearer  
**Content-Type:** `application/json` (body optional)

### Request body

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| `fcm_token` | string | No | Preferred |
| `token` | string | No | Alias of `fcm_token` |
| `device_id` | string | No | Alternative to token |

If **both** token and `device_id` are omitted → server revokes **all** active FCM rows for that user.

### Success response (`200`)

```json
{
  "data": { "revoked_count": 1 },
  "error": null
}
```

### Recommended client flow (logout / account delete)

1. `await FirebaseMessaging.instance.deleteToken()` (or equivalent).
2. **`DELETE /api/v1/users/me/fcm-token`** with current `fcm_token` while access token is still valid.
3. Then `POST /auth/logout` or `DELETE /users/me` as today.

**Unchanged:** `POST /api/v1/users/me/fcm-token` — same as before (`fcm_token`, `platform`, optional `device_id`, `app_version`).

---

## 3. Try-on generate — same request, new error codes

**`POST /api/v1/try-on/generate`** — **no new required fields.**

Existing body (unchanged):

- `source_image_base64` (required)
- `style_id` (required)
- `category_id`, `prompt`, `style_reference_image_base64`, `person_gender` / `gender`, `width`, `height` (optional)

### New / important errors to handle in UI

| HTTP | `error.code` | Suggested user message |
|------|----------------|-------------------------|
| **422** | **`MODERATION_BLOCKED`** | Content not allowed under app policy |
| **429** | **`DAILY_LIMIT`** | Daily free try-on limit reached (UTC day; default **5**/user on server) |
| 429 | `RATE_LIMIT` | Too many requests (≈10 per minute) — already existed |
| 503 | `SERVER_CONFIG` | Service temporarily unavailable (generic) |
| 502 | `TRY_ON_FAILED` | Generation failed (generic; no BFL/env leaks) |

**App work:** Extend `ApiException` / error mapper for `DAILY_LIMIT` and `MODERATION_BLOCKED` (all locales).

---

## 4. Try-on job poll — same JSON shape

**`GET /api/v1/try-on/jobs/{jobId}`**

- `data.job_id`, `data.status`, `data.result_image_url`, `data.result_image_absolute_url` — unchanged.
- `data.error`: on moderation failure, server returns a **generic** moderation message instead of raw provider text.

**App work:** Optional copy tweak for failed + moderation; **no new query params.**

---

## 5. History save — optional response field

**`POST /api/v1/history`** — request unchanged (`image_url` required; `try_on_job_id` recommended for sync).

### New response field

| Field | Type | When |
|-------|------|------|
| `already_exists` | boolean | `true` if this `try_on_job_id` was already saved for this user |

Example:

```json
{
  "data": {
    "id": "674b...",
    "image_url": "/uploads/looks/...",
    "image_absolute_url": "https://...",
    "created_at": "...",
    "already_exists": true
  },
  "error": null
}
```

**App work (audit #11):**

- On success, persist **server `id`** only once per `try_on_job_id`.
- Remove stale local-only id (e.g. `history_<timestamp>`) after sync.
- Send valid Mongo **ObjectId** in `try_on_job_id` when syncing from a completed job.

---

## 6. No mobile changes required

| Endpoint | Note |
|----------|------|
| `DELETE /api/v1/users/me` | Unchanged |
| `POST /api/v1/auth/refresh` | Server-only concurrency fix |
| `POST /api/v1/devices/register` | Unchanged |
| `POST /api/v1/users/me/avatar` | Unchanged |
| Catalog, auth, home feed | Unchanged |

---

## 7. Server-side only (not in app)

Backend optional env (defaults if unset):

- `TRY_ON_DAILY_LIMIT_PER_USER` — default `5` (0 = unlimited)
- `TRY_ON_MODERATION_ENABLED` — default `true`

No new headers or API keys for the mobile client.

---

## 8. Post-deploy verification (optional)

Against production base URL:

```bash
node scripts/audit-backend-fixes.verify.mjs https://appworkspro.com
```

Manual: one blocked prompt try-on → `422 MODERATION_BLOCKED`; sixth try-on same UTC day → `429 DAILY_LIMIT`.

---

## Checklist for mobile PR

- [ ] Report screen → `POST /api/v1/content-reports` with `reason` + ids  
- [ ] Error handling: `MODERATION_BLOCKED`, `DAILY_LIMIT`  
- [ ] Logout/delete → `deleteToken()` + `DELETE /users/me/fcm-token`  
- [ ] History: handle `already_exists`, dedupe local history after sync  

**Questions:** backend team / API docs `docs/API_ENDPOINTS_TABLE.md`
