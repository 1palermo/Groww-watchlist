import { query } from '../config/db';

export async function computeChangeScore(
  symbol: string,
  currentPrice: number,
  currentVolume: number,
  hasNewsEvent: boolean,
  newsEventId?: string
): Promise<number> {
  let score = 0;

  // Get 20-day price history
  const historyResult = await query(
    `SELECT price FROM price_snapshots 
     WHERE symbol = $1 
     ORDER BY fetched_at DESC 
     LIMIT 20`,
    [symbol]
  );

  const prices = historyResult.rows.map(r => parseFloat(r.price));

  if (prices.length >= 2) {
    // Calculate average daily move
    const dailyMoves: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      dailyMoves.push(Math.abs((prices[i - 1] - prices[i]) / prices[i] * 100));
    }
    const avgDailyMove = dailyMoves.reduce((a, b) => a + b, 0) / dailyMoves.length || 1;
    const currentMove = Math.abs((currentPrice - prices[0]) / prices[0] * 100);

    // If abs(pct_move) > 2x symbol's 20-day avg daily move → score += 40
    if (currentMove > 2 * avgDailyMove) {
      score += 40;
    }
  }

  // Volume spike: Get 20-day avg volume
  const volResult = await query(
    `SELECT volume FROM price_snapshots 
     WHERE symbol = $1 AND volume IS NOT NULL
     ORDER BY fetched_at DESC 
     LIMIT 20`,
    [symbol]
  );

  const volumes = volResult.rows.map(r => parseInt(r.volume));
  if (volumes.length > 0) {
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    // If volume > 3x 20-day avg volume → score += 25
    if (avgVolume > 0 && currentVolume > 3 * avgVolume) {
      score += 25;
    }
  }

  // If news_event exists in same window → score += 20
  if (hasNewsEvent) {
    score += 20;
  }

  // Check target price crossing for any thesis
  const targetResult = await query(
    `SELECT t.target_price, t.id as thesis_id 
     FROM thesis t
     JOIN watchlist_items wi ON t.watchlist_item_id = wi.id
     WHERE wi.symbol = $1 AND t.category = 'breakout_target' AND t.status = 'open' AND t.target_price IS NOT NULL`,
    [symbol]
  );

  for (const row of targetResult.rows) {
    // If price crosses user's target_price → score += 40 (cap at 100)
    if (prices.length > 0 && prices[0] < parseFloat(row.target_price) && currentPrice >= parseFloat(row.target_price)) {
      score += 40;
    }
  }

  // Cap at 100
  return Math.min(score, 100);
}
