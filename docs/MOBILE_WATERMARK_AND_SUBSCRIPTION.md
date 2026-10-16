# Mobile app — AI result watermark & subscription plan

**Audience:** Flutter / mobile developer  
**Backend base URL:** `https://appworkspro.com/api/v1` (or your staging host)  
**Related server commits on `main`:**

| Commit | Topic |
|--------|--------|
| `8ffe667` | Premium-aware watermark on persisted try-on images |
| `ceed312` | `.env.example` sanitization only (no app change) |

**Server deploy:** Required before app behavior matches this doc. **No new env vars** on VPS for watermark (default ON).

---

## Summary (what the app must do)

| Topic | App action |
|-------|------------|
| Watermark on images | **Nothing on device** — server burns watermark into saved files for **free** users |
| `subscription_plan` | Read from `GET /users/me`; drive paywall / “Premium” UI |
| Try-on / history APIs | **No new fields** in request bodies |
| Client-side overlay | **Do not** add a second watermark in Flutter (double branding) |
| Upgrade to premium | **Not** a public mobile API yet — plan is set via **admin** (`PATCH /admin/users/:id`) or future billing integration |

---

## 1. How watermark works (server)

1. User completes try-on (BFL poll or BytePlus sync).
2. When the server **first saves** the result to `/uploads/looks/{userId}/…`, it may run **sharp** overlay (bottom-right pill).
3. URLs returned in `result_image_url`, `result_image_absolute_url`, history `image_url` are the **final** pixels (already watermarked or clean).

**Not watermarked again:** URLs that are already on your host under `/uploads/looks/…` when passed through persist again.

**Who gets watermark:**

| Server-side rule | Watermark on **new** saved results |
|------------------|-------------------------------------|
| `subscription_plan: free` (default) | **Yes** |
| `subscription_plan: premium` | **No** |
| `role: admin` | **No** |
| Global kill switch `TRY_ON_WATERMARK_ENABLED=0` on server | **No** (all users) |

**Visual (for QA / store screenshots):** Bottom-right pill — sparkle + `AI Generated · Outfit Changer`, height ~40px at 1080px-wide reference, dark gradient + thin light stroke, scales with image width. Details: `docs/AI_RESULT_WATERMARK.md`.

---

## 2. API: `subscription_plan` on profile

### `GET /api/v1/users/me`

**Auth:** `Authorization: Bearer <access_token>`

**New field in `data`:**

| Field | Type | Values | Default if missing (old accounts) |
|-------|------|--------|-----------------------------------|
| `subscription_plan` | string | `"free"` \| `"premium"` | Treat as `"free"` |

**Example `200`:**

```json
{
  "data": {
    "id": "66f1…",
    "email": "user@example.com",
    "display_name": "Ali",
    "photo_url": null,
    "role": "user",
    "status": "active",
    "email_verified": true,
    "subscription_plan": "free",
    "preferences": {
      "theme_mode": "system",
      "notifications_enabled": true,
      "language_id": "en_US",
      "style_gender_preference": "women"
    }
  },
  "error": null
}
```

**When to refresh `subscription_plan`:**

- After login / token refresh bootstrap
- After you implement in-app purchase (when backend exposes plan updates)
- After admin changes plan (user may need re-open app or pull-to-refresh profile)
- Optional: refresh on resume if you cache profile > few minutes

---

## 3. Try-on & history (unchanged contracts)

### Requests — no changes

- `POST /api/v1/try-on/generate` — same JSON as before  
- `GET /api/v1/try-on/jobs/{job_id}` — same polling  
- `POST /api/v1/history` — same body  
- `GET /api/v1/history` — same query params  

Do **not** send `subscription_plan` or `watermark` flags from the app.

### Responses — same fields, different pixels

Use **`result_image_absolute_url`** (try-on) and history **`image_url`** / absolute helpers as today.

- **Free user:** JPEG/PNG from server may show embedded pill (often `.jpg` after watermark path).
- **Premium user:** Clean image, same URL shape.

**App display:** `Image.network(url)` — no extra widget unless **product** wants a “Preview” badge separate from server watermark (not required).

---

## 4. Flutter model & state (recommended)

### User model

```dart
enum SubscriptionPlan { free, premium }

SubscriptionPlan parseSubscriptionPlan(String? raw) {
  switch (raw) {
    case 'premium':
      return SubscriptionPlan.premium;
    default:
      return SubscriptionPlan.free;
  }
}
```

Map JSON key: `subscription_plan` (snake_case).

### Session / profile store

- Persist `subscription_plan` next to `email`, `email_verified`, preferences.
- Expose: `bool get isPremium => subscriptionPlan == SubscriptionPlan.premium;`

### UI suggestions (product)

| `subscription_plan` | Suggested UX |
|---------------------|--------------|
| `free` | Upgrade entry point; copy that exports may include “AI Generated” branding on results |
| `premium` | Hide upgrade nag; marketing “HD / no watermark” if you sell premium |

**Share / save to gallery:** Shared file is whatever URL points to (already watermarked for free). No client compositing needed.

---

## 5. Testing checklist (QA)

1. **Free test user** (default): New try-on → open result URL → pill visible bottom-right.
2. **Premium test user:** Admin sets `subscription_plan: premium` → new try-on → **no** pill.
3. **Old history:** Images saved **before** deploy stay as-is (no retroactive watermark).
4. **Regression:** Generate → poll → save history → list history — same flow, no new errors.
5. Compare `GET /users/me` `subscription_plan` with visual result after **new** generation only.

### Admin (internal QA only)

```http
PATCH /api/v1/admin/users/{user_id}
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{ "subscription_plan": "premium" }
```

Revert with `{ "subscription_plan": "free" }`.

---

## 6. Errors & edge cases

| Case | Behavior |
|------|----------|
| Missing `subscription_plan` in JSON | Parse as `free` |
| User offline / cached profile | Show cached plan; images already downloaded keep old pixels |
| Persist fails server-side | Server may fall back to provider URL without watermark (rare); app still shows URL from job response |
| Moderation / quota errors | Unchanged (`MODERATION_BLOCKED`, `DAILY_LIMIT`, etc.) |

Watermark does **not** add new HTTP error codes.

---

## 7. Future: in-app purchase

When you add billing:

1. Backend should set `subscriptionPlan` on payment webhook (not in this repo phase).
2. App: after purchase success, call `GET /users/me` and update local `subscription_plan`.
3. **Next** try-on after premium activation saves clean images; previous watermarked files stay watermarked.

---

## 8. Related docs

- `docs/MOBILE_APP_API.md` — full API (profile section includes `subscription_plan`)
- `docs/AI_RESULT_WATERMARK.md` — server engineering / env / persist hooks
- `docs/MOBILE_DEV_BACKEND_UPDATE_OCT2026.md` — moderation, reports, FCM revoke

---

## 9. Quick integration order

1. Deploy backend (`main` ≥ `8ffe667`).
2. Add `subscription_plan` to user model + `GET /users/me` parsing.
3. Wire premium vs free UI (no try-on API changes).
4. QA with admin-flipped premium user.
5. Ship app build; no `.env` changes on mobile.
