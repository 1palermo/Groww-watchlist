import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getEvents(req: Request, res: Response) {
  try {
    const symbol = String(req.params.symbol).toUpperCase();
    const ownerCheck = await query('SELECT 1 FROM watchlist_items WHERE user_id = $1 AND symbol = $2', [req.userId, symbol]);
    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Stock is not in your watchlist' });
      return;
    }
    const result = await query(
      `SELECT se.*, ne.headline, ne.source_url, ne.plain_summary
       FROM scored_events se
       LEFT JOIN news_events ne ON se.news_event_id = ne.id
       WHERE se.symbol = $1
       ORDER BY se.created_at DESC
       LIMIT 50`,
      [symbol]
    );
    res.json({ data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
