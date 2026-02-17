# ProjectHub

ProjectHub is a Phase 1 MVP project management and issue tracking platform built with Next.js App Router, Supabase, and MUI. This repository follows strict TypeScript and architecture guidelines, and ships with a dark-first design system.

## Stack
- Next.js 15+ (App Router)
- React 19+
- TypeScript 5+ (strict)
- Supabase (Postgres + Auth + Storage)
- MUI v6 + Emotion
- Zustand + TanStack Query
- React Hook Form + Zod
- Tiptap, Framer Motion, @dnd-kit

## Requirements
- Node.js 20+
- Supabase project (local or hosted)

## Setup

1. Install dependencies
```
npm install
```

2. Create `.env.local` from the example
```
cp .env.local.example .env.local
```

3. Run Supabase migration
- Apply `src/supabase/migrations/001_initial_schema.sql` to your Supabase database.

4. (Optional) Seed data
- Apply `src/supabase/seed.sql`.
- This seed script is safe to run even if no users exist. It only inserts data when at least one profile is present.

5. Start the dev server
```
npm run dev
```

## Scripts
- `npm run dev` – start development server
- `npm run build` – production build
- `npm run start` – run production server
- `npm run lint` – lint
- `npm run type-check` – strict type check

## Notes
- All UI styles use MUI `sx` or `styled()`.
- All API routes validate input with Zod and enforce auth with Supabase SSR.
- The design system is dark-first with a violet accent palette.

## Deployment (Vercel)
- Set environment variables from `.env.local.example` in Vercel.
- Deploy as a standard Next.js App Router project.

## License
Private
