import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { startPollingJob, pollAllWatchedSymbols } from './jobs/pollMarket.job';
import watchlistRoutes from './routes/watchlist.routes';
import thesisRoutes from './routes/thesis.routes';
import eventsRoutes from './routes/events.routes';
import feedRoutes from './routes/feed.routes';
import stockRoutes from './routes/stock.routes';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'], credentials: true }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'groww-pulse-backend' });
});

// Routes
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/thesis', thesisRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/stock', stockRoutes);

// Dev-only: manual poll trigger
app.post('/api/internal/poll-now', authMiddleware, async (_req, res) => {
  try {
    await pollAllWatchedSymbols();
    res.json({ message: 'Poll completed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(env.PORT, () => {
  console.log(`\n🚀 Groww Pulse backend running on http://localhost:${env.PORT}`);
  console.log(`   Health check: http://localhost:${env.PORT}/api/health\n`);

  // Start polling job (only if DB is configured)
  if (env.DATABASE_URL) {
    startPollingJob();
  } else {
    console.log('⚠️  No DATABASE_URL set — polling job disabled');
  }
});

export default app;
