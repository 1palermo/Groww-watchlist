import { ChangeScoreBadge } from '../feed/ChangeScoreBadge';

const verdictColors: Record<string, string> = {
  validated: 'border-emerald-500/30 bg-emerald-500/10',
  challenged: 'border-red-500/30 bg-red-500/10',
  neutral: 'border-gray-500/30 bg-gray-500/10',
};

export function EventTimeline({ events }: { events: any[] }) {
  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">No events recorded yet for this stock.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Event Timeline</h2>
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        {events.map((event: any, i: number) => (
          <div key={event.id || i} className="relative pl-10 pb-6">
            <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background" />
            <div className="p-4 rounded-lg border bg-card space-y-2">
              <div className="flex items-center gap-3">
                <ChangeScoreBadge score={parseFloat(event.change_score)} />
                <span className="text-xs text-muted-foreground capitalize">{event.event_type?.replace('_', ' ')}</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>
              {event.headline && (
                <p className="text-sm">{event.headline}</p>
              )}
              {event.plain_summary && event.plain_summary !== event.headline && (
                <p className="text-xs text-muted-foreground">→ {event.plain_summary}</p>
              )}
              {event.verdict && (
                <div className={`p-2 rounded border text-xs ${verdictColors[event.verdict] || ''}`}>
                  <span className="font-bold uppercase">{event.verdict}</span>
                  {event.ai_reasoning && <span className="ml-2 opacity-80">{event.ai_reasoning}</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
