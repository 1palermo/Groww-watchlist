import type { FeedResponse } from '@/lib/types';
import { EventCard } from './EventCard';

export function SinceLastVisitFeed({ feed }: { feed: FeedResponse | null }) {
  if (!feed) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 w-full bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (feed.items.length === 0) {
    return (
      <div className="text-center py-16 space-y-3">
        <div className="text-4xl">✅</div>
        <h3 className="text-lg font-semibold">You&apos;re all caught up!</h3>
        <p className="text-sm text-muted-foreground">
          No significant changes since your last visit.
        </p>
        <p className="text-xs text-muted-foreground">
          Last checked: {new Date(feed.since).toLocaleString()}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Since {new Date(feed.since).toLocaleString()} · {feed.items.length} significant event{feed.items.length !== 1 ? 's' : ''}
      </p>
      {feed.items.map((item, i) => (
        <EventCard key={`${item.symbol}-${item.created_at}-${i}`} event={item} />
      ))}
    </div>
  );
}
