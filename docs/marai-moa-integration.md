# Marai + MOA_AI_V3 integration guide

Use these steps to connect the Marai frontend to the MOA_AI_V3 FastAPI backend and the shared Supabase project.

## 1) Sync Supabase with the MOA schema
1. Open the Supabase project at `https://fjefpxwetudpcxarlokp.supabase.co`.
2. In the SQL editor, run the full schema from `supabase/schema.sql` in this repo to set up tables, views, functions, RLS, and indexes.
3. Confirm row level security is enabled and that policies exist:
   ```sql
   select * from pg_policies where schemaname = 'public';
   ```
4. Generate a **service role key** for server-side writes and note the existing **anon key** for frontend access under RLS.

## 2) Configure environment variables
Use `docs/railway.env.example` as a reference when wiring services locally or in Railway.

### Backend (MOA_AI_V3)
- `SUPABASE_URL=https://fjefpxwetudpcxarlokp.supabase.co`
- `SUPABASE_KEY=<service_role_key>` for server-to-Supabase operations.
- Optional: `SUPABASE_DREAM_TABLE` if you prefer a custom dream log table name.
- Configure CORS via `ALLOWED_ORIGINS` (Flask) or FastAPI middleware when exposing the backend publicly.

Start the adaptive memory API locally:
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn services.adaptive_memory_service:app --host 0.0.0.0 --port 8000
```

### Frontend (bj63/Marai)
Create or update `.env.local` in this repo:
- `NEXT_PUBLIC_SUPABASE_URL=https://fjefpxwetudpcxarlokp.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>`
- `NEXT_PUBLIC_API_BASE=http://localhost:8000` (FastAPI adaptive memory service)
- `NEXT_PUBLIC_MOA_API_URL=http://localhost:8000` (use the same base unless services are split)

If the frontend still references legacy Flask endpoints, set `NEXT_PUBLIC_API_URL` to that service; otherwise point everything at the FastAPI adaptive memory base.

## 3) Align Supabase types in the frontend
Regenerate Supabase TypeScript types whenever the schema changes:
```bash
supabase gen types typescript --project-id fjefpxwetudpcxarlokp > supabase/types.ts
```
Commit the generated file (or `lib/supabase/types.ts` equivalent) so components stay aligned with AI state, emotion snapshots, quad states, feed/comment, and messaging structures.

## 4) Verify data flows end-to-end
1. Start the MOA_AI_V3 FastAPI app on port 8000.
2. Run the Marai frontend (`npm install && npm run dev`) and sign in (email/password or magic link) to gain RLS access.
3. Post via `/observations` or `/chat` in the UI and confirm Supabase tables (`ai_states`, `marai_emotion_snapshots`, `feed_posts`, `feed_comments`, etc.) receive data.
4. Validate feed and messaging views by reading from `feed_posts`, `feed_comments_view`, `followers_view`, and `messages_view`.

## 5) Deployment notes
- For Railway, copy `docs/railway.env.example` into the project and fill secrets. Expose port 8000.
- Point the frontend deployment at the deployed backend URL (not localhost) and the same Supabase project.
- Keep the Supabase service role key server-side only; the frontend must use the anon key under RLS.

## 6) Common pitfalls
- Missing CORS settings when the frontend runs on a different origin—configure allowed origins in the backend.
- Accidentally using the service role key in the browser—**never** expose it client-side; use the anon key.
- Forgetting to run the latest `supabase/schema.sql`—views/functions/RLS will be missing and API calls will fail.
- Not regenerating Supabase types after schema changes—TypeScript clients may break on new fields.
