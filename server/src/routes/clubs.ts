import { Router } from 'express';
import { z } from 'zod';
import { rateLimitByUser } from '../middleware/rateLimit';
import clubs from '../data/us-swim-clubs.json';

const clubsRouter = Router();

const querySchema = z.object({
  q: z.string().trim().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(20).optional(),
});

type ClubRow = {
  id: string;
  name: string;
  lsc?: string;
  city?: string;
  state?: string;
};

const clubRows = clubs as ClubRow[];

clubsRouter.get(
  '/clubs/search',
  rateLimitByUser({ windowMs: 60_000, max: 120, keyPrefix: 'clubs_search' }),
  (req, res) => {
    try {
      const { q, limit = 10 } = querySchema.parse(req.query);
      const query = q.toLowerCase();

      const startsWithMatches = clubRows.filter((c) => c.name.toLowerCase().startsWith(query));
      const containsMatches = clubRows.filter(
        (c) =>
          !c.name.toLowerCase().startsWith(query) &&
          (c.name.toLowerCase().includes(query) ||
            (c.city ?? '').toLowerCase().includes(query) ||
            (c.state ?? '').toLowerCase().includes(query) ||
            (c.lsc ?? '').toLowerCase().includes(query))
      );

      return res.json([...startsWithMatches, ...containsMatches].slice(0, limit));
    } catch (err) {
      return res.status(400).json({
        error: err instanceof Error ? err.message : 'Invalid club search query',
      });
    }
  }
);

export { clubsRouter };

