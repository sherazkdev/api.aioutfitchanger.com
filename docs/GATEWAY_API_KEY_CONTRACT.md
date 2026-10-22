# Gateway API Key Contract (external Cloud Function → Next.js)

**Status:** Target production contract for mobile Firebase Auth.  
**Ownership:** Cloud Functions are owned by the mobile/Firebase team — not this backend repo.  
**Legacy:** Mobile JWT login remains transitional during cutover. Admin JWT is permanent.

---

## Request headers (required)

```http
X-API-Key: <gateway-server-to-server-key>
X-Firebase-Uid: <Firebase Auth UID>
Content-Type: application/json
```

Example:

```http
POST /api/v1/try-on/generate
X-API-Key: …
X-Firebase-Uid: abc123FirebaseUid
Content-Type: application/json
```

There is **no** HMAC, **no** `X-Timestamp`, **no** `X-Signature` in this contract.

---

## Trust order (backend)

1. Validate `X-API-Key` against encrypted active (+ grace) keys  
2. **Only then** structurally validate `X-Firebase-Uid`  
3. Resolve / upsert Mongo `User` by `firebaseUid`  
4. Reject disabled users  
5. Authorize business logic with Mongo `User._id`

Never trust UID alone. Never accept client Mongo `userId` as authority.

---

## Cloud Function responsibilities

- Authenticate the Firebase caller (`request.auth`)  
- Set `X-Firebase-Uid` from `request.auth.uid` only  
- Store `X-API-Key` in Cloud Function **secret storage**  
- **Never** send the API key to Flutter  
- Call backend over HTTPS (`https://appworkspro.com`)

## Backend responsibilities

- Encrypt/store/reveal/rotate/revoke gateway keys (admin dashboard)  
- Validate API key first, UID second  
- Resolve Mongo user; enforce quota, moderation, ownership  
- Keep provider keys (`BFL_API_KEY`, `ARK_API_KEY`) server-only  

---

## Dual auth (migration)

Business routes accept **either**:

- Gateway headers (`X-API-Key` + `X-Firebase-Uid`), or  
- Legacy `Authorization: Bearer` access JWT  

Invalid gateway key **does not** fall through to trusting a UID.

Feature flag: `FIREBASE_GATEWAY_AUTH_ENABLED` (default on when `GATEWAY_API_KEY_MASTER_KEY` is set).

---

## Admin key management

Admin JWT + IP allowlist only:

- `GET /api/v1/admin/gateway-api-key`  
- `POST /api/v1/admin/gateway-api-key/create`  
- `POST /api/v1/admin/gateway-api-key/rotate`  
- `POST /api/v1/admin/gateway-api-key/revoke`  
- `POST /api/v1/admin/gateway-api-key/reveal/request`  
- `POST /api/v1/admin/gateway-api-key/reveal/confirm`  

Keys are AES-256-GCM encrypted at rest. Master key: `GATEWAY_API_KEY_MASTER_KEY` (server env only).

---

## LEGACY MOBILE AUTH — TRANSITIONAL

Still present for Flutter cutover:

- `/auth/register`, `/auth/login`, `/auth/google`  
- `/auth/refresh`, `/auth/logout`  
- password reset / email verify  

Deprecate only after mobile confirms full CF gateway cutover.  
**Admin auth is not legacy** and remains.
