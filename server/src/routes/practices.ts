import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../storage/db';
import { requireAuth } from '../middleware/auth';

const practicesRouter = Router();

const practiceSetSchema = z.object({
  distance: z.number().int().positive(),
  repetitions: z.number().int().positive(),
  stroke: z.string().min(1).max(50),
  effort: z.string().min(1).max(20),
  interval: z.string().optional(),
  notes: z.string().optional(),
});

const createPracticeSchema = z.object({
  date: z.string(), // ISO date or RFC3339
  totalYards: z.number().int(),
  duration: z.number().int().positive(),
  course: z.enum(['SCY', 'LCM', 'SCM']).optional(),
  focus: z.string().optional(),
  intensity: z.string().optional(),
  notes: z.string().optional(),
  xpEarned: z.number().int().nonnegative().optional(),
  sets: z.array(practiceSetSchema).min(1),
});

practicesRouter.get('/practices', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const practicesRes = await pool.query(
      `SELECT id, date, total_yards, duration, course, focus, intensity, notes, xp_earned, created_at, updated_at
       FROM practices
       WHERE user_id = $1
       ORDER BY date DESC, created_at DESC
       LIMIT 50`,
      [userId]
    );

    const practices = practicesRes.rows.map((p: any) => ({
      id: p.id,
      date: p.date,
      totalYards: Number(p.total_yards),
      duration: Number(p.duration),
      course: p.course,
      focus: p.focus,
      intensity: p.intensity,
      notes: p.notes,
      xpEarned: Number(p.xp_earned ?? 0),
      createdAt: p.created_at,
      updatedAt: p.updated_at,
      sets: [] as Array<any>,
    }));

    if (practices.length === 0) return res.json(practices);

    const ids = practices.map((p) => p.id);
    const setsRes = await pool.query(
      `SELECT practice_id, set_order, distance, reps, interval, stroke, effort, notes
       FROM practice_sets
       WHERE practice_id = ANY($1::uuid[])
       ORDER BY practice_id, set_order ASC`,
      [ids]
    );

    const setsByPracticeId = new Map<string, any[]>();
    for (const row of setsRes.rows) {
      const arr = setsByPracticeId.get(row.practice_id) ?? [];
      arr.push({
        distance: Number(row.distance),
        repetitions: Number(row.reps),
        interval: row.interval ?? undefined,
        stroke: row.stroke,
        effort: row.effort,
        notes: row.notes ?? undefined,
        set_order: Number(row.set_order),
      });
      setsByPracticeId.set(row.practice_id, arr);
    }

    for (const practice of practices) {
      practice.sets = setsByPracticeId.get(practice.id) ?? [];
    }

    return res.json(practices);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch practices' });
  }
});

practicesRouter.post('/practices', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const body = createPracticeSchema.parse(req.body);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const practiceRes = await client.query(
        `INSERT INTO practices (user_id, date, total_yards, duration, course, focus, intensity, notes, xp_earned)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, date, total_yards, duration, course, focus, intensity, notes, xp_earned`,
        [
          userId,
          new Date(body.date).toISOString().slice(0, 10),
          body.totalYards,
          body.duration,
          body.course ?? 'SCY',
          body.focus ?? null,
          body.intensity ?? null,
          body.notes ?? null,
          body.xpEarned ?? 0,
        ]
      );

      const practice = practiceRes.rows[0];

      for (let i = 0; i < body.sets.length; i++) {
        const s = body.sets[i];
        await client.query(
          `INSERT INTO practice_sets (practice_id, set_order, distance, reps, interval, stroke, effort, notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            practice.id,
            i,
            s.distance,
            s.repetitions,
            s.interval ?? null,
            s.stroke,
            s.effort,
            s.notes ?? null,
          ]
        );
      }

      await client.query('COMMIT');
      return res.status(201).json({ id: practice.id });
    } catch (e) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: e instanceof Error ? e.message : 'Failed to create practice' });
    } finally {
      client.release();
    }
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid payload' });
  }
});

export { practicesRouter };

