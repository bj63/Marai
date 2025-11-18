# Manual QA script

Use this checklist after wiring real API credentials into `.env`.

## Onboarding & auth
- Load `/login` and trigger **Continue** to hit `POST /api/auth/login`; confirm toast success.
- Attempt login with network disabled or invalid keys and verify error toast and state reset.

## Avatar creation
- In Social Graph → Avatar generation:
  - Upload a reference, choose a style, and click **Generate avatar** (POST `/api/avatar/generate`).
  - Confirm status text transitions from submitting → queued → ready as `/api/avatar/{id}` polling succeeds.
  - Force a failure (cancel server, bad keys) and confirm error toast plus retry button re-polls.

## Persona + MarAI profile
- Submit persona sliders in onboarding (index) to call `POST /api/marai/persona`; confirm toast/success messaging.

## Feed
- Scroll feed and validate `GET /api/feed` pagination; ensure the empty state is replaced by fallback only on failure.
- Click react/comment/regenerate/dream actions and confirm optimistic bump then rollback + toast on simulated failure.

## Post detail interactions
- For any feed post ID, trigger the optimistic action buttons and verify requests hit `/api/post/:id/*` endpoints.

## Chat streaming
- Open `/chat/{maraiId}` and send a message; ensure streaming from `/api/chat/{maraiId}/messages` updates bubbles.
- Simulate stream drop (disconnect) and confirm toast plus retry restores streaming.
- Request mood digest (`POST /api/chat/{maraiId}/mood-digest`) and scene generation with job polling.

## Social graph
- Ensure `GET /api/graph/social` populates nodes; toggle follow/inner circle and check gate rules for chat CTA.
- Verify relational memory posts succeed when follow state changes.

## Notifications
- Trigger notification fetch and **Mark read** to exercise `/api/notifications/unread` and `/api/notifications/mark-read`.

## Profile tabs
- Navigate profile tabs to confirm cached data remains consistent after feed or graph operations.
