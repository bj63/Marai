# MarAI Experience App

This repository now ships a runnable Next.js application for the MarAI experience (onboarding, feed, profile, chat, social graph, explore, dream archive, and admin control surfaces). The legacy static prototype in `frontend/` is still available for reference, but the default entry point is the typed app under `src/`.

## Running locally

1. Copy `.env.example` to `.env` and set `NEXT_PUBLIC_API_BASE_URL` / `NEXT_PUBLIC_API_KEY` for real API calls.
2. Install dependencies: `npm install`.
3. Start the app: `npm run dev` (defaults to port 3000).

## Building for production

- Run `npm run build` followed by `npm start` to serve the optimized build.
- The included `Dockerfile` builds a standalone production image suitable for Railway or similar hosts.

## Structure

- `src/app` – app router entry points for landing, login, feed, profile, chat, and social graph routes.
- `src/components` – shared UI (top bar, nav rail, toasts, feed helpers, route guards, etc.).
- `src/lib` – API client and session bootstrap utilities.
- `src/providers` – theming, toast, and session context providers.
- `src/styles` – global styles and design tokens.
- `frontend/` – the legacy static HTML prototype (kept for reference only).
- `docs/implementation-plan.md` / `docs/ops.md` – prior plans and ops notes.

See `docs/ops.md` for environment variables, runtime config examples, and a smoke-test checklist.
