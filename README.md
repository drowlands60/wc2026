# ⚽ World Cup 2026 Predictor

A prediction league web app for the FIFA World Cup 2026. Users predict match scores and earn points based on accuracy.

## Points System

| Prediction | Points |
|---|---|
| Exact score (e.g., 2-1 → 2-1) | 3 |
| Correct goal difference (e.g., 2-1 → 3-2) | 2 |
| Correct result (e.g., 2-1 → 3-0) | 1 |

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Row Level Security)
- **Live Scores**: football-data.org API (free tier)
- **Deployment**: Vercel (recommended)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL and anon key from Settings > API

### 2. Football Data API

1. Register at [football-data.org](https://www.football-data.org/client/register)
2. Get your free API key (10 requests/minute)

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for cron jobs)
- `FOOTBALL_DATA_API_KEY` - Your football-data.org API key
- `CRON_SECRET` - A random string to secure your cron endpoints

### 4. Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

### 5. Seed Match Data

Once your API keys are configured, seed the World Cup schedule:

```
GET /api/seed-matches?token=YOUR_CRON_SECRET
```

### 6. Auto-Update Scores

Set up a cron job (e.g., every 5 minutes during match days) to call:

```
GET /api/update-scores?token=YOUR_CRON_SECRET
```

On Vercel, add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/update-scores?token=YOUR_CRON_SECRET",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── seed-matches/    # Populate matches from football-data.org
│   │   └── update-scores/   # Cron: fetch live scores & calculate points
│   ├── auth/callback/       # OAuth callback handler
│   ├── leaderboard/         # League standings
│   ├── login/               # Sign in page
│   ├── matches/             # Match schedule & results
│   ├── predictions/         # User prediction entry
│   └── signup/              # Registration page
├── components/
│   ├── Navbar.tsx
│   └── PredictionForm.tsx
└── lib/supabase/
    ├── client.ts            # Browser Supabase client
    ├── middleware.ts        # Auth session refresh
    └── server.ts            # Server Supabase client
```
