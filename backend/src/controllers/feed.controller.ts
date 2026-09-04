import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getSinceLastVisit(req: Request, res: Response) {
  try {
    // Get user's last seen timestamp
    const lastSeenResult = await query(
      'SELECT last_seen_at FROM user_last_seen WHERE user_id = $1',
      [req.userId]
    );

    const lastSeen = lastSeenResult.rows[0]?.last_seen_at || new Date(0).toISOString();

    // Get user's watched symbols
    const watchlistResult = await query(
      'SELECT symbol FROM watchlist_items WHERE user_id = $1',
      [req.userId]
    );
    const symbols = watchlistResult.rows.map(r => r.symbol);

    if (symbols.length === 0) {
      // Update last seen
      await query(
        `INSERT INTO user_last_seen (user_id, last_seen_at) VALUES ($1, now())
         ON CONFLICT (user_id) DO UPDATE SET last_seen_at = now()`,
        [req.userId]
      );
      res.json({
        since: lastSeen,
        summary: { thesis_validated: 0, major_events: 0, targets_hit: 0 },
        items: [],
      });
      return;
    }

    // Get scored events since last visit, score >= 50
    const eventsResult = await query(
      `SELECT se.*, ne.headline, ne.source_url, ne.plain_summary,
              tm.verdict, tm.ai_reasoning,
              t.category as thesis_category
       FROM scored_events se
       LEFT JOIN news_events ne ON se.news_event_id = ne.id
       LEFT JOIN thesis_matches tm ON tm.scored_event_id = se.id
       LEFT JOIN thesis t ON tm.thesis_id = t.id
       WHERE se.symbol = ANY($1)
         AND se.change_score >= 50
         AND se.created_at > $2
       ORDER BY se.change_score DESC, se.created_at DESC
       LIMIT 50`,
      [symbols, lastSeen]
    );

    // Build feed items
    const items = eventsResult.rows.map(row => ({
      symbol: row.symbol,
      change_score: parseFloat(row.change_score),
      type: row.event_type,
      headline: row.headline || undefined,
      plain_summary: row.plain_summary || undefined,
      thesis: row.thesis_category ? {
        category: row.thesis_category,
        verdict: row.verdict,
        reasoning: row.ai_reasoning,
      } : undefined,
      details: row.details,
      created_at: row.created_at,
    }));

    // Compute summary
    const summary = {
      thesis_validated: items.filter(i => i.thesis?.verdict === 'validated').length,
      major_events: items.filter(i => i.change_score >= 50).length,
      targets_hit: items.filter(i => i.type === 'target_hit').length,
    };

    // Update last seen
    await query(
      `INSERT INTO user_last_seen (user_id, last_seen_at) VALUES ($1, now())
       ON CONFLICT (user_id) DO UPDATE SET last_seen_at = now()`,
      [req.userId]
    );

    res.json({ since: lastSeen, summary, items });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
