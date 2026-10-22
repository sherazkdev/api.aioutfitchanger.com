# Cloud Function → Next.js Backend Auth Contract (Phase 1)

**Status:** Foundation only — utilities exist; **no production routes are wired yet**.  
**Audience:** Backend + future Firebase Cloud Function implementers  

---

## Security rules

1. **Internal API key and HMAC secret MUST NEVER be returned to Flutter.**
2. Flutter never generates `X-Internal-API-Key` or `X-Signature`.
3. Secrets live only between **Firebase Cloud Function ↔ Next.js backend** (server env).
4. Backend must **never** trust `X-Firebase-Uid` unless the full internal verification succeeds.
5. Do not log: API key, HMAC secret, signature, or Authorization tokens.
6. Phase 1 does **not** verify Firebase ID tokens inside Next.js — the Cloud Function is the Firebase Auth trust boundary.

---

## Required headers

| Header | Meaning |
|--------|---------|
| `X-Internal-API-Key` | Shared server-to-server API credential |
| `X-Firebase-Uid` | Firebase UID of the authenticated caller (extracted by Cloud Function) |
| `X-Timestamp` | Unix timestamp in **seconds** (UTC) |
| `X-Signature` | HMAC-SHA256 of the canonical string → **lowercase hex** |

Header names are case-insensitive per HTTP.

---

## Environment (Next.js)

```text
CLOUD_FUNCTION_INTERNAL_API_KEY
CLOUD_FUNCTION_HMAC_SECRET
CLOUD_FUNCTION_REQUEST_MAX_SKEW_SECONDS   # default 300
```

Unset secrets → verifier returns `INTERNAL_AUTH_NOT_CONFIGURED` (legacy routes still boot).

---

## Canonical string

Exactly five lines joined by literal `\n` (LF):

```text
METHOD
PATH_WITH_QUERY
FIREBASE_UID
TIMESTAMP
SHA256_BODY
```

### METHOD

Uppercase HTTP method: `GET` | `POST` | `PATCH` | `DELETE` | …

### PATH_WITH_QUERY

`pathname + search` from the request URL **exactly as sent**.

Examples:

```text
/api/v1/try-on/generate
/api/v1/history?page=1&limit=20
```

Query parameters are **not** re-sorted. Cloud Function must sign the same path+query string it puts on the HTTP request.

### FIREBASE_UID

Trimmed Firebase UID string (same value as `X-Firebase-Uid`).

### TIMESTAMP

Decimal Unix seconds string — **exactly** the same characters as `X-Timestamp`.

- Non-negative integer digits only (`/^\d+$/`)
- No leading `+` / `-`, no decimals, no scientific notation
- Backend signs/verifies with the **exact header text** (not a Number→String round-trip)
- Skew check uses `Number(header)` vs server UTC epoch seconds

### SHA256_BODY

Lowercase hex SHA-256 of the **exact raw request body bytes/text**.

- No JSON parse + re-stringify.
- No body → `SHA256("")` (hash of empty string).

---

## HMAC

```text
signature = HMAC_SHA256(canonicalString, CLOUD_FUNCTION_HMAC_SECRET)
encoding  = lowercase hexadecimal
```

---

## Timestamp skew

- Reject non-numeric / non-integer timestamps → `INVALID_TIMESTAMP`
- Reject if `|now_utc_seconds - timestamp| > CLOUD_FUNCTION_REQUEST_MAX_SKEW_SECONDS` → `EXPIRED_TIMESTAMP`
- Default skew: **300 seconds**
- Applies to both past and future clock drift

---

## Backend verification order

1. Config / env secrets present (`INTERNAL_AUTH_NOT_CONFIGURED` if not)
2. All four required headers present (`MISSING_INTERNAL_AUTH`)
3. API key matches (timing-safe) (`INVALID_INTERNAL_API_KEY`)
4. Firebase UID structurally valid (`INVALID_FIREBASE_UID`)
5. Timestamp valid and within skew (`INVALID_TIMESTAMP` / `EXPIRED_TIMESTAMP`)
6. Compute body SHA-256 of exact raw body
7. HMAC signature matches (timing-safe) (`INVALID_SIGNATURE`)
8. Return trusted `{ firebaseUid, timestamp }`

Module: `src/lib/server/cloudFunctionAuth/`

---

## Cloud Function pseudocode

```text
uid = authenticated Firebase caller UID   // from Cloud Function auth context
timestamp = current Unix seconds (UTC)
rawBody = exact outbound request body string/bytes   // "" if none
bodyHash = SHA256_hex_lowercase(rawBody)

canonical =
  METHOD + "\n" +
  PATH_WITH_QUERY + "\n" +
  uid + "\n" +
  String(timestamp) + "\n" +
  bodyHash

signature = HMAC_SHA256_hex_lowercase(canonical, HMAC_SECRET)

send headers:
  X-Internal-API-Key: INTERNAL_API_KEY
  X-Firebase-Uid: uid
  X-Timestamp: String(timestamp)
  X-Signature: signature

# Then HTTP request to Next.js with the same METHOD, PATH_WITH_QUERY, and rawBody
```

Node.js sketch:

```js
import { createHash, createHmac } from "crypto";

function sha256Hex(raw) {
  return createHash("sha256").update(raw).digest("hex");
}

function sign({ method, pathWithQuery, uid, timestamp, rawBody, hmacSecret }) {
  const bodyHash = sha256Hex(rawBody ?? "");
  const canonical = [method.toUpperCase(), pathWithQuery, uid, String(timestamp), bodyHash].join("\n");
  return createHmac("sha256", hmacSecret).update(canonical, "utf8").digest("hex");
}
```

---

## Firebase UID → Mongo User (Phase 1 resolver)

`resolveFirebaseUser(firebaseUid)`:

- Lookup / upsert **only** by `User.firebaseUid`
- **No** auto-link by email, googleId, deviceId, IP, or name
- New users: minimal insert (`firebaseUid`, `isGuest: true`); role / `subscriptionPlan` / status from schema defaults
- Mongo `_id` remains the FK for history, jobs, devices
- Race-safe upsert + unique sparse index; duplicate-key → re-fetch

---

## What Phase 1 does **not** include

- Wiring try-on / history / users / devices routes
- Flutter changes
- Cloud Function deployment
- Admin API key dashboard / rotation UI
- Direct Firebase ID token verification in Next.js

---

## Related code

| Piece | Path |
|-------|------|
| Verifier | `src/lib/server/cloudFunctionAuth/verifyInternalRequest.ts` |
| Resolver | `src/lib/server/cloudFunctionAuth/resolveFirebaseUser.ts` |
| User field | `User.firebaseUid` in `src/lib/server/models/User.ts` |
| Tests | `npm run test:cloud-function-auth` |
