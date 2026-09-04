import { Pool } from 'pg';
import { env } from './env';
import crypto from 'crypto';

interface InMemoryDb {
  watchlist_items: Array<{
    id: string;
    user_id: string;
    symbol: string;
    added_at: string;
  }>;
  thesis: Array<{
    id: string;
    watchlist_item_id: string;
    category: string;
    custom_note: string | null;
    target_price: number | null;
    created_at: string;
    status: string;
  }>;
  price_snapshots: Array<{
    id: string;
    symbol: string;
    price: number;
    volume: number | null;
    fetched_at: string;
  }>;
  news_events: Array<{
    id: string;
    symbol: string;
    headline: string;
    source_url: string | null;
    published_at: string | null;
    plain_summary: string | null;
    fetched_at: string;
  }>;
  scored_events: Array<{
    id: string;
    symbol: string;
    event_type: string;
    news_event_id: string | null;
    change_score: number;
    details: any;
    created_at: string;
  }>;
  thesis_matches: Array<{
    id: string;
    thesis_id: string;
    scored_event_id: string;
    verdict: string;
    ai_reasoning: string | null;
    created_at: string;
  }>;
  user_last_seen: Array<{
    user_id: string;
    last_seen_at: string;
  }>;
}

const memoryDb: InMemoryDb = {
  watchlist_items: [],
  thesis: [],
  price_snapshots: [],
  news_events: [],
  scored_events: [],
  thesis_matches: [],
  user_last_seen: [],
};

// Seed realistic demo data into in-memory store
function seedInMemoryData() {
  const devUserId = 'dev-user-00000000-0000-0000-0000-000000000000';
  
  const stocks = [
    { symbol: 'ZOMATO', category: 'waiting_for_profitability', note: 'Waiting for sustained quarterly profit', price: 195.6, target: null },
    { symbol: 'TATAMOTORS', category: 'breakout_target', note: 'Breakout above major resistance', price: 712.5, target: 700 },
    { symbol: 'RELIANCE', category: 'long_term_growth', note: 'New energy & telecom growth', price: 2540.0, target: null },
    { symbol: 'AAPL', category: 'dividend_play', note: 'Cash return & capital dividend expansion', price: 232.0, target: null },
  ];

  for (const s of stocks) {
    const wiId = crypto.randomUUID();
    const now = new Date();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    memoryDb.watchlist_items.push({
      id: wiId,
      user_id: devUserId,
      symbol: s.symbol,
      added_at: oneDayAgo,
    });

    const thId = crypto.randomUUID();
    memoryDb.thesis.push({
      id: thId,
      watchlist_item_id: wiId,
      category: s.category,
      custom_note: s.note,
      target_price: s.target,
      created_at: oneDayAgo,
      status: 'open',
    });

    // Snapshots
    memoryDb.price_snapshots.push({
      id: crypto.randomUUID(),
      symbol: s.symbol,
      price: s.price * 0.96,
      volume: 4500000,
      fetched_at: oneDayAgo,
    });
    memoryDb.price_snapshots.push({
      id: crypto.randomUUID(),
      symbol: s.symbol,
      price: s.price,
      volume: 12000000,
      fetched_at: oneHourAgo,
    });

    // News & scored events
    if (s.symbol === 'ZOMATO') {
      const nId = crypto.randomUUID();
      memoryDb.news_events.push({
        id: nId,
        symbol: 'ZOMATO',
        headline: 'Zomato reports first profitable quarter with 138 Cr PAT surge',
        source_url: 'https://groww.in/news/zomato-q1-results',
        published_at: oneHourAgo,
        plain_summary: 'Zomato recorded its highest quarterly profit ever, beating analyst estimates.',
        fetched_at: oneHourAgo,
      });

      const seId = crypto.randomUUID();
      memoryDb.scored_events.push({
        id: seId,
        symbol: 'ZOMATO',
        event_type: 'news',
        news_event_id: nId,
        change_score: 78,
        details: { price: s.price, pct_move: 5.4, volume_multiplier: 2.8 },
        created_at: oneHourAgo,
      });

      memoryDb.thesis_matches.push({
        id: crypto.randomUUID(),
        thesis_id: thId,
        scored_event_id: seId,
        verdict: 'validated',
        ai_reasoning: 'Earnings report confirms company reached first sustained net profitability.',
        created_at: oneHourAgo,
      });
    } else if (s.symbol === 'TATAMOTORS') {
      const seId = crypto.randomUUID();
      memoryDb.scored_events.push({
        id: seId,
        symbol: 'TATAMOTORS',
        event_type: 'target_hit',
        news_event_id: null,
        change_score: 75,
        details: { price: s.price, pct_move: 4.2, target: 700 },
        created_at: oneHourAgo,
      });

      memoryDb.thesis_matches.push({
        id: crypto.randomUUID(),
        thesis_id: thId,
        scored_event_id: seId,
        verdict: 'validated',
        ai_reasoning: 'Price crossed breakout target of ₹700 (Current: ₹712.50).',
        created_at: oneHourAgo,
      });
    } else if (s.symbol === 'AAPL') {
      const nId = crypto.randomUUID();
      memoryDb.news_events.push({
        id: nId,
        symbol: 'AAPL',
        headline: 'Apple announces 8% dividend boost and new $110B share buyback authorization',
        source_url: 'https://news.example.com/apple-dividend',
        published_at: oneHourAgo,
        plain_summary: 'Apple increased shareholder dividend payout and authorized its largest buyback yet.',
        fetched_at: oneHourAgo,
      });

      const seId = crypto.randomUUID();
      memoryDb.scored_events.push({
        id: seId,
        symbol: 'AAPL',
        event_type: 'news',
        news_event_id: nId,
        change_score: 65,
        details: { price: s.price, pct_move: 2.1 },
        created_at: oneHourAgo,
      });

      memoryDb.thesis_matches.push({
        id: crypto.randomUUID(),
        thesis_id: thId,
        scored_event_id: seId,
        verdict: 'validated',
        ai_reasoning: 'Announced 8% dividend increase validating the dividend yield expansion thesis.',
        created_at: oneHourAgo,
      });
    }
  }

  // Set user last seen to 2 hours ago so feed shows items
  memoryDb.user_last_seen.push({
    user_id: devUserId,
    last_seen_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  });
}

seedInMemoryData();

export const pool = env.DATABASE_URL
  ? new Pool({
      connectionString: env.DATABASE_URL,
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    })
  : null;

export async function query(text: string, params: any[] = []): Promise<{ rows: any[] }> {
  // If Postgres connection is available, use it
  if (pool) {
    try {
      const client = await pool.connect();
      try {
        const result = await client.query(text, params);
        return result;
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn('[Postgres query failed, falling back to memory store]:', err?.message);
    }
  }

  // Fallback memory emulator for zero-config out-of-the-box local operation
  return handleInMemoryQuery(text, params);
}

function handleInMemoryQuery(sql: string, params: any[]): { rows: any[] } {
  const norm = sql.replace(/\s+/g, ' ').trim();

  // 1. SELECT wi.* ... FROM watchlist_items wi LEFT JOIN thesis ...
  if (norm.includes('FROM watchlist_items wi') && norm.includes('LEFT JOIN thesis t')) {
    const userId = params[0];
    const items = memoryDb.watchlist_items.filter(w => !userId || w.user_id === userId);
    const rows = items.map(item => {
      const thesis = memoryDb.thesis.find(t => t.watchlist_item_id === item.id && t.status === 'open');
      return {
        id: item.id,
        user_id: item.user_id,
        symbol: item.symbol,
        added_at: item.added_at,
        thesis_id: thesis?.id || null,
        thesis_category: thesis?.category || null,
        thesis_note: thesis?.custom_note || null,
        thesis_target_price: thesis?.target_price || null,
        thesis_status: thesis?.status || null,
      };
    });
    return { rows };
  }

  // 2. INSERT INTO watchlist_items
  if (norm.startsWith('INSERT INTO watchlist_items')) {
    const userId = params[0];
    const symbol = String(params[1]).toUpperCase();
    const existing = memoryDb.watchlist_items.find(w => w.user_id === userId && w.symbol === symbol);
    if (existing) {
      return { rows: [existing] };
    }
    const item = {
      id: crypto.randomUUID(),
      user_id: userId,
      symbol,
      added_at: new Date().toISOString(),
    };
    memoryDb.watchlist_items.unshift(item);
    return { rows: [item] };
  }

  // 3. DELETE FROM watchlist_items
  if (norm.startsWith('DELETE FROM watchlist_items')) {
    const id = params[0];
    const userId = params[1];
    const idx = memoryDb.watchlist_items.findIndex(w => w.id === id && (!userId || w.user_id === userId));
    if (idx >= 0) {
      const deleted = memoryDb.watchlist_items.splice(idx, 1);
      return { rows: deleted };
    }
    return { rows: [] };
  }

  // 4. SELECT ... FROM watchlist_items WHERE id = $1
  if (norm.includes('FROM watchlist_items WHERE id = $1')) {
    const id = params[0];
    const userId = params[1];
    const found = memoryDb.watchlist_items.filter(w => w.id === id && (!userId || w.user_id === userId));
    return { rows: found };
  }

  // 5. SELECT 1 FROM watchlist_items WHERE user_id = $1 AND symbol = $2
  if (norm.includes('FROM watchlist_items WHERE user_id = $1 AND symbol = $2')) {
    const userId = params[0];
    const symbol = String(params[1]).toUpperCase();
    const found = memoryDb.watchlist_items.filter(w => (!userId || w.user_id === userId) && w.symbol === symbol);
    return { rows: found.length > 0 ? [{ '?column?': 1 }] : [] };
  }

  // 6. SELECT DISTINCT symbol FROM watchlist_items
  if (norm.includes('SELECT DISTINCT symbol FROM watchlist_items')) {
    const symbols = Array.from(new Set(memoryDb.watchlist_items.map(w => w.symbol))).map(s => ({ symbol: s }));
    return { rows: symbols };
  }

  // 7. SELECT symbol FROM watchlist_items WHERE user_id = $1
  if (norm.includes('SELECT symbol FROM watchlist_items WHERE user_id = $1')) {
    const userId = params[0];
    const symbols = memoryDb.watchlist_items.filter(w => !userId || w.user_id === userId).map(w => ({ symbol: w.symbol }));
    return { rows: symbols };
  }

  // 8. UPDATE thesis SET status = 'invalidated'
  if (norm.startsWith('UPDATE thesis SET status = \'invalidated\'')) {
    const wiId = params[0];
    memoryDb.thesis.forEach(t => {
      if (t.watchlist_item_id === wiId && t.status === 'open') {
        t.status = 'invalidated';
      }
    });
    return { rows: [] };
  }

  // 9. INSERT INTO thesis
  if (norm.startsWith('INSERT INTO thesis')) {
    const wiId = params[0];
    const category = params[1];
    const note = params[2] || null;
    const target = params[3] ? Number(params[3]) : null;
    const newThesis = {
      id: crypto.randomUUID(),
      watchlist_item_id: wiId,
      category,
      custom_note: note,
      target_price: target,
      created_at: new Date().toISOString(),
      status: 'open',
    };
    memoryDb.thesis.push(newThesis);
    return { rows: [newThesis] };
  }

  // 10. SELECT * FROM thesis WHERE watchlist_item_id = $1
  if (norm.includes('FROM thesis WHERE watchlist_item_id = $1')) {
    const wiId = params[0];
    const found = memoryDb.thesis
      .filter(t => t.watchlist_item_id === wiId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { rows: found };
  }

  // 11. user_last_seen queries
  if (norm.includes('FROM user_last_seen WHERE user_id = $1')) {
    const userId = params[0];
    const rec = memoryDb.user_last_seen.find(u => u.user_id === userId);
    return { rows: rec ? [rec] : [] };
  }

  if (norm.includes('INSERT INTO user_last_seen')) {
    const userId = params[0];
    const existing = memoryDb.user_last_seen.find(u => u.user_id === userId);
    const now = new Date().toISOString();
    if (existing) {
      existing.last_seen_at = now;
    } else {
      memoryDb.user_last_seen.push({ user_id: userId, last_seen_at: now });
    }
    return { rows: [] };
  }

  // 12. Feed: scored_events since last visit
  if (norm.includes('FROM scored_events se') && norm.includes('LEFT JOIN thesis_matches tm')) {
    const symbols: string[] = Array.isArray(params[0]) ? params[0] : [];
    const symbolParam = typeof params[0] === 'string' ? params[0] : null;

    let events = memoryDb.scored_events.slice();
    if (symbols.length > 0) {
      events = events.filter(e => symbols.includes(e.symbol));
    } else if (symbolParam) {
      events = events.filter(e => e.symbol === symbolParam);
    }

    // Filter score >= 50 if query demands
    if (norm.includes('change_score >= 50')) {
      events = events.filter(e => e.change_score >= 50);
    }

    const rows = events.map(se => {
      const ne = memoryDb.news_events.find(n => n.id === se.news_event_id);
      const tm = memoryDb.thesis_matches.find(m => m.scored_event_id === se.id);
      const th = tm ? memoryDb.thesis.find(t => t.id === tm.thesis_id) : null;
      return {
        id: se.id,
        symbol: se.symbol,
        event_type: se.event_type,
        news_event_id: se.news_event_id,
        change_score: se.change_score,
        details: se.details,
        created_at: se.created_at,
        headline: ne?.headline || null,
        source_url: ne?.source_url || null,
        plain_summary: ne?.plain_summary || null,
        verdict: tm?.verdict || null,
        ai_reasoning: tm?.ai_reasoning || null,
        thesis_category: th?.category || null,
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return { rows };
  }

  // 13. Price snapshots
  if (norm.includes('FROM price_snapshots WHERE symbol = $1')) {
    const symbol = params[0];
    const snapshots = memoryDb.price_snapshots
      .filter(p => p.symbol === symbol)
      .sort((a, b) => new Date(b.fetched_at).getTime() - new Date(a.fetched_at).getTime());
    return { rows: snapshots };
  }

  if (norm.startsWith('INSERT INTO price_snapshots')) {
    const item = {
      id: crypto.randomUUID(),
      symbol: params[0],
      price: Number(params[1]),
      volume: params[2] ? Number(params[2]) : null,
      fetched_at: new Date().toISOString(),
    };
    memoryDb.price_snapshots.unshift(item);
    return { rows: [item] };
  }

  // 14. News events
  if (norm.startsWith('INSERT INTO news_events')) {
    const item = {
      id: crypto.randomUUID(),
      symbol: params[0],
      headline: params[1],
      source_url: params[2] || null,
      published_at: params[3] || null,
      plain_summary: params[4] || null,
      fetched_at: new Date().toISOString(),
    };
    memoryDb.news_events.unshift(item);
    return { rows: [item] };
  }

  if (norm.includes('FROM news_events WHERE symbol = $1 AND headline = $2')) {
    const found = memoryDb.news_events.filter(n => n.symbol === params[0] && n.headline === params[1]);
    return { rows: found };
  }

  // 15. Scored events insert
  if (norm.startsWith('INSERT INTO scored_events')) {
    const item = {
      id: crypto.randomUUID(),
      symbol: params[0],
      event_type: params[1],
      news_event_id: params[2] || null,
      change_score: Number(params[3]),
      details: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
      created_at: new Date().toISOString(),
    };
    memoryDb.scored_events.unshift(item);
    return { rows: [item] };
  }

  // 16. Thesis matches insert
  if (norm.startsWith('INSERT INTO thesis_matches')) {
    const item = {
      id: crypto.randomUUID(),
      thesis_id: params[0],
      scored_event_id: params[1],
      verdict: params[2],
      ai_reasoning: params[3] || null,
      created_at: new Date().toISOString(),
    };
    memoryDb.thesis_matches.unshift(item);
    return { rows: [item] };
  }

  // 17. Target check query
  if (norm.includes('category = \'breakout_target\'')) {
    const symbol = params[0];
    const wi = memoryDb.watchlist_items.filter(w => w.symbol === symbol);
    const theses = memoryDb.thesis.filter(t => wi.some(w => w.id === t.watchlist_item_id) && t.category === 'breakout_target' && t.status === 'open' && t.target_price !== null);
    return { rows: theses };
  }

  // Default fallback
  return { rows: [] };
}
