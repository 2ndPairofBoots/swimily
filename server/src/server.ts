import http from 'http';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { initDb, pool } from './storage/db';
import { apiRouter } from './routes';

export function createServer() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/healthz', (_req, res) => res.status(200).json({ ok: true }));
  // Also expose under `/api/healthz` so the frontend dev proxy works.
  app.get('/api/healthz', async (_req, res) => {
    try {
      await pool.query('SELECT 1');
      return res.status(200).json({ ok: true, db: 'ok' });
    } catch {
      return res.status(200).json({ ok: true, db: 'error' });
    }
  });
  app.use('/api', apiRouter);

  const server = http.createServer(app);

  // Fire-and-forget schema init so local dev works without manual migrations.
  initDb().catch((err) => {
    // eslint-disable-next-line no-console
    console.error('DB init failed', err);
  });

  return { app, server };
}

