-- Users are managed by Supabase Auth; we just reference their UUID.

CREATE TABLE IF NOT EXISTS watchlist_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    symbol TEXT NOT NULL,
    added_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, symbol)
);

CREATE TABLE IF NOT EXISTS thesis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    watchlist_item_id UUID REFERENCES watchlist_items(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('waiting_for_profitability', 'breakout_target', 'long_term_growth', 'dividend_play', 'sector_research')),
    custom_note TEXT,
    target_price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'validated', 'invalidated'))
);

CREATE TABLE IF NOT EXISTS price_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    price NUMERIC NOT NULL,
    volume BIGINT,
    fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS news_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    headline TEXT NOT NULL,
    source_url TEXT,
    published_at TIMESTAMPTZ,
    plain_summary TEXT,
    fetched_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS scored_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL,
    event_type TEXT NOT NULL,
    news_event_id UUID REFERENCES news_events(id),
    change_score NUMERIC NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS thesis_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thesis_id UUID REFERENCES thesis(id) ON DELETE CASCADE,
    scored_event_id UUID REFERENCES scored_events(id),
    verdict TEXT NOT NULL,
    ai_reasoning TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_last_seen (
    user_id UUID PRIMARY KEY,
    last_seen_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS one_open_thesis_per_item
    ON thesis (watchlist_item_id) WHERE status = 'open';
CREATE INDEX IF NOT EXISTS price_snapshots_symbol_fetched_at
    ON price_snapshots (symbol, fetched_at DESC);
CREATE INDEX IF NOT EXISTS scored_events_symbol_created_at
    ON scored_events (symbol, created_at DESC);
