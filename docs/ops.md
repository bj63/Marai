# Operations guide

## Setup
- Copy `.env.example` to `.env` and set `NEXT_PUBLIC_API_BASE_URL` plus `NEXT_PUBLIC_API_KEY` when hitting a real backend.
- Optionally inject runtime config for static HTML by defining `window.__MARAI_CONFIG` or a `<script id="marai-config" type="application/json">` block before `shared.js`:
  ```html
  <script id="marai-config" type="application/json">
    {
      "apiBaseUrl": "https://api.marai.gg",
      "featureFlags": { "brandHub": true, "adminPanel": false },
      "roles": ["member"],
      "corsAllowedOrigins": ["https://app.marai.gg"],
      "maxUploadBytes": 5242880
    }
  </script>
  ```

## Running locally
- No build step is required; the prototype is static.
- Serve the `frontend/` directory via any static server (examples):
  - `python -m http.server 4173 --directory frontend`
  - `npx serve frontend`
- The Next.js-style `src/` directory consumes the same `.env` values when bundled elsewhere; ensure `NEXT_PUBLIC_*` variables are exposed.

## Environment variables
- `NEXT_PUBLIC_API_BASE_URL` / `API_BASE_URL`: full base URL for REST calls.
- `NEXT_PUBLIC_API_KEY` / `API_KEY`: bearer token injected into requests when present.
- Feature flags are provided at runtime through `window.__MARAI_CONFIG.featureFlags` or the JSON block above (Brand Hub/Admin toggles).

## Build & verification commands
- Static prototype: none required beyond serving the `frontend/` folder.
- Optional lint for typed source (if Next.js shell is used): `npm run lint` after installing dependencies.

## Smoke-test checklist (pre-release)
- Validate onboarding: login/register flows hit `/api/auth/*`, tokens persist to session storage, and a profile fetch succeeds or fails gracefully.
- Avatar upload rejects files above the configured size and honors style selection before calling `/api/avatar/generate`.
- Persona save and theme persist calls return success toasts; malformed inputs surface validation errors.
- Feed, chat, and explore panels load mock or live data without console errors; offline banner queues actions until reconnected.
- Admin navigation is hidden or blocked without the admin role; all admin forms require confirmation and respect feature flags.
- Social graph cards enforce Inner Circle + opt-in for Friend AI chat before starting `/api/friend-ai/*` sessions.
- CORS allowlist and API base URL are set correctly for the deployment origin.

## Security review highlights
- Tokens default to session storage; opt into persistent storage via `allowLocalStorageTokens` only when acceptable for the deployment surface.
- API requests are prefixed by the configured base URL and checked against `corsAllowedOrigins` before dispatch.
- Form inputs use light validation to reject oversized or empty values, and friend AI chat requires mutual Inner Circle plus opt-in before invoking chat endpoints.
- Avatar uploads enforce the configured `maxUploadBytes` limit to prevent oversized payloads.
