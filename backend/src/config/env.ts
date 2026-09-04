import dotenv from 'dotenv';
dotenv.config();

function configured(name: string): string {
  const value = process.env[name] || '';
  return value.startsWith('your_') ? '' : value;
}

export const env = {
  PORT: parseInt(process.env.PORT || '3001'),
  DATABASE_URL: configured('DATABASE_URL'),
  SUPABASE_URL: configured('SUPABASE_URL'),
  SUPABASE_SERVICE_KEY: configured('SUPABASE_SERVICE_KEY'),
  SUPABASE_JWT_SECRET: configured('SUPABASE_JWT_SECRET'),
  FINNHUB_API_KEY: process.env.FINNHUB_API_KEY || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  POLL_INTERVAL_MINUTES: parseInt(process.env.POLL_INTERVAL_MINUTES || '5'),
  NODE_ENV: process.env.NODE_ENV || 'development',
};
