# Developer Guide

## Architecture
This project is a Next.js (App Router) Turborepo utilizing a Supabase Postgres backend.

## Local Setup
Due to the dependency graph size, this project requires a robust Node environment for `npm install`.

1. Ensure Node.js v20+ and at least 4GB of RAM allocated to the Node process.
2. Run `npm install` at the workspace root.
3. Apply `presales-command-center-schema.sql` to your Supabase instance.
4. Set `.env.local` in `apps/web`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Run `npm run dev`.

## AI Gateway
To swap AI providers, modify `apps/web/lib/ai-gateway/index.ts`. All AI outputs are strongly typed via Zod schemas in `schemas.ts`. Never inject unvalidated LLM output directly into the DOM.
