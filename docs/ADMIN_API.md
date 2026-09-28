# Admin dashboard API (web only)

**Base URL:** `https://appworkspro.com`  
**Login:** `POST /api/v1/auth/admin/login` with `{ "email", "password" }` from server `.env.local` (`ADMIN_EMAIL` / `ADMIN_PASSWORD` or user created via `npm run seed`).

All `/api/v1/admin/*` routes require:

```http
Authorization: Bearer <admin access_token>
```

Same JSON envelope: `{ "data", "error" }`.

## Main admin routes

| Area | Path |
|------|------|
| Overview KPIs | `GET /api/v1/admin/overview?days=7` |
| Current admin | `GET /api/v1/admin/me` |
| Users | `GET /api/v1/admin/users?page=1&limit=20` |
| User detail | `GET /api/v1/admin/users/{id}/detail` |
| Tokens | `GET /api/v1/admin/tokens` |
| Devices | `GET /api/v1/admin/devices` |
| Looks history | `GET /api/v1/admin/looks-history` |
| Try-on jobs | `GET /api/v1/admin/try-on-jobs` |
| Broadcast push | `GET/POST /api/v1/admin/broadcast` |
| System status | `GET /api/v1/admin/system-status` |
| Audit log | `GET /api/v1/admin/audit-log` |
| Catalog / styles | `GET/PATCH /api/v1/admin/catalog/*` |
| Home feed | `GET/PATCH /api/v1/admin/home-feed` |
| App content | `GET/PATCH /api/v1/admin/app-content` |

Mobile app developers normally **do not** call these routes.

See [API_ENDPOINTS_TABLE.md](./API_ENDPOINTS_TABLE.md) for the full mobile list.
