# Pre-backend audit drop (419 styles)

Used automatically by `npm run assets:sync` / `assets:seed` when these files exist:

| File | Role |
|------|------|
| `BACKEND_ASSET_CATALOG.csv` | style_id → `/media/catalog/...` paths |
| `BACKEND_PROMPT_CATALOG_OPTIMIZED.csv` | style_id → BFL `prompt_command` |
| `PRE_BACKEND_FULL_APP_AUDIT.md` | Flutter app audit (reference only) |

Legacy copies in `.asset-requirements/` are ignored while this folder is present.
