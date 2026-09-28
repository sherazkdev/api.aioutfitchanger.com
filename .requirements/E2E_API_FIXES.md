# End-to-end API hardening (2026-09-25)

## Issues fixed

| Issue | Fix |
|-------|-----|
| User JWT got `403` on `/users/me`, `/history`, FCM | `requireAuth` only enforced admin when role is `admin`, not when `admin` is in allowed list |
| BFL start response has no `status` | `mapBflStatus(undefined)` → safe default `pending` |
| `BFL_API_KEY` only in `.env.example` | Use `npm run sync:env` → copies missing keys to `.env.local`; generate returns clear `503` if missing |
| `/uploads/...` 404 after runtime save | Rewrite `/uploads/*` → `GET /api/v1/files/*` reads from `public/uploads` |
| Mobile needs full image URLs | `result_image_absolute_url`, `image_absolute_url` on try-on job + history |
| Try-on poll brittle | `extractBflResultUrl`, BFL statuses `Ready` / `Pending` |
| Persist failure broke poll | Persist errors are retried; BFL URL kept until save succeeds |

## Verify locally

```bash
npm run sync:env
npm run build
npx next start -p 3000
npm run test:api      # 53 smoke tests → .requirements/API_TEST_PROOF.md
npm run test:tryon    # style + person → completed job + absolute image URL
```

## Secrets

Keep **BFL** and **Firebase** keys in `.env.local` only. Do not commit real keys in `.env.example`.
