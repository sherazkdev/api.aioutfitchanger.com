# API endpoints — quick table

**Base:** `https://appworkspro.com`  
**Envelope:** `{ "data": …, "error": null }` or `{ "data": null, "error": { "code", "message" } }`  
**Auth:** `Authorization: Bearer <access_token>` (unless noted Public)

## Mobile app (primary)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/app/metadata` | Public | App name, version, feature flags |
| GET | `/api/v1/languages` | Public | Supported languages |
| GET | `/api/v1/onboarding/pages` | Public | Onboarding screens |
| GET | `/api/v1/home/feed?gender=men\|women` | Public | Home sections & style cards |
| GET | `/api/v1/catalog/{categoryId}?tab=&gender=` | Public | Styles for try-on (`virtual_try_on`) |
| GET | `/api/v1/wardrobe/categories?gender=` | Public | Wardrobe browse categories |
| GET | `/api/v1/wardrobe/looks?page=&limit=` | User | User wardrobe looks |
| POST | `/api/v1/auth/register` | Public | Email sign-up |
| POST | `/api/v1/auth/login` | Public | Email sign-in (app users only) |
| POST | `/api/v1/auth/google` | Public | Google `id_token` sign-in |
| POST | `/api/v1/auth/refresh` | Public | New access token |
| POST | `/api/v1/auth/logout` | User | Revoke session |
| POST | `/api/v1/auth/forgot-password` | Public | Send reset email |
| POST | `/api/v1/auth/reset-password` | Public | Set new password with token |
| GET | `/api/v1/users/me` | User | Profile |
| PATCH | `/api/v1/users/me` | User | Update display name |
| DELETE | `/api/v1/users/me` | User | Delete account |
| GET | `/api/v1/users/me/preferences` | User | Preferences |
| PATCH | `/api/v1/users/me/preferences` | User | Update preferences |
| POST | `/api/v1/users/me/avatar` | User | Upload avatar |
| POST | `/api/v1/users/me/fcm-token` | User | Register FCM (legacy path) |
| POST | `/api/v1/devices/register` | User | Register FCM + device |
| POST | `/api/v1/try-on/generate` | User | Start AI try-on job |
| GET | `/api/v1/try-on/jobs/{jobId}` | User | Poll job status / result |
| DELETE | `/api/v1/try-on/jobs/{jobId}` | User | Cancel job |
| GET | `/api/v1/history?page=&limit=&favorites=` | User | Saved looks list |
| POST | `/api/v1/history` | User | Save look to history |
| GET | `/api/v1/history/{id}` | User | Look detail |
| PATCH | `/api/v1/history/{id}` | User | Favorite / wardrobe flags |
| DELETE | `/api/v1/history/{id}` | User | Delete one look |
| DELETE | `/api/v1/history` | User | Clear history |
| GET | `/api/v1/files/{path}` | Public* | Serve uploaded images |
| GET | `/uploads/{path}` | Public* | Rewrite to `/api/v1/files/…` |

\* Files are public read; paths are opaque UUIDs under `/uploads/looks/…`.

## Admin dashboard only

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/admin/login` | Public (admin email/password) |
| GET | `/api/v1/admin/*` | Admin Bearer |

See [ADMIN_API.md](./ADMIN_API.md).
