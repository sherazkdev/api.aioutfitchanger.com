# AI Wardrobe — API documentation

| Document | Audience | Format |
|----------|----------|--------|
| [MOBILE_APP_API.md](./MOBILE_APP_API.md) | Android / iOS app developers | Markdown (full detail) |
| [API_ENDPOINTS_TABLE.md](./API_ENDPOINTS_TABLE.md) | Quick lookup | Markdown table |
| [ADMIN_API.md](./ADMIN_API.md) | Admin dashboard (web) | Markdown |
| [AI-Wardrobe-API-Complete.html](./AI-Wardrobe-API-Complete.html) | **Full API + auth + interceptor** | Print or `npm run docs:generate-pdf` |
| [AI-Wardrobe-API-Complete.pdf](./AI-Wardrobe-API-Complete.pdf) | Generated PDF | After `npm run docs:generate-pdf` |
| [MOBILE_AUTH_INTERCEPTOR.md](./MOBILE_AUTH_INTERCEPTOR.md) | 10 min token + OkHttp example | Markdown |
| [AI-Wardrobe-Mobile-API.html](./AI-Wardrobe-Mobile-API.html) | Shorter mobile guide | Print → PDF |

## Base URLs

| Environment | Base URL |
|-------------|----------|
| **Production** | `https://appworkspro.com` |
| **Local** | `http://localhost:3000` |

All paths below are relative to the base URL, e.g. `GET https://appworkspro.com/api/v1/app/metadata`.

## Generate PDF

1. Open `docs/AI-Wardrobe-Mobile-API.html` in Chrome or Edge.
2. `Ctrl+P` → Destination **Save as PDF** → Margins **Default** → Background graphics **On**.

Or read `MOBILE_APP_API.md` in any Markdown viewer.
