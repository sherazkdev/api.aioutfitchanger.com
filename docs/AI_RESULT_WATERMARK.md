# AI result watermark (free vs premium)

## Approach

**Backend post-processing** with `sharp` when persisting try-on result images to `/uploads/looks/`.  
No prompt/model watermark (avoids BFL cost/quality/reliability issues).

## Trigger

1. `POST /try-on/generate` (BytePlus sync path) → `persistLookImageUrl`
2. `GET /try-on/jobs/:id` when BFL completes → `ensureJobResultPersisted` → `persistLookImageUrl`
3. `POST /history` when saving a remote result URL → `persistLookImageUrl`

Already-hosted `/uploads/looks/...` URLs are not re-processed.

## Free vs premium

| User | Watermark |
|------|-----------|
| `subscription_plan: free` (default) | ON |
| `subscription_plan: premium` | OFF |
| `role: admin` | OFF |

`GET /users/me` → `subscription_plan`  
Admin: `PATCH /admin/users/:id` `{ "subscription_plan": "premium" }`

## Env

- `TRY_ON_WATERMARK_ENABLED` — `0` / `false` / `off` disables globally (default: on)

## Visual

Bottom-right pill: sparkle icon + `AI Generated · Outfit Changer` (letter-spaced HUD), dark gradient background, thin light stroke, white text; rasterized at 3× then downscaled. Scales with image width.
