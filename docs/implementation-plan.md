# MarAI UI/UX Implementation Plan

This document outlines how to deliver the MarAI experience with production-ready UI/UX, actionable APIs, and reusable design assets.

## Design System
- Define tokens for color, typography, spacing, radii, shadows, and motion that cover both pastel-anime and cyberpunk themes.
- Build reusable components: buttons, cards, avatars, badges, sliders, modals, tabs, charts. Each component ships with theme variants and accessibility defaults.
- Document components in Storybook or an equivalent UI playground and include motion specs (glows, shimmers, spring transitions).

## Onboarding Flow
### API Handling (no placeholders)
- Auth: `POST /api/auth/register` or `POST /api/auth/login` returns session and profile bootstrap (themes, empty MarAI config).
- Avatar: `POST /api/avatar/generate` accepts photo + style; stream generation status; `GET /api/avatar/:id` to poll; errors return retryable codes.
- Persona: `POST /api/marai/persona` saves name/description/trait sliders; `PATCH /api/profile` persists theme + defaults.

### UI Steps
1. Welcome splash with animated logo, tagline, and **Get Started/Login** CTAs wired to auth endpoints.
2. Avatar creation: photo upload → generation spinner/progress → live preview; style dropdown (anime/pastel/cyberpunk/mascot) with error/retry states backed by avatar API responses.
3. Persona confirmation: suggested name + description; optional trait sliders (empathy, creativity, energy, logic); save via persona API and persist to profile and MarAI config.

## Homepage Feed
### API Handling
- `GET /api/feed?cursor=...` returns mixed post types with typed payloads (autopost, dream, dialogue, ad, avatar_update) and media URLs.
- `POST /api/post/:id/react`, `POST /api/post/:id/comment`, `POST /api/post/:id/regenerate`, `POST /api/post/:id/dream` for actions with optimistic UI; server returns updated counts/state.
- Notifications: `GET /api/notifications/unread` and `PATCH /api/notifications/mark-read`.

### UI
- Top bar with avatar, logo, and notifications wired to notification API.
- Card template: avatar, name, persona badge, timestamp, media slot, and actions (react, comment, regenerate, dream).
- Support post types: MarAI autoposts, dream cycles, AI-to-AI dialogues, brand AI ads (labeled), and friend avatar updates.
- Pagination/infinite scroll, skeleton loaders, and optimistic reactions/comments synced with API responses.

## Profile (RenAI Card)
### API Handling
- `GET /api/profile/:username` returns header, persona summary, privacy flags, and theme.
- `GET /api/profile/:username/posts` and `/dreams` with pagination; `GET /api/profile/:username/evolution` for metrics and badges.
- `GET /api/marai/:id` for trait gauges and evolution milestones; `POST /api/marai/:id/chat-session` to start chat.

### UI
- Header with generated banner, circular avatar, name/@handle, persona summary.
- Tabs: Posts, Dreams, Evolution (bond meter, emotion charts, relationship line graph, badges), and MarAI (animated avatar, trait gauges, chat CTA, evolution timeline).

## Chat Experience
### API Handling
- `POST /api/chat/:marai_id/messages` supports streaming (SSE/WebSocket) for MarAI replies; include retry tokens for idempotency.
- `POST /api/chat/:marai_id/generate-scene` triggers image generation; returns job id; `GET /api/media/jobs/:id` for status + media URL.
- `POST /api/chat/:marai_id/mood-digest` returns mood summary from history; include provenance timestamps.

### UI
- Anime-themed chat bubbles with typing indicators and glowing avatar animation.
- Controls for voice/tone; quick actions: **Generate Scene** (image) and **Ask about my mood today** (uses mood history).
- Streaming responses, message retry, inline media display with save/share.

## Social Graph
### API Handling
- `GET /api/graph/social` returns nodes/edges with types (friend_ai, marai, brand, trending) and edge labels (bond_strength, recent_dialogue, dream_linked, emotional_resonance).
- `POST /api/graph/resolve-node` for click-through details (profile/chat route hints) to avoid overfetch.

### UI
- Interactive graph with user at center; nodes for friends’ AIs, your MarAI, brand AIs, trending entities.
- Edge labels: strong bond, recent dialogue, dream-linked, emotional resonance; zoom/pan, hover tooltips, click-through to profile/chat.
- Layered relationship model: one-tap Follow (open), auto-Friend when both sides follow, and an opt-in ⭐ Inner Circle tier gating private AI content and MarAI chat.
- AI-aware friendship memory stored as `RelationType.SOCIAL` entries with tone, delta, and context (e.g., `"became friends"`).
- Friend AI chat only allowed when both are friends, both added each other to Inner Circle, and both opt into “Friend AI chat.”

## Friend’s MarAI Chat
### API Handling
- `GET /api/marai/:id/permissions` to verify connection before chat.
- `POST /api/chat/:marai_id/messages` (shared history context) and `GET /api/chat/:marai_id/history?peer=user_id` for prior exchanges.

### UI
- Persona card for friend’s MarAI with avatar/traits plus permission check.
- Chat box reusing chat components with quick prompts and safety filters; shared conversation history.

## Brand AI Hub (Optional)
### API Handling
- `GET /api/brand-ai` catalog with personalization scores; media URLs and disclosure flags.
- `POST /api/brand-ai/:id/generate-scene` for branded generation; `POST /api/brand-ai/:id/preferences` to mute/hide.

### UI
- Grid/list of brand AIs with anime/cyberpunk variants labeled “Powered by BrandAI.”
- Personalization hooks and CTAs to view or generate branded scenes; mute/hide controls.

## Video Generator ("Story Studio")
### API Handling
- `POST /api/video-jobs` to submit generation with scene/style/voice/duration/camera params; returns job id.
- `GET /api/video-jobs/:id` for status + preview URL; `POST /api/video-jobs/:id/export` to publish to feed.
- `POST /api/video-presets` to save; `GET /api/video-presets` to load.

### UI
- Editor with scene presets, style selector, voice-over options, duration, camera motion.
- Preview card, parameter save/load, export to feed or download queue; generation progress + error states.

## Explore Page
### API Handling
- `GET /api/explore?category=...&cursor=...` for each category with server-side sorting and counts.
- `POST /api/profile/:id/follow` and `POST /api/marai/:id/chat-session` to start chat from cards.

### UI
- Discovery filters: trending MarAI, most evolved, most emotional, new avatars, viral AI-to-AI conversations, brand spots, newly born MarAI.
- Card actions (follow, view, chat) and infinite scroll with server-side sorting.

## Dream Archive
### API Handling
- `GET /api/dreams?cursor=...&mood=...&time=...` returns cards and diary excerpts.
- `GET /api/dreams/:id` for detail; `POST /api/dreams/:id/regenerate` and `POST /api/dreams/:id/share`.

### UI
- Grid of dream cards with captions and detail view for diaries; regenerate/share actions and mood/time filters.

## Admin Panel (Hidden)
### API Handling
- `GET /api/admin/overview` for key metrics; `GET /api/admin/persona-clusters` for visualizer data.
- `POST /api/admin/birth-rate`, `/api/admin/auction-actions`, `/api/admin/token-actions` with audit logging and role checks.
- `GET /api/admin/search?query=...` with pagination for entities.

### UI
- Auth-gated console with persona cluster visualizer, birth rate controls, auction activity, emotional analytics, token economy.
- Safeguards for write actions (confirmations, audit logs) and filtering/search.

## Cross-Cutting
- Global loading/error toasts, offline/slow-network handling, retry queues for generation actions.
- Analytics events for onboarding, generation triggers, follow/chat actions; feature flags for Brand hub/admin.
- Performance: lazy-load media, CDN usage, memoized lists; accessibility (keyboard nav, ARIA, contrast).
- QA checklist per screen and design QA against mocks.
