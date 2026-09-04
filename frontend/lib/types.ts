export type ThesisCategory =
  | 'waiting_for_profitability'
  | 'breakout_target'
  | 'long_term_growth'
  | 'dividend_play'
  | 'sector_research';

export type FeedItem = {
  symbol: string;
  change_score: number;
  type: string;
  headline?: string;
  plain_summary?: string;
  thesis?: { category: ThesisCategory; verdict?: string; reasoning?: string };
  details?: { price?: number; volume?: number; pct_move?: number };
  created_at: string;
};

export type FeedResponse = {
  since: string;
  summary: { thesis_validated: number; major_events: number; targets_hit: number };
  items: FeedItem[];
};

export type Thesis = {
  id: string;
  watchlist_item_id: string;
  category: ThesisCategory;
  custom_note?: string;
  target_price?: number;
  status: string;
};

export type WatchlistItem = {
  id: string;
  symbol: string;
  added_at: string;
  thesis?: Thesis;
};

export const THESIS_CATEGORY_LABELS: Record<ThesisCategory, string> = {
  waiting_for_profitability: 'Waiting for profitability',
  breakout_target: 'Breakout target',
  long_term_growth: 'Long-term growth',
  dividend_play: 'Dividend play',
  sector_research: 'Sector research',
};

export const THESIS_CATEGORY_DESCRIPTIONS: Record<ThesisCategory, string> = {
  waiting_for_profitability: 'Track evidence that the company is becoming profitable.',
  breakout_target: 'Track a price level you want the stock to cross.',
  long_term_growth: 'Track expansion, strategy, and durable growth signals.',
  dividend_play: 'Track dividend and payout announcements.',
  sector_research: 'Track news that changes your view of the sector.',
};
