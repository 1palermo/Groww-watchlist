import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { query } from '../config/db';

const router = Router();
router.use(authMiddleware);
const categories = new Set(['waiting_for_profitability', 'breakout_target', 'long_term_growth', 'dividend_play', 'sector_research']);

router.post('/', async (req, res) => {
  try {
    const { watchlist_item_id, category, custom_note, target_price } = req.body;
    if (!watchlist_item_id || !categories.has(category)) {
      res.status(400).json({ error: 'A valid watchlist item and thesis category are required' });
      return;
    }
    if (category === 'breakout_target' && (!Number.isFinite(Number(target_price)) || Number(target_price) <= 0)) {
      res.status(400).json({ error: 'Breakout targets require a positive target price' });
      return;
    }
    
    // Verify user owns this watchlist item
    const ownerCheck = await query(
      'SELECT id FROM watchlist_items WHERE id = $1 AND user_id = $2',
      [watchlist_item_id, req.userId]
    );
    if (ownerCheck.rows.length === 0) {
      res.status(403).json({ error: 'Not authorized' });
      return;
    }

    await query('UPDATE thesis SET status = \'invalidated\' WHERE watchlist_item_id = $1 AND status = \'open\'', [watchlist_item_id]);
    const result = await query(
      `INSERT INTO thesis (watchlist_item_id, category, custom_note, target_price)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [watchlist_item_id, category, custom_note || null, category === 'breakout_target' ? Number(target_price) : null]
    );
    res.json({ data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:watchlist_item_id', async (req, res) => {
  try {
    const ownerCheck = await query('SELECT id FROM watchlist_items WHERE id = $1 AND user_id = $2', [req.params.watchlist_item_id, req.userId]);
    if (ownerCheck.rows.length === 0) {
      res.status(404).json({ error: 'Watchlist item not found' });
      return;
    }
    const result = await query(
      'SELECT * FROM thesis WHERE watchlist_item_id = $1 ORDER BY created_at DESC LIMIT 1',
      [req.params.watchlist_item_id]
    );
    res.json({ data: result.rows[0] || null });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
