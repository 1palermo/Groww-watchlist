'use client';

import { useState } from 'react';
import type { ThesisCategory } from '@/lib/types';
import { THESIS_CATEGORY_LABELS, THESIS_CATEGORY_DESCRIPTIONS } from '@/lib/types';

const CATEGORIES: ThesisCategory[] = [
  'waiting_for_profitability',
  'breakout_target',
  'long_term_growth',
  'dividend_play',
  'sector_research',
];

interface AddStockDialogProps {
  onAdd: (symbol: string, category?: ThesisCategory, note?: string, targetPrice?: number) => Promise<void>;
}

export function AddStockDialog({ onAdd }: AddStockDialogProps) {
  const [open, setOpen] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [category, setCategory] = useState<ThesisCategory | ''>('');
  const [note, setNote] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    setLoading(true);
    try {
      await onAdd(
        symbol.trim().toUpperCase(),
        category || undefined,
        note || undefined,
        targetPrice ? parseFloat(targetPrice) : undefined
      );
      setSymbol('');
      setCategory('');
      setNote('');
      setTargetPrice('');
      setOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="px-4 py-1.5 text-sm rounded-md bg-emerald-600 hover:bg-emerald-700 text-white transition">
        + Add Stock
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Add to Watchlist</h2>
          <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Stock Symbol</label>
            <input value={symbol} onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. AAPL, TSLA, ZOMATO" required
              className="w-full px-3 py-2 rounded-md border bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Thesis (why are you watching?)</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ThesisCategory)}
              className="w-full px-3 py-2 rounded-md border bg-background">
              <option value="">No specific thesis</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{THESIS_CATEGORY_LABELS[cat]}</option>
              ))}
            </select>
            {category && (
              <p className="text-xs text-muted-foreground">{THESIS_CATEGORY_DESCRIPTIONS[category as ThesisCategory]}</p>
            )}
          </div>
          {category === 'breakout_target' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Price</label>
              <input type="number" step="0.01" value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="e.g. 500.00"
                className="w-full px-3 py-2 rounded-md border bg-background" />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-sm font-medium">Notes (optional)</label>
            <input value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="Any additional context..."
              className="w-full px-3 py-2 rounded-md border bg-background" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition disabled:opacity-50">
            {loading ? 'Adding...' : 'Add to Watchlist'}
          </button>
        </form>
      </div>
    </div>
  );
}
