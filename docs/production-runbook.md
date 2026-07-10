# Production Runbook

## Backend Deploy

The backend is deploy-ready with:

- `backend/Dockerfile`
- `render.yaml`
- public health endpoint: `GET /api/health`

Recommended first target: Render using the checked-in `render.yaml` blueprint.

Required host secrets:

| Variable | Purpose |
| --- | --- |
| `DB_URL` | Supabase PostgreSQL JDBC URL |
| `DB_USERNAME` | Supabase database username |
| `DB_PASSWORD` | Supabase database password |
| `JWT_SECRET` | Long random JWT signing secret |
| `JWT_EXPIRATION_SECONDS` | Session lifetime, default `604800` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins |
| `GEMINI_API_KEY` | Gemini API key |
| `GEMINI_MODEL` | Default `gemini-2.5-flash` |

Post-deploy checks:

```bash
curl https://BACKEND_DOMAIN/api/health
API_BASE_URL=https://BACKEND_DOMAIN/api npm run smoke:api
```

## Mobile/Web Production Build

The Expo production setup is deploy-ready with:

- `eas.json`
- Android package: `com.skinshelf.app`
- iOS bundle id: `com.skinshelf.app`
- app icon, adaptive icon and splash configured in `app.json`
- camera permission copy configured for scanner/product-add flow

Before cloud builds, set:

```bash
EXPO_PUBLIC_API_URL=https://BACKEND_DOMAIN/api/auth
```

Preview Android build:

```bash
npx eas-cli build --profile preview --platform android
```

Production Android build:

```bash
npx eas-cli build --profile production --platform android
```

Production iOS build:

```bash
npx eas-cli build --profile production --platform ios
```

## Final QA Scope

- Web smoke: login, home, scanner route, manual product add, assistant.
- Android emulator smoke: login/session, home, scanner, manual product add, assistant.
- Real device smoke: same flows plus camera permission and physical barcode scan.
- Failure checks: backend unavailable, unknown barcode, Gemini fallback, DB connection failure.

## Current Blockers

- Real backend deploy requires a logged-in hosting account and host-level secret entry.
- EAS cloud build requires Expo account login and project credentials.
- Real device testing requires a connected physical Android/iOS device.
