'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function PriceChart({ events }: { events: Array<Record<string, unknown>> }) {
  const data = events.map((event) => {
    const details = event.details as { price?: number } | undefined;
    return { date: new Date(String(event.created_at)).toLocaleDateString(), price: Number(details?.price || 0) };
  }).filter((item) => item.price > 0).reverse();

  if (data.length < 2) return null;
  return <section className="mb-10 border-y border-slate-200 py-6 dark:border-slate-800"><h2 className="mb-4 text-lg font-bold">Price movement</h2><div className="h-56 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={data}><XAxis dataKey="date" tick={{ fontSize: 11 }} /><YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} width={55} /><Tooltip /><Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={3} dot={false} /></LineChart></ResponsiveContainer></div></section>;
}
