import cron from 'node-cron';
import { query } from '../config/db';
import { getQuote, getNews } from '../services/marketData.service';
import { computeChangeScore } from '../services/changeScore.service';
import { matchThesis } from '../services/thesisMatch.service';
import { summarizeHeadline } from '../services/summarize.service';
import { saveSnapshot } from '../services/snapshot.service';
import { env } from '../config/env';

async function pollAllWatchedSymbols() {
  console.log('[Poll] Starting market data poll...');
  
  try {
    // Get all unique symbols being watched
    const symbolsResult = await query('SELECT DISTINCT symbol FROM watchlist_items');
    const symbols = symbolsResult.rows.map(r => r.symbol);

    if (symbols.length === 0) {
      console.log('[Poll] No symbols to poll');
      return;
    }

    for (const symbol of symbols) {
      try {
        // 1. Fetch quote
        const quote = await getQuote(symbol);
        
        // Score against history before recording the current snapshot.
        const newsItems = await getNews(symbol);
        let newsEventId: string | undefined;

        for (const news of newsItems) {
          // Check if we already have this headline
          const existing = await query(
            'SELECT id FROM news_events WHERE symbol = $1 AND headline = $2',
            [symbol, news.headline]
          );
          if (existing.rows.length > 0) continue;

          // Summarize the headline
          const summary = await summarizeHeadline(news.headline);

          // Insert news event
          const newsResult = await query(
            `INSERT INTO news_events (symbol, headline, source_url, published_at, plain_summary)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [symbol, news.headline, news.url, news.publishedAt, summary]
          );
          newsEventId = newsResult.rows[0].id;

          // 4. Compute change score for this news event
          const score = await computeChangeScore(symbol, quote.price, quote.volume, true, newsEventId);

          // 5. Store scored event
          const scoredResult = await query(
            `INSERT INTO scored_events (symbol, event_type, news_event_id, change_score, details)
             VALUES ($1, 'news', $2, $3, $4) RETURNING id`,
            [symbol, newsEventId, score, JSON.stringify({ price: quote.price, volume: quote.volume })]
          );

          // 6. Check thesis matches for high-scoring events
          if (score >= 50) {
            const thesesResult = await query(
              `SELECT t.* FROM thesis t
               JOIN watchlist_items wi ON t.watchlist_item_id = wi.id
               WHERE wi.symbol = $1 AND t.status = 'open'`,
              [symbol]
            );

            for (const thesis of thesesResult.rows) {
              if (thesis.category === 'breakout_target') {
                // Plain numeric comparison — no AI needed
                if (thesis.target_price && quote.price >= parseFloat(thesis.target_price)) {
                  await query(
                    `INSERT INTO thesis_matches (thesis_id, scored_event_id, verdict, ai_reasoning)
                     VALUES ($1, $2, 'validated', $3)`,
                    [thesis.id, scoredResult.rows[0].id, 
                     `Price ${quote.price} crossed target ${thesis.target_price}`]
                  );
                }
              } else if (thesis.category !== 'sector_research') {
                // AI classification for non-trivial categories
                const match = await matchThesis(thesis.category, news.headline);
                await query(
                  `INSERT INTO thesis_matches (thesis_id, scored_event_id, verdict, ai_reasoning)
                   VALUES ($1, $2, $3, $4)`,
                  [thesis.id, scoredResult.rows[0].id, match.verdict, match.reasoning]
                );
              }
            }
          }
        }

        // Also create a price_move scored event if score is significant
        const priceScore = await computeChangeScore(symbol, quote.price, quote.volume, false);
        if (priceScore >= 30) {
          // Check for target price hits
          const targetResult = await query(
            `SELECT t.id, t.target_price FROM thesis t
             JOIN watchlist_items wi ON t.watchlist_item_id = wi.id
             WHERE wi.symbol = $1 AND t.category = 'breakout_target' AND t.status = 'open' AND t.target_price IS NOT NULL`,
            [symbol]
          );

          let eventType = 'price_move';
          for (const target of targetResult.rows) {
            if (quote.price >= parseFloat(target.target_price)) {
              eventType = 'target_hit';
            }
          }

          await query(
            `INSERT INTO scored_events (symbol, event_type, change_score, details)
             VALUES ($1, $2, $3, $4)`,
            [symbol, eventType, priceScore, JSON.stringify({ 
              price: quote.price, 
              volume: quote.volume,
              pct_move: quote.changePercent 
            })]
          );
        }

        await saveSnapshot(symbol, quote.price, quote.volume);

        console.log(`[Poll] ${symbol}: price=${quote.price}, newsCount=${newsItems.length}`);
      } catch (err) {
        console.error(`[Poll] Error processing ${symbol}:`, err);
      }
    }

    console.log('[Poll] Completed');
  } catch (error) {
    console.error('[Poll] Fatal error:', error);
  }
}

export function startPollingJob() {
  const interval = env.POLL_INTERVAL_MINUTES;
  console.log(`[Poll] Scheduling market data poll every ${interval} minutes`);
  
  cron.schedule(`*/${interval} * * * *`, pollAllWatchedSymbols);
  
  // Also run once on startup after a short delay
  setTimeout(pollAllWatchedSymbols, 5000);
}

// Export for manual trigger
export { pollAllWatchedSymbols };
