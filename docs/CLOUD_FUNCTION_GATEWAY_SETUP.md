# Cloud Function Gateway Setup (Phase 2A)

**Status:** Foundation only — `secureBackendPing` callable + internal backend ping.  
**Not migrated:** try-on, history, users/me, devices.  
**App Check:** intentionally **not** required / not enforced.  
**Deploy:** do **not** deploy until after security review + controlled testing.

---

## Architecture

```text
Flutter (Firebase Anonymous Auth)
  → Firebase callable: secureBackendPing
  → Cloud Function reads request.auth.uid ONLY
  → signs with server-only secrets
  → POST /api/v1/internal/cloud-function/ping
  → Next.js verifyCloudFunctionRequest
  → { ok: true, auth_ok: true }   // verify-only; no Mongo User create
```

Flutter **never** receives:

```text
CLOUD_FUNCTION_INTERNAL_API_KEY
CLOUD_FUNCTION_HMAC_SECRET
```

Signing contract: `docs/CLOUD_FUNCTION_BACKEND_AUTH_CONTRACT.md` (single source of truth).

---

## Temporary validation endpoint

`secureBackendPing` + `/api/v1/internal/cloud-function/ping` are **temporary validation** surfaces.

Recommended lifecycle:

```text
controlled integration verification
→ test with shared secrets
→ keep out of normal production Flutter flow
→ disable/remove when business-route gateway replaces it
```

Do **not** ship the ping callable as a permanent production app feature.

---

## Anonymous-account farming (honest risk)

With **App Check OFF**:

```text
attacker can create many Firebase anonymous users
→ call callables repeatedly
```

Phase 2A mitigation for the ping route:

```text
HMAC verify only — does NOT call resolveFirebaseUser
→ invalid OR valid ping does not create Mongo Users
```

Firebase Anonymous Auth alone does **not** prevent account farming. Future business routes that create users/jobs must add App Check / quotas / abuse controls.

---

## Prerequisites (Firebase Console — manual)

1. Enable **Authentication → Sign-in method → Anonymous**.
2. Create / select a Firebase project.
3. Copy `.firebaserc.example` → local `.firebaserc` with your real project id.  
   `.firebaserc` is **gitignored** until a real project is confirmed (`EXCLUDE_UNTIL_PROJECT_CONFIRMED`).

---

## Shared secrets (must match)

### Next.js backend

```text
CLOUD_FUNCTION_INTERNAL_API_KEY=<same value>
CLOUD_FUNCTION_HMAC_SECRET=<same value>
CLOUD_FUNCTION_REQUEST_MAX_SKEW_SECONDS=300
```

### Firebase Cloud Functions

```text
CLOUD_FUNCTION_INTERNAL_API_KEY=<same value>   # defineSecret — bound on secureBackendPing
CLOUD_FUNCTION_HMAC_SECRET=<same value>        # defineSecret — bound on secureBackendPing
BACKEND_BASE_URL=https://appworkspro.com       # defineString — origin only
```

Local Next.js:

```text
BACKEND_BASE_URL=http://127.0.0.1:3000
```

Rules for `BACKEND_BASE_URL`:

- Origin only (no path/query)
- `https:` required except localhost/`127.0.0.1`
- No embedded username/password
- Never taken from Flutter

---

## Fetch hardening (Cloud Function → backend)

- `redirect: "error"` — do not follow redirects with internal headers
- ~12s timeout via `AbortSignal.timeout` / AbortController
- Fixed path `/api/v1/internal/cloud-function/ping` only (no generic proxy)

---

## Workspace layout

```text
firebase.json                 # Functions only
.firebaserc.example           # template (committed)
.firebaserc                   # local only (gitignored)
functions/
  package.json                # Node 20 + package-lock.json
  src/secureBackendPing.ts
  src/security/*
```

---

## Local verification

Backend:

```bash
npm run test:cloud-function-auth
npm run test:cloud-function-signer-parity
npm run test:cloud-function-ping-route
npm run build
```

Functions:

```bash
cd functions
npm ci
npm test
npm run build
```

Emulator (needs real project + secrets):

```bash
# copy .firebaserc.example → .firebaserc first
npx firebase emulators:start --only functions
```

If project/config unavailable: `EMULATOR_NOT_RUN`.

---

## Do not deploy yet

Phase 2A stops at code + tests. Review before Firebase Functions / VPS deploy / business-route migration.
