import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { query } from '../config/db';

const router = Router();
router.use(authMiddleware);

router.get('/:symbol/timeline', async (req, res) => {
  try {
    const ownerCheck = await query('SELECT 1 FROM watchlist_items WHERE user_id = $1 AND symbol = $2', [req.userId, req.params.symbol.toUpperCase()]);
    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Stock is not in your watchlist' });
      return;
    }
    const result = await query(
      `SELECT se.*, ne.headline, ne.source_url, ne.plain_summary,
              tm.verdict, tm.ai_reasoning,
              t.category as thesis_category
       FROM scored_events se
       LEFT JOIN news_events ne ON se.news_event_id = ne.id
       LEFT JOIN thesis_matches tm ON tm.scored_event_id = se.id
       LEFT JOIN thesis t ON tm.thesis_id = t.id
       WHERE se.symbol = $1
       ORDER BY se.created_at DESC
       LIMIT 100`,
      [req.params.symbol.toUpperCase()]
    );
    res.json({ data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:symbol/quote', async (req, res) => {
  try {
    const ownerCheck = await query('SELECT 1 FROM watchlist_items WHERE user_id = $1 AND symbol = $2', [req.userId, req.params.symbol.toUpperCase()]);
    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Stock is not in your watchlist' });
      return;
    }
    const result = await query(
      'SELECT * FROM price_snapshots WHERE symbol = $1 ORDER BY fetched_at DESC LIMIT 1',
      [req.params.symbol.toUpperCase()]
    );
    const row = result.rows[0];
    res.json({
      data: row ? {
        ...row,
        price: parseFloat(row.price),
      } : null
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
