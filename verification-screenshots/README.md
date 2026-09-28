# Live screenshot verification (production build)

Captured at **1440×900** against `http://localhost:3000` after `npm run build`.

| File | Route | Status |
|------|--------|--------|
| `01-overview.png` | `/admin/overview` | OK — loads KPIs, charts, right panel (empty DB) |
| `02-app-content.png` | `/admin/app-content` | OK — tabs + metadata form + publish actions |
| `03-admin-account.png` | `/admin/account` | OK — profile, password, sessions |
| `04-token-management.png` | `/admin/token-management` | OK — 11 sessions, table + filters |
| `05-notifications.png` | `/admin/notifications` | OK — compose + preview |
| `06-device-registry.png` | `/admin/devices` | OK — empty state (no FCM devices) |
| `07-system-status.png` | `/admin/system` | OK — Mongo connected, integrations not configured |
| `08-user-detail.png` | `/admin/users/6ab4ca3b94f7d4a336d418b7` | OK — admin user detail |

**Not captured:** `/admin/notifications/campaigns/[id]` — no broadcast campaigns in the database.

To re-export a CDP capture:

```powershell
powershell -NoProfile -File .\save-cdp-screenshot.ps1 -CdpJsonPath '<path-to-cdp-json>' -OutPath '.\my-page.png'
```
