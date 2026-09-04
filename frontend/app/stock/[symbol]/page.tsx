'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { EventTimeline } from '@/components/stock/EventTimeline';
import { PriceChart } from '@/components/stock/PriceChart';
import { getQuote, getTimeline } from '@/lib/api';

export default function StockPage({ params }: { params: { symbol: string } }) {
  const symbol = params.symbol.toUpperCase();
  const [events, setEvents] = useState<Array<Record<string, unknown>>>([]);
  const [price, setPrice] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getTimeline(symbol), getQuote(symbol)])
      .then(([timeline, quote]) => {
        setEvents(timeline.data || []);
        const rawPrice = quote.data?.price;
        setPrice(rawPrice !== undefined && rawPrice !== null ? Number(rawPrice) : null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Could not load stock data.'));
  }, [symbol]);

  const formattedPrice = typeof price === 'number' && !isNaN(price) ? `$${price.toFixed(2)}` : '—';

  return (
    <main className="min-h-screen bg-[#f4f6f1] px-6 py-8 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-4xl">
        <Link href="/dashboard" className="text-sm font-semibold text-emerald-700 hover:underline">
          ← Back to pulse
        </Link>
        <div className="my-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Stock detail</p>
            <h1 className="text-5xl font-black tracking-tight">{symbol}</h1>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase text-slate-500">Latest price</p>
            <p className="text-3xl font-black font-mono">{formattedPrice}</p>
          </div>
        </div>
        {error && <p role="alert" className="mb-5 text-sm text-red-600">{error}</p>}
        <PriceChart events={events} />
        <EventTimeline events={events} />
      </div>
    </main>
  );
}
