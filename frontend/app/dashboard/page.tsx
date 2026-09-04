'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AddStockDialog } from '@/components/watchlist/AddStockDialog';
import { ThesisBadge } from '@/components/watchlist/ThesisBadge';
import { SinceLastVisitFeed } from '@/components/feed/SinceLastVisitFeed';
import { addStock, addThesis, getFeed, getWatchlist, removeStock } from '@/lib/api';
import type { FeedResponse, ThesisCategory, WatchlistItem } from '@/lib/types';

export default function DashboardPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [feed, setFeed] = useState<FeedResponse | null>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [watchlistResponse, feedResponse] = await Promise.all([getWatchlist(), getFeed()]);
      setWatchlist(watchlistResponse.data);
      setFeed(feedResponse);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your pulse.');
    }
  }

  useEffect(() => { void load(); }, []);

  async function handleAdd(symbol: string, category?: ThesisCategory, note?: string, targetPrice?: number) {
    const response = await addStock(symbol);
    if (category) await addThesis(response.data.id, category, note, targetPrice);
    await load();
  }

  async function handleRemove(id: string) {
    await removeStock(id);
    await load();
  }

  return (
    <main className="min-h-screen bg-[#f4f6f1] text-slate-950 dark:bg-slate-950 dark:text-white">
      <header className="border-b border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link href="/dashboard" className="text-xl font-black tracking-tight">GROWW <span className="text-emerald-600">PULSE</span></Link>
          <AddStockDialog onAdd={handleAdd} />
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[280px_1fr]">
        <aside>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Your watchlist</p>
          <h1 className="mb-6 text-3xl font-black tracking-tight">Investment pulse</h1>
          <div className="space-y-3">
            {watchlist.length === 0 && <p className="text-sm text-slate-500">Add a stock to start tracking its story.</p>}
            {watchlist.map((item) => (
              <div key={item.id} className="border-b border-slate-200 py-3 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <Link href={`/stock/${item.symbol}`} className="font-bold hover:text-emerald-600">{item.symbol}</Link>
                  <button aria-label={`Remove ${item.symbol}`} onClick={() => void handleRemove(item.id)} className="text-xs text-slate-400 hover:text-red-600">Remove</button>
                </div>
                {item.thesis && <div className="mt-2"><ThesisBadge category={item.thesis.category} /></div>}
              </div>
            ))}
          </div>
        </aside>
        <section>
          <div className="mb-6 grid grid-cols-3 gap-3">
            {[
              ['Validated', feed?.summary.thesis_validated ?? 0],
              ['Major events', feed?.summary.major_events ?? 0],
              ['Targets hit', feed?.summary.targets_hit ?? 0],
            ].map(([label, value]) => <div key={label} className="border-l-2 border-emerald-500 pl-3"><p className="text-2xl font-black">{value}</p><p className="text-xs uppercase tracking-wide text-slate-500">{label}</p></div>)}
          </div>
          {error && <div role="alert" className="mb-5 border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          <SinceLastVisitFeed feed={feed} />
        </section>
      </div>
    </main>
  );
}
