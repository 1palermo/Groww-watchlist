import Link from 'next/link';
import type { FeedItem } from '@/lib/types';
import { ChangeScoreBadge } from './ChangeScoreBadge';
import { ThesisBadge } from '../watchlist/ThesisBadge';

const verdictColors: Record<string, string> = {
  validated: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  challenged: 'text-red-400 bg-red-500/10 border-red-500/30',
  neutral: 'text-gray-400 bg-gray-500/10 border-gray-500/30',
};

const eventTypeLabels: Record<string, string> = {
  price_move: '📊 Price Move',
  volume_spike: '📈 Volume Spike',
  news: '📰 News',
  target_hit: '🎯 Target Hit',
};

export function EventCard({ event }: { event: FeedItem }) {
  return (
    <div className="p-4 rounded-lg border bg-card space-y-3 hover:border-emerald-500/30 transition">
      {/* Top row: symbol, score, type */}
      <div className="flex items-center gap-3">
        <Link href={`/stock/${event.symbol}`} className="font-bold text-lg hover:text-emerald-500 transition">
          {event.symbol}
        </Link>
        <ChangeScoreBadge score={event.change_score} />
        <span className="text-xs text-muted-foreground">{eventTypeLabels[event.type] || event.type}</span>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(event.created_at).toLocaleString()}
        </span>
      </div>

      {/* Headline + plain summary */}
      {event.headline && (
        <div className="space-y-1">
          <p className="text-sm font-medium">{event.headline}</p>
          {event.plain_summary && event.plain_summary !== event.headline && (
            <p className="text-xs text-muted-foreground">→ {event.plain_summary}</p>
          )}
        </div>
      )}

      {/* Price details */}
      {event.details && !event.headline && (
        <div className="text-sm text-muted-foreground">
          Price: ${event.details.price}
          {event.details.pct_move && (
            <span className={event.details.pct_move >= 0 ? 'text-emerald-400 ml-2' : 'text-red-400 ml-2'}>
              {event.details.pct_move >= 0 ? '+' : ''}{event.details.pct_move}%
            </span>
          )}
        </div>
      )}

      {/* Thesis verdict — always shown next to the headline */}
      {event.thesis && event.thesis.verdict && (
        <div className={`flex items-start gap-3 p-3 rounded-md border ${verdictColors[event.thesis.verdict]}`}>
          <div className="flex-shrink-0">
            <ThesisBadge category={event.thesis.category} />
          </div>
          <div className="space-y-0.5">
            <div className="text-xs font-bold uppercase">{event.thesis.verdict}</div>
            {event.thesis.reasoning && (
              <p className="text-xs opacity-80">{event.thesis.reasoning}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
