# Mobile app — validation rules & error codes (new/updated backend)

**Envelope:** `{ "data": … | null, "error": { "code": string, "message": string } | null }`  
**Auth:** `Authorization: Bearer <access_token>` jahan likha ho.

---

## 1. Client-side validation (app form rules)

| Field | Rule | Endpoints |
|-------|------|-----------|
| `email` | Trim, lowercase before send; valid email format | register, login, forgot, OTP flows |
| `password` | Min **8** characters | register, login, reset-password/otp |
| `otp` | Exactly **4** digits (`0000`–`9999`); spaces stripped | reset-password/otp, verify-email/otp |
| `reason` | Min **3** characters | content-reports |
| `fcm_token` / `token` | Non-empty + `platform`: `android` \| `ios` \| `web` | POST fcm-token |
| `source_image_base64` | Required + valid image data URL or base64 | try-on/generate |
| `style_id` | Required string | try-on/generate |
| `try_on_job_id` | Valid Mongo ObjectId (24 hex) when syncing history | POST history |
| `display_name` | Optional; trim | register |
| `captcha_token` or `turnstile_token` | Required when server has `ENFORCE_TURNSTILE=true` | register, login, forgot-password, forgot-password/otp |

---

## Security (Turnstile — optional server flag)

When production enables Turnstile, send Cloudflare token as **`captcha_token`** or **`turnstile_token`** on auth abuse endpoints (same JSON body as email/password).

| HTTP | `error.code` | App action |
|------|----------------|------------|
| 422 | `CAPTCHA_REQUIRED` | Show Turnstile widget, resubmit with token |
| 400 | `CAPTCHA_FAILED` | Refresh widget, try again |

Try-on: if body too large → **413** `PAYLOAD_TOO_LARGE`.

---

## 2. Register — `POST /api/v1/auth/register`

### Request
```json
{ "email": "user@example.com", "password": "min8chars", "display_name": "Ali" }
```

### Success `data` (new fields)
| Field | Type | Notes |
|-------|------|--------|
| `access_token`, `refresh_token`, `expires_at` | string | Same as before |
| `verification_message` | string | Show in UI after sign-up |
| `verification_email_sent` | boolean | `false` → show “check spam / try resend” |
| `otp_length` | number | Always **4** |
| `expires_in_seconds` | number | OTP validity (~600) |
| `user.email_verified` | boolean | Starts **false** |
| `dev_otp`, `dev_reset_url` | string | **Non-production only** |

### Errors
| HTTP | `error.code` | App action |
|------|----------------|------------|
| 422 | `VALIDATION` | Missing email/password or password &lt; 8 |
| 409 | `CONFLICT` | Email already registered → go to login |
| 429 | `RATE_LIMIT` | Too many sign-ups from this device |

---

## 3. Forgot password — `POST /api/v1/auth/forgot-password/otp` (mobile)

### Request
```json
{ "email": "user@example.com" }
```

### Success — **always treat as success UX** (even if account missing)
| Field | Type |
|-------|------|
| `message` | Generic: code + link sent if account exists |
| `otp_length` | 4 |
| `expires_in_seconds` | number |
| `email_dispatched` | boolean (server tried Resend) |

**Never show “account does not exist”** from this API.

### Errors
| HTTP | `error.code` |
|------|----------------|
| 422 | `VALIDATION` — email missing |
| 429 | `RATE_LIMIT` — IP or per-email limit |

---

## 4. Verify email only — `POST /api/v1/auth/verify-email/otp` (new)

### Request
```json
{ "email": "user@example.com", "otp": "1234" }
```

### Success
```json
{ "email_verified": true, "otp_length": 4 }
```
Or `{ "email_verified": true, "already_verified": true }`

### Errors
| HTTP | `error.code` | App action |
|------|----------------|------------|
| 422 | `VALIDATION` | Missing email/otp or OTP not 4 digits |
| 400 | `INVALID_OTP` | Wrong/expired; message may include attempts left |
| 400 | `OTP_LOCKED` | Request new code (forgot-password/otp again) |
| 429 | `RATE_LIMIT` | Wait and retry |

---

## 5. Reset password with OTP — `POST /api/v1/auth/reset-password/otp`

### Request
```json
{ "email": "user@example.com", "otp": "1234", "password": "newpass1234" }
```

### Success
```json
{ "password_updated": true, "otp_length": 4 }
```
Also sets `email_verified: true` on server.

### Errors
Same as §4 plus:
| 422 | `VALIDATION` | password &lt; 8 |

---

## 6. Profile — `GET /api/v1/users/me` (updated)

### New field in `data`
| Field | Type |
|-------|------|
| `email_verified` | boolean |

Use to show “Verify email” banner when `false` (email/password users).

---

## 7. FCM — `DELETE /api/v1/users/me/fcm-token` (new)

### Request (optional body)
```json
{ "fcm_token": "…", "device_id": "…" }
```
Empty body = revoke all devices for user.

### Success
```json
{ "revoked_count": number }
```

Call on logout/delete **before** token is cleared (with Bearer).

---

## 8. Content report — `POST /api/v1/content-reports` (new)

### Request
```json
{
  "reason": "Inappropriate result",
  "details": "optional",
  "reporter_email": "optional",
  "look_id": "mongoId",
  "try_on_job_id": "mongoId"
}
```
Aliases: `history_id`, `job_id`.

### Success
```json
{ "id": "…", "status": "open", "created_at": "ISO" }
```

### Errors
| HTTP | `error.code` |
|------|----------------|
| 401 | `UNAUTHORIZED` |
| 400 | `INVALID_JSON` |
| 422 | `VALIDATION` — reason &lt; 3 chars |

---

## 9. Try-on generate — `POST /api/v1/try-on/generate` (new errors)

### Errors to map in app
| HTTP | `error.code` | Suggested UI |
|------|----------------|--------------|
| **422** | **`MODERATION_BLOCKED`** | Content not allowed |
| **429** | **`DAILY_LIMIT`** | Daily free looks used (UTC day) |
| 429 | `RATE_LIMIT` | Too many requests per minute |
| 422 | `VALIDATION` | Missing image/style, invalid image, garment missing |
| 503 | `SERVER_CONFIG` | Service unavailable |
| 502 | `TRY_ON_FAILED` | Generic generation failed |
| 400 | `INVALID_JSON` | Bad body |

---

## 10. Try-on poll — `GET /api/v1/try-on/jobs/{jobId}`

### Failed job
`data.status` = `failed`  
`data.error` = user-facing string (moderation = policy message).

No new HTTP error codes on poll (still 200 with status in body).

---

## 11. History — `POST /api/v1/history` (updated)

### Success — new field
| Field | When |
|-------|------|
| `already_exists` | `true` if same `try_on_job_id` already saved |

Do not create duplicate local row; use returned `id`.

---

## 12. Master list — `error.code` for app `switch`

| Code | Typical HTTP |
|------|----------------|
| `VALIDATION` | 422 |
| `CONFLICT` | 409 |
| `UNAUTHORIZED` | 401 |
| `FORBIDDEN` | 403 |
| `NOT_FOUND` | 404 |
| `RATE_LIMIT` | 429 |
| `DAILY_LIMIT` | 429 |
| `MODERATION_BLOCKED` | 422 |
| `INVALID_OTP` | 400 |
| `OTP_LOCKED` | 400 |
| `INVALID_TOKEN` | 400 |
| `INVALID_JSON` | 400 |
| `TRY_ON_FAILED` | 502 |
| `SERVER_CONFIG` | 503 |
| `STORAGE` | 502 |
| `INVALID_GOOGLE_TOKEN` | 401 |

---

## 12b. Auto email verified (FCM — no “Verify” button)

After **register/login**, register the device token:

`POST /api/v1/users/me/fcm-token` with `fcm_token` + `platform`.

Show a **waiting** screen (“Check your email”). User verifies via **email link** (browser) or **OTP in app** (`verify-email/otp`).

When verification succeeds on the server, the app receives an FCM message:

| `data` key | Value |
|------------|--------|
| `type` | `email_verified` |
| `user_id` | Mongo user id |
| `email_verified` | `"true"` |

Optional notification: title **Email verified**, body **You can continue in the app.**

**App handler:** `onMessage` / background / tap → if `data.type == email_verified` → `GET /users/me` → when `email_verified` true → navigate to home (no manual verify button).

**Fallback:** poll `GET /users/me` every 3s on the waiting screen if FCM is disabled or token missing.

---

## 13. Recommended app flows

1. **Sign up** → `POST fcm-token` → waiting screen → user opens email link **or** enters OTP → **FCM** or poll → home.  
2. **Forgot** → always success message → OTP screen → `reset-password/otp`.  
3. **Try-on** → handle `DAILY_LIMIT` + `MODERATION_BLOCKED`.  
4. **Report** → `content-reports` with `reason` ≥ 3 chars.  
5. **Logout** → `Firebase deleteToken` + `DELETE fcm-token`.

---

*Backend sends FCM `email_verified` on link verify + `verify-email/otp` success.*
