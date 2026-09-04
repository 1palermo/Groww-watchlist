import { query, pool } from '../config/db';

const userId = 'dev-user-00000000-0000-0000-0000-000000000000';
const stocks = [
  { symbol: 'AAPL', category: 'long_term_growth', note: 'Services and ecosystem expansion' },
  { symbol: 'RELIANCE', category: 'waiting_for_profitability', note: 'New energy investment turning profitable' },
  { symbol: 'TATAMOTORS', category: 'breakout_target', note: 'Momentum above the recent range', target: 700 },
];

async function seed() {
  for (const stock of stocks) {
    const item = await query(`INSERT INTO watchlist_items (user_id, symbol) VALUES ($1, $2) ON CONFLICT (user_id, symbol) DO UPDATE SET symbol = EXCLUDED.symbol RETURNING id`, [userId, stock.symbol]);
    const itemId = item.rows[0].id;
    await query(`UPDATE thesis SET status = 'invalidated' WHERE watchlist_item_id = $1 AND status = 'open'`, [itemId]);
    const thesis = await query(`INSERT INTO thesis (watchlist_item_id, category, custom_note, target_price) VALUES ($1, $2, $3, $4) RETURNING id`, [itemId, stock.category, stock.note, stock.target || null]);
    const price = stock.symbol === 'AAPL' ? 178.5 : stock.symbol === 'RELIANCE' ? 2450 : 650.25;
    await query(`INSERT INTO price_snapshots (symbol, price, volume, fetched_at) VALUES ($1, $2, $3, now() - interval '1 day'), ($1, $2.03, $3, now())`, [stock.symbol, price, 4200000]);
    const news = await query(`INSERT INTO news_events (symbol, headline, source_url, published_at, plain_summary) VALUES ($1, $2, $3, now(), $2) RETURNING id`, [stock.symbol, `${stock.symbol} outlines a stronger outlook for investors`, 'https://example.com/groww-pulse-demo']);
    const scored = await query(`INSERT INTO scored_events (symbol, event_type, news_event_id, change_score, details) VALUES ($1, 'news', $2, 65, $3) RETURNING id`, [stock.symbol, news.rows[0].id, JSON.stringify({ price, pct_move: 2.03 })]);
    await query(`INSERT INTO thesis_matches (thesis_id, scored_event_id, verdict, ai_reasoning) VALUES ($1, $2, 'neutral', 'Demo verdict: connect OpenAI for live classification')`, [thesis.rows[0].id, scored.rows[0].id]);
  }
  console.log('Seeded demo data for AAPL, RELIANCE, and TATAMOTORS.');
}

seed().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => { if (pool) pool.end(); });
