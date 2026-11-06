# DARKTEC Network

A separate Next.js application scaffold inside the existing DARKTEC Entertainment repository. The public GitHub Pages website remains independent.

## Current status

- Next.js App Router foundation and TypeScript configuration.
- DARKTEC visual foundation and network overview.
- Supabase browser/server client factories.
- Email/password sign-in interface (requires a configured Supabase project).
- Database migration is in `../supabase/migrations/`.
- No Supabase project is connected and no credentials are committed.

## Run locally

1. Install Node.js 20 or later.
2. From this directory run `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add the Supabase project URL and anon/public key to `.env.local`.
5. Run `npm run dev`.

## Deploy

Deploy this directory as the project root on a Next.js-compatible host such as Vercel. Add the two public Supabase environment variables in the host's encrypted environment settings. Do not add service-role keys to browser-visible variables, source files, or GitHub commits.

## Backend setup still required

- Create the Supabase project and configure allowed redirect URLs.
- Apply the SQL migration in `../supabase/migrations/`.
- Verify Row Level Security policies with separate test accounts.
- Configure email confirmation, password reset and abuse controls.
- Add protected member routes and server-side authorization before opening registration.
- Configure deployment domain and production environment variables.

The sign-in page is an integration entry point, not a claim that production authentication is already live.