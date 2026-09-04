import { Request, Response } from 'express';
import { query } from '../config/db';

export async function getWatchlist(req: Request, res: Response) {
  try {
    const result = await query(
      `SELECT wi.*, 
              t.id as thesis_id, t.category as thesis_category, 
              t.custom_note as thesis_note, t.target_price as thesis_target_price,
              t.status as thesis_status
       FROM watchlist_items wi
       LEFT JOIN thesis t ON t.watchlist_item_id = wi.id AND t.status = 'open'
       WHERE wi.user_id = $1
       ORDER BY wi.added_at DESC`,
      [req.userId]
    );

    const items = result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id,
      symbol: row.symbol,
      added_at: row.added_at,
      thesis: row.thesis_id ? {
        id: row.thesis_id,
        watchlist_item_id: row.id,
        category: row.thesis_category,
        custom_note: row.thesis_note,
        target_price: row.thesis_target_price ? parseFloat(row.thesis_target_price) : undefined,
        status: row.thesis_status,
      } : undefined,
    }));

    res.json({ data: items });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function addToWatchlist(req: Request, res: Response) {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      res.status(400).json({ error: 'Symbol is required' });
      return;
    }

    const result = await query(
      `INSERT INTO watchlist_items (user_id, symbol)
       VALUES ($1, $2)
       ON CONFLICT (user_id, symbol) DO NOTHING
       RETURNING *`,
      [req.userId, symbol.toUpperCase()]
    );

    if (result.rows.length === 0) {
      res.status(409).json({ error: 'Stock already in watchlist' });
      return;
    }

    res.status(201).json({ data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function removeFromWatchlist(req: Request, res: Response) {
  try {
    const result = await query(
      'DELETE FROM watchlist_items WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json({ message: 'Removed from watchlist' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
