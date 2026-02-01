# Vote411 Signs

Track election signage around League City, TX and the surrounding area. Add signs on the map with photos and notes, then find and mark them when it’s time to take them down.

## Features

- **Map** — Leaflet + OpenStreetMap centered on League City (wider area: Friendswood, Dickinson, Clear Lake)
- **Sign in** — Email + password (Supabase Auth)
- **Campaigns** — Create a campaign, share an invite link/code so volunteers can join and see the same signs
- **Add sign** — Pick location on map or use “Use my location”, date, notes, photo (compressed on upload)
- **List and map** — Filter by All / Still up / Taken down; marker clustering on the map
- **Take down** — Confirm before marking as taken down; “Get directions” opens Google/Apple Maps
- **Mobile** — Touch-friendly; “Add to Home Screen” hint for quick access

## Setup

### 1. Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` — Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Your Supabase anon key

Get these from [Supabase Dashboard](https://supabase.com/dashboard) → Project → Settings → API.

### 2. Auth

Sign-in uses **email + password**. No extra setup: create an account from the app login page. (Email confirmation is disabled locally so you can sign in right after sign-up.)

### 3. Database

Run the migration in `supabase/migrations/001_initial.sql` in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste and run).

### 4. Storage

1. In Supabase: **Storage** → **New bucket**.
2. Name: `sign-photos`, set **Public bucket**.
3. Policies (or use the SQL from the migration comment):
   - **Select**: allow public read for `bucket_id = 'sign-photos'`.
   - **Insert**: allow authenticated users for `bucket_id = 'sign-photos'`.

### 5. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create an account (or sign in), create or join a campaign, then add signs.

## Tech

- Next.js 16 (App Router), React 19, TypeScript, Tailwind
- Supabase (Auth, Postgres, Storage)
- Leaflet, react-leaflet, react-leaflet-markercluster, OpenStreetMap
