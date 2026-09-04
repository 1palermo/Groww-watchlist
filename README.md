# Groww Pulse

> Don't just track stocks. Track your investment thesis.

A watchlist where every stock is tagged with *why the user added it* (their "thesis" — e.g. "waiting for profitability," "breakout above ₹500," "dividend play"). A backend job polls prices + news on a schedule, computes a **Meaningful Change Score** for each stock, and runs a **narrow, structured** AI check on any high-scoring news event to see if it matches the user's stated thesis category.

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (Supabase-hosted)
- **Auth**: Supabase Auth (email/password + Google)
- **Market Data**: Finnhub API (quotes + company news)
- **AI**: OpenAI gpt-4o-mini (structured classification only)
- **Scheduler**: node-cron

## Quick Start

### Backend
```bash
cd backend
cp .env.example .env  # fill in your keys
npm install
npm run dev
```

### Frontend
```bash
cd frontend
cp .env.local.example .env.local  # fill in your keys
npm install
npm run dev
```

### Database
Run `backend/src/db/schema.sql` in your Supabase SQL Editor.

## Architecture

- **Change Score Engine**: Rule-based arithmetic (0-100), no ML. Price moves, volume spikes, news events, and target price crossings each contribute to a composite score.
- **Thesis Matching**: AI is used *only* for classifying news headlines against fixed thesis categories. `breakout_target` uses plain numeric comparison — no AI.
- **Every AI verdict is shown next to its source headline** — nothing is a black box.

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/watchlist` | List user's stocks + thesis |
| POST | `/api/watchlist` | Add stock to watchlist |
| DELETE | `/api/watchlist/:id` | Remove stock |
| POST | `/api/thesis` | Add thesis to watchlist item |
| GET | `/api/thesis/:id` | Get thesis for item |
| GET | `/api/feed/since-last-visit` | Main dashboard feed |
| GET | `/api/stock/:symbol/timeline` | Full event history |
| GET | `/api/stock/:symbol/quote` | Latest price |
| POST | `/api/internal/poll-now` | Dev: trigger market poll |
