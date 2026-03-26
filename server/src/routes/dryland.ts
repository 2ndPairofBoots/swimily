import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../storage/db';
import { requireAuth } from '../middleware/auth';

const drylandRouter = Router();

const drylandLogSchema = z.object({
  date: z.string(), // ISO date
  workoutType: z.enum(['push', 'pull', 'legs']).or(z.string().min(1).max(20)),
  exercises: z.array(z.string()).min(1),
  duration: z.number().int().positive(),
  xpEarned: z.number().int().nonnegative().optional(),
});

drylandRouter.post('/dryland/log', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const body = drylandLogSchema.parse(req.body);
    const dateISO = new Date(body.date).toISOString().slice(0, 10);

    const result = await pool.query(
      `INSERT INTO dryland_logs (user_id, date, workout_type, exercises, duration, xp_earned)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, dateISO, body.workoutType, body.exercises, body.duration, body.xpEarned ?? 0]
    );

    return res.status(201).json({ id: result.rows[0].id });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid payload' });
  }
});

export { drylandRouter };

