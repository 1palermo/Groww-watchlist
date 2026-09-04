import { query } from '../config/db';

export async function getLastSnapshot(symbol: string) {
  const result = await query(
    'SELECT * FROM price_snapshots WHERE symbol = $1 ORDER BY fetched_at DESC LIMIT 1',
    [symbol]
  );
  return result.rows[0] || null;
}

export async function saveSnapshot(symbol: string, price: number, volume: number) {
  const result = await query(
    'INSERT INTO price_snapshots (symbol, price, volume) VALUES ($1, $2, $3) RETURNING *',
    [symbol, price, volume]
  );
  return result.rows[0];
}
