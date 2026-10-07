# VPS production deploy report

**Date:** 2026-10-07  
**Domain:** https://appworkspro.com  
**Verdict:** `DEPLOY BLOCKED BEFORE RESTART` (code pushed; VPS SSH not available from deploy runner)

---

## 1. Deployment architecture

| Item | Value |
|------|--------|
| VPS app path | `/var/www/ai-outfit-changer` (per `deploy/README.md`, `scripts/vps-remote-deploy.mjs`) |
| Node version | Not read on VPS (SSH blocked) — use `node -v` on server |
| Package manager | **npm** (`package-lock.json`, `npm ci` in deploy docs) |
| Process manager | **PM2** |
| Process name | `ai-outfit-changer` |
| App port | **3020** (`127.0.0.1`, `deploy/ecosystem.config.cjs`) |
| Reverse proxy | **Nginx** → upstream `127.0.0.1:3020` (`deploy/nginx/appworkspro.com.conf`) |
| Build mode | Standard **`next start`** (not standalone) |
| Env file loaded | **`.env.local`** merged by PM2 ecosystem loader |

---

## 2. ENV audit

Full inventory: `artifacts/production-env-audit.json`, `PRODUCTION_ENV_AUDIT.md`.

**New ENV variables required: 0**

**No new ENV variables required by Phase 1–4.**

Phase 1–4 relies on existing keys, especially:

- `BFL_API_KEY`, `BFL_API_BASE` — BFL / FLUX / VTO v2
- `MONGODB_URI` — jobs + catalog
- `APP_URL` — HTTPS absolute URLs for couple split garment resolution and result URLs
- `BFL_POLL_MIN_INTERVAL_MS` — optional poll throttle (default in code)
- `JWT_*`, `FIREBASE_*` — unchanged auth/FCM behavior

| ENV | Status (local `.env.local`) | Required | Action |
|-----|------------------------------|----------|--------|
| MONGODB_URI | PRESENT | yes | KEEP |
| JWT_ACCESS_SECRET | PRESENT | yes | KEEP |
| JWT_REFRESH_SECRET | PRESENT | yes | KEEP |
| BFL_API_KEY | PRESENT | yes (try-on) | KEEP |
| APP_URL | VERIFY on VPS = `https://appworkspro.com` | yes | VERIFY_VALUE |
| BFL_API_BASE | OPTIONAL | no | KEEP |
| FIREBASE_* | OPTIONAL (FCM) | no | KEEP |
| BFL_POLL_MIN_INTERVAL_MS | OPTIONAL | no | OPTIONAL |
| NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW | OPTIONAL | no | OPTIONAL |

VPS key presence was **not audited** (no `VPS_SSH_PASS` / SSH key). Re-run: `VPS_SSH_PASS=… npm run audit:production-env -- --vps`.

---

## 3. Git / build

| Step | Result |
|------|--------|
| Previous commit (local before deploy commit) | `6513b26` |
| Deployed commit on VPS | **Not executed** — SSH unavailable |
| Local `npm ci` on VPS | Skipped |
| Local `npm run build` (pre-push) | **PASS** |
| `git push origin main` | See post-report note |

---

## 4. Pre-restart regressions (local, pre-push)

| Suite | Result |
|-------|--------|
| Phase 1 | PASS (11/11) |
| Phase 2 + 419 split | PASS (18/18) |
| Beauty | PASS (4/4) |
| Couple routing | PASS (4/4) |
| Asset validator | PASS (`ok: true`, errors 0) |
| Invalid JSON (local server with new code) | PASS |
| 419 prompts vs **live** API | PASS (419/419, mismatch 0) |

---

## 5. Restart

| Item | Value |
|------|--------|
| Method | **Not run** |
| Process status | Unknown (VPS not reached) |
| Restart loop | **N/A** |

**On VPS after pull:** `chmod +x deploy/vps-production-deploy.sh && ./deploy/vps-production-deploy.sh`  
Or: `pm2 reload ai-outfit-changer --update-env`

**Rollback reference:** `PREVIOUS_COMMIT=6513b26` (update after VPS records current HEAD before pull)

---

## 6. Production E2E (live domain, **current** deployed build)

Ran `npx tsx artifacts/phase4-production-qa.mjs https://appworkspro.com`:

| Test | Generate | Poll | Result |
|------|----------|------|--------|
| top | OK | OK | PASS |
| shirt | OK | OK | PASS |
| bottom | OK | OK | PASS |
| skirt | OK | OK | PASS |
| jacket | OK | OK | PASS |
| arabian | OK | OK | PASS |
| indian | OK | OK | PASS |
| pakistani | OK | OK | PASS |
| couple male | OK | OK | PASS |
| couple female | OK | OK | PASS |
| hair style | OK | OK | PASS |
| hair color | OK | OK | PASS |
| beard | OK | OK | PASS |
| hijab (3) | OK | OK | PARTIAL visual (known) |

Jobs: **16/16** completed; visual grades **13 PASS / 3 PARTIAL** (hijab).

---

## 7. Error-path checks (live)

| Check | Result |
|-------|--------|
| malformed JSON → 400 `INVALID_JSON` | **FAIL** (500 on current prod — fixed in unpushed/pending deploy commit) |
| missing source | PASS (422) |
| invalid style | PASS (422) |
| couple missing gender | PASS (422) |
| HTTPS metadata | PASS |

---

## 8. Production logs

Not inspected (SSH unavailable). After deploy, check: `pm2 logs ai-outfit-changer --lines 100` (redact secrets).

---

## 9. Remaining known limitations

- Hijab FLUX: occasional partial coverage (`women_hijab_05` etc.)
- Mobile app: still on direct BFL until Flutter migrates to backend API
- Catalog PNGs: `public/media/catalog/` is **gitignored** — VPS must run `npm run assets:sync` after pull

---

## 10. Final verdict

**`DEPLOY BLOCKED BEFORE RESTART`**

Reason: VPS deployment steps could not be executed from this environment (no SSH credentials). Local validation and production API E2E against the **existing** build succeeded; git push carries Phase 1–4 code + deploy script.

**Next step for operator:** SSH to VPS, set `PREVIOUS_COMMIT=$(git rev-parse HEAD)`, run `deploy/vps-production-deploy.sh`, re-run `node scripts/production-live-error-paths.mjs https://appworkspro.com` (expect malformed JSON PASS).
