export type ThesisCategory = 
  | 'waiting_for_profitability'
  | 'breakout_target'
  | 'long_term_growth'
  | 'dividend_play'
  | 'sector_research';

export type ThesisStatus = 'open' | 'validated' | 'invalidated';
export type Verdict = 'validated' | 'challenged' | 'neutral';
export type EventType = 'price_move' | 'volume_spike' | 'news' | 'target_hit';

export interface WatchlistItem {
  id: string;
  user_id: string;
  symbol: string;
  added_at: string;
}

export interface Thesis {
  id: string;
  watchlist_item_id: string;
  category: ThesisCategory;
  custom_note?: string;
  target_price?: number;
  status: ThesisStatus;
}

export interface PriceSnapshot {
  id: string;
  symbol: string;
  price: number;
  volume?: number;
  fetched_at: string;
}

export interface NewsEvent {
  id: string;
  symbol: string;
  headline: string;
  source_url?: string;
  published_at?: string;
  plain_summary?: string;
  fetched_at: string;
}

export interface ScoredEvent {
  id: string;
  symbol: string;
  event_type: EventType;
  news_event_id?: string;
  change_score: number;
  details?: Record<string, any>;
  created_at: string;
}

export interface ThesisMatch {
  id: string;
  thesis_id: string;
  scored_event_id: string;
  verdict: Verdict;
  ai_reasoning?: string;
  created_at: string;
}
