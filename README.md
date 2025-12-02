# Marai Hybrid HUD

This project scaffolds the hybrid Heads-Up Display described in the Marai plan: a Three.js canvas running behind a DOM overlay that mirrors the adaptive memory websocket signals from the MOA_AI_V3 backend (or a Supabase-only realtime feed).

## Getting started

1. Install dependencies (already captured in `package-lock.json`):
   ```bash
   npm install
   ```
2. Set environment variables to point at your backend (or keep the defaults):
   - `NEXT_PUBLIC_API_BASE` – HTTP base for the adaptive memory service (defaults to `http://localhost:8000`).
   - `NEXT_PUBLIC_MARAI_USER_ID` – User identifier used to open `ws://<base>/ws/{user_id}` (defaults to `demo-user`).
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Project layout

```
src/
  components/
    canvas/       # Three.js scene + helpers
    dom/          # HTML HUD overlays
    layout/       # Page-level view that layers canvas + DOM
  hooks/          # Streaming hooks (adaptive memory websocket)
  store/          # Zustand state shared by canvas + DOM
  pages/          # Next.js entrypoints
```

- `next.config.mjs` adds GLSL loader support and a remote image policy for holographic textures.
- `useMaraiStream` opens the adaptive memory websocket and hydrates `useMaraiStore` with transcripts, AI responses, audio packets, tags, and stress levels.
- `View` composes the `Scene` (Three/Fiber) with `HUDOverlay` (Framer Motion + Lucide) so visuals react to the same signals.

## Backend alignment

The UI expects the backend to emit events shaped like:

```json
{ "type": "user-transcript", "payload": { "text": "...", "metadata": {} } }
{ "type": "ai-response", "payload": { "text": "...", "metadata": {}, "tags": [], "emotion_intensity": 0.4 } }
{ "type": "ai-audio", "payload": { "audio": "base64..." } }
```

Messages entered in the HUD are sent back over the websocket as:

```json
{ "message": "...", "metadata": { "source": "hud-overlay" } }
```

If you prefer to drive the HUD with Supabase realtime instead of MOA_AI_V3, swap `useMaraiStream` for a Supabase listener that writes into the same Zustand store.
