# Production ENV audit

Generated: 2026-10-07T07:36:44.288Z

## Phase 1–4

**No new ENV variables required by Phase 1–4.**

- Phase 1–4 uses existing BFL_API_KEY, BFL_API_BASE, MONGODB_URI, APP_URL for garment URL resolution and try-on.
- Couple split routing requires APP_URL (HTTPS) so resolveGarmentImage can build absolute /media/catalog URLs.
- BFL_POLL_MIN_INTERVAL_MS optional; defaults in pollThrottle.ts.
- No new variables added to src/lib/server/env.ts Zod schema in Phase 1–4.

## Inventory

| ENV | Local status | VPS key | Required | Secret | Action |
|---|---|---|---|---|---|
| ACCESS_TOKEN_TTL_SECONDS | PRESENT | — | false | false | OPTIONAL |
| ADMIN_EMAIL | PRESENT | — | false | false | OPTIONAL |
| ADMIN_PASSWORD | PRESENT | — | false | true | OPTIONAL |
| API_RATE_LIMIT_AUTH_PER_MIN | PRESENT | — | false | false | OPTIONAL |
| APP_URL | INVALID FORMAT | — | true | false | KEEP |
| BFL_API_BASE | PRESENT | — | false | false | OPTIONAL |
| BFL_API_KEY | PRESENT | — | true | true | KEEP |
| BFL_POLL_MIN_INTERVAL_MS | PRESENT | — | false | false | OPTIONAL |
| BROADCAST_SCHEDULER_INTERVAL_MS | PRESENT | — | false | false | OPTIONAL |
| CONTENT_CACHE_TTL_SECONDS | PRESENT | — | false | false | OPTIONAL |
| DEFAULT_SOURCE_LOCALE | PRESENT | — | false | false | OPTIONAL |
| DISABLE_CONTENT_SEED | MISSING | — | false | false | OPTIONAL |
| FIREBASE_CLIENT_EMAIL | PRESENT | — | false | false | OPTIONAL |
| FIREBASE_PRIVATE_KEY | PRESENT | — | false | true | OPTIONAL |
| FIREBASE_PROJECT_ID | PRESENT | — | false | false | OPTIONAL |
| GOOGLE_CLIENT_ID_ANDROID | PRESENT | — | false | false | OPTIONAL |
| GOOGLE_CLIENT_ID_IOS | MISSING | — | false | false | OPTIONAL |
| GOOGLE_CLIENT_ID_WEB | MISSING | — | false | false | OPTIONAL |
| JWT_ACCESS_SECRET | PRESENT | — | true | true | KEEP |
| JWT_REFRESH_SECRET | PRESENT | — | true | true | KEEP |
| LIBRETRANSLATE_URL | PRESENT | — | false | false | OPTIONAL |
| MONGODB_MAX_POOL_SIZE | PRESENT | — | false | false | OPTIONAL |
| MONGODB_URI | PRESENT | — | true | true | KEEP |
| NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW | PRESENT | — | false | false | OPTIONAL |
| NEXT_RUNTIME | MISSING | — | false | false | OPTIONAL |
| NODE_ENV | PRESENT | — | true | false | KEEP |
| PHASE4_BASE_URL | MISSING | — | false | false | VERIFY_VALUE |
| PORT | MISSING | — | false | false | OPTIONAL |
| REFRESH_TOKEN_TTL_SECONDS | PRESENT | — | false | false | OPTIONAL |
| RESET_TOKEN_TTL_HOURS | PRESENT | — | false | false | OPTIONAL |
| USER_AUTH_CACHE_MS | PRESENT | — | false | false | OPTIONAL |
| VPS_APP_ROOT | MISSING | — | false | false | VERIFY_VALUE |
| VPS_HOST | MISSING | — | false | false | VERIFY_VALUE |
| VPS_SSH_PASS | MISSING | — | false | false | VERIFY_VALUE |
| VPS_USER | MISSING | — | false | false | VERIFY_VALUE |

See `artifacts/production-env-audit.json` for file references.
