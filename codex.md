# Nova Codex Guide
  _Last updated: 2025-10-27_

  ## Quick Context
  - **What**: Nova is a Next.js 14 LLM chat app that plants trees via Ecologi—full PRD in `prd.md`.
  - **Why this file**: Working log for Codex sessions. Update it whenever you add major features or change infra.
  - **Companion docs**: `prd.md` (product spec) and `CLAUDE.md` (deep dive). Codex.md stays concise and actionable.

  ## Current State
  - Repo branch: `feature/env-contract-supabase-healthcheck`.
  - Environment contract + Supabase helpers live in `src/env.ts` and `src/lib/supabase.ts`.
  - `/api/healthz` verifies env secrets and Supabase connectivity.
  - Supabase Postgres schema + RLS deployed (tables: `profiles`, `conversations`, `messages`, `usage_events`, `counters`, `purchases`; indexes + trigger;
  counters row seeded).
  - Magic-link auth fully wired:
    - Supabase Email provider enabled with redirect `http://localhost:3000/auth/callback`.
    - `app/layout.tsx` wraps app in `SupabaseProvider`.
    - `src/components/supabase-provider.tsx` exposes client/session context.
    - `app/page.tsx` renders magic-link sign-in form + sign-out state.
    - `app/auth/callback/route.ts` exchanges code for session and upserts `profiles`.
  - Manual test 2025-10-27: magic link succeeded; Supabase `profiles` table shows the user.

  ## Environment Setup
  - `.env.local` (hidden file) must define:
    - `NEXT_PUBLIC_SUPABASE_URL`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Other keys (OpenRouter, Ecologi, UploadThing) remain blank for now.
  - After editing `.env.local`, restart `npm run dev`.

  ## Supabase Notes
  - URL Configuration → Site URL: `http://localhost:3000`; Additional redirect: `http://localhost:3000/auth/callback` (add port 3001 variant if needed).
  - Counters seed (rerun if needed):
    ```sql
    insert into public.counters (id) values (1)
    on conflict (id) do nothing;

  - Auth email templates untouched (default Supabase copy is fine for dev).

  ## Local Dev Workflow

  1. cd ~/Nova
  2. npm install (first run) / npm run dev
  3. Visit http://localhost:3000/api/healthz to confirm env + DB.
  4. Sign in via magic link to verify cookies + profile upsert.
  5. Keep npm run lint and npm run typecheck green before commits.

  ## Active Workstream & Next Steps

  1. Design Claude-inspired chat shell:
      - Layout with conversation rail, header counters, responsive behavior.
      - Use session context to gate content (show chat UI only when signed in).
  2. Implement chats backend:
      - Supabase data fetch for conversations/messages.
      - /api/chat streaming via OpenRouter.
      - Token accounting + tree counter updates.
  3. Add tree counter UI + toast feedback once usage events are recorded.
  4. Later phases: UploadThing for images, Ecologi settlement cron, /impact page, mobile polish (see CLAUDE.md for full roadmap).

  ## Maintenance

  - Update “Current State” and “Next Steps” whenever significant progress happens.
  - Record migration or infra changes with dates.
  - Remove temporary .txt scaffolding files from the repo (app:layout.tsx.txt, etc.) now that real files exist.