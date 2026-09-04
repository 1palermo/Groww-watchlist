import type { FeedResponse, ThesisCategory, WatchlistItem } from './types';
import { getSupabase } from './supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const supabase = getSupabase();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}), ...(init?.headers || {}) },
    cache: 'no-store',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || `Request failed (${response.status})`);
  return body;
}

export function getWatchlist() {
  return request<{ data: WatchlistItem[] }>('/api/watchlist');
}

export function addStock(symbol: string) {
  return request<{ data: WatchlistItem }>('/api/watchlist', {
    method: 'POST', body: JSON.stringify({ symbol }),
  });
}

export function addThesis(watchlistItemId: string, category: ThesisCategory, customNote?: string, targetPrice?: number) {
  return request('/api/thesis', {
    method: 'POST',
    body: JSON.stringify({ watchlist_item_id: watchlistItemId, category, custom_note: customNote, target_price: targetPrice }),
  });
}

export function removeStock(id: string) {
  return request(`/api/watchlist/${id}`, { method: 'DELETE' });
}

export function getFeed() {
  return request<FeedResponse>('/api/feed/since-last-visit');
}

export function getTimeline(symbol: string) {
  return request<{ data: Array<Record<string, unknown>> }>(`/api/stock/${encodeURIComponent(symbol)}/timeline`);
}

export function getQuote(symbol: string) {
  return request<{ data: { price: number; fetched_at: string } | null }>(`/api/stock/${encodeURIComponent(symbol)}/quote`);
}
