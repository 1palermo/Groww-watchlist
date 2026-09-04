import { env } from '../config/env';

export interface QuoteData {
  symbol: string;
  price: number;
  volume: number;
  change: number;
  changePercent: number;
}

export interface NewsData {
  headline: string;
  source: string;
  url: string;
  publishedAt: string;
}

const MOCK_PRICES: Record<string, number> = {
  AAPL: 178.50,
  TSLA: 245.30,
  META: 505.75,
  ZOMATO: 195.60,
  RELIANCE: 2450.00,
  TATAMOTORS: 650.25,
};

export async function getQuote(symbol: string): Promise<QuoteData> {
  if (!env.FINNHUB_API_KEY) {
    // Mock mode
    const basePrice = MOCK_PRICES[symbol] || 100;
    const randomChange = (Math.random() - 0.5) * basePrice * 0.06;
    return {
      symbol,
      price: parseFloat((basePrice + randomChange).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      change: parseFloat(randomChange.toFixed(2)),
      changePercent: parseFloat(((randomChange / basePrice) * 100).toFixed(2)),
    };
  }

  const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${env.FINNHUB_API_KEY}`);
  const data: any = await res.json();
  return {
    symbol,
    price: data.c,
    volume: data.v || 0,
    change: data.d,
    changePercent: data.dp,
  };
}

export async function getNews(symbol: string): Promise<NewsData[]> {
  if (!env.FINNHUB_API_KEY) {
    // Mock mode — return empty, we'll seed news manually
    return [];
  }

  const today = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
  const res = await fetch(
    `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${weekAgo}&to=${today}&token=${env.FINNHUB_API_KEY}`
  );
  const data: any = await res.json();

  return (data || []).slice(0, 5).map((item: any) => ({
    headline: item.headline,
    source: item.source,
    url: item.url,
    publishedAt: new Date(item.datetime * 1000).toISOString(),
  }));
}
