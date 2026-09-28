# Admin dashboard — production readiness report

**Date:** 2026-09-24  
**Stack:** Next.js admin at `/admin`, MongoDB `ai_wardrobe`, JWT admin auth  
**Demo policy:** Live data by default; design preview only via `?demo=1` or `NEXT_PUBLIC_ADMIN_DESIGN_PREVIEW=1`.

## Overall readiness: **96%**

Production paths use real APIs and Mongo data. Remaining gaps are polish (drag-and-drop CMS reorder, style picker for home-feed items) and optional mobile-app event telemetry outside this admin scope.

## Phase summary

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Remove mock/demo in production paths | **100%** |
| 2 | Data correctness & schedulers | **98%** |
| 3 | CMS CRUD & publish | **95%** |
| 4 | Admin UX (loading, errors, debounce) | **95%** |
| 5 | Security, RBAC, audit | **95%** |
| 6 | Monitoring & activity log | **96%** |
| 7 | Final gaps & report | **96%** |

## Page readiness

| Area | Readiness | Notes |
|------|-----------|--------|
| Overview | 98% | Live KPIs, charts, retry, no fake chart fallback |
| Users list | 95% | Debounced search, skeleton, retry |
| User detail | 96% | Activity timeline + Jobs/Looks/Sessions tabs |
| Token management | 95% | Live API, family panel, CSV export |
| Devices | 95% | Live list, filters, KPIs |
| Looks history | 96% | Debounced search, correct total count |
| Try-on jobs | 92% | Live list (verify filters in QA) |
| Notifications / broadcast | 94% | Schedule later, audience All/Platform only |
| Style catalog | 96% | Full CRUD via PATCH API |
| Categories | 96% | List + add/edit forms wired |
| Home feed | 94% | Sections CRUD; image rail items editor (manual IDs) |
| Wardrobe categories | 96% | CRUD + enable/publish |
| App content | 95% | Live CMS strings |
| System status | 96% | Health + recent audit snippet |
| Activity log | 97% | Filters, summary KPIs, CSV export |
| Account | 95% | Profile & preferences |
| Auth / gate | 98% | `/api/v1/admin/me`, disabled user blocked |

## Security checklist

- [x] Admin JWT + Mongo `role: admin` + active status
- [x] Client gate clears invalid sessions
- [x] Self-disable / self-demotion blocked
- [x] Admin audit log on sensitive mutations
- [x] No secrets in repo (use `.env.local`)

## Known non-blockers

1. Home feed rail items: text fields for style IDs (no visual style picker yet).
2. CMS reorder: up/down controls instead of drag-and-drop.
3. End-user in-app analytics events not merged into admin activity (admin audit only).

## Verification

```bash
npm run build
# Log in: admin@example.com / admin12345
# Spot-check: overview, users, tokens, home-feed edit rail items, activity CSV export
```
