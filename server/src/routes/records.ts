import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../storage/db';
import { requireAuth } from '../middleware/auth';

const recordsRouter = Router();

const putRecordSchema = z.object({
  event: z.string().min(1).max(50),
  course: z.enum(['SCY', 'LCM', 'SCM']),
  date: z.string().optional(), // ISO date
  timeSeconds: z.number().optional(),
  goalTimeSeconds: z.number().optional(),
  finaPoints: z.number().optional(),
  cuts: z.array(z.string()).optional(),
  meetName: z.string().optional(),
  meetDate: z.string().optional(), // ISO date
});

recordsRouter.get('/records', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const course = z.enum(['SCY', 'LCM', 'SCM']).catch('SCY').parse(req.query.course);

    const recordsRes = await pool.query(
      `SELECT id, event, course, time_seconds, goal_time_seconds, fina_points, cuts, meet_name, meet_date, updated_at
       FROM personal_records
       WHERE user_id = $1 AND course = $2
       ORDER BY updated_at DESC`,
      [userId, course]
    );

    const records = recordsRes.rows.map((r: any) => ({
      id: r.id,
      event: r.event,
      course: r.course,
      timeSeconds: r.time_seconds == null ? undefined : Number(r.time_seconds),
      goalTimeSeconds: r.goal_time_seconds == null ? undefined : Number(r.goal_time_seconds),
      finaPoints: r.fina_points == null ? undefined : Number(r.fina_points),
      cuts: r.cuts ?? undefined,
      meetName: r.meet_name ?? undefined,
      meetDate: r.meet_date ?? undefined,
    }));

    return res.json(records);
  } catch {
    return res.status(500).json({ error: 'Failed to fetch records' });
  }
});

recordsRouter.put('/records', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const body = putRecordSchema.parse(req.body);
    if (
      body.timeSeconds === undefined &&
      body.goalTimeSeconds === undefined &&
      body.finaPoints === undefined &&
      body.cuts === undefined &&
      body.meetName === undefined &&
      body.meetDate === undefined
    ) {
      return res.status(400).json({ error: 'At least one field must be provided' });
    }

    const dateISO = body.date ? new Date(body.date).toISOString().slice(0, 10) : null;
    const meetDateISO = body.meetDate ? new Date(body.meetDate).toISOString().slice(0, 10) : null;

    await pool.query(
      `INSERT INTO personal_records (user_id, event, course, time_seconds, goal_time_seconds, fina_points, cuts, meet_name, meet_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (user_id, event, course)
       DO UPDATE SET
         time_seconds = COALESCE(EXCLUDED.time_seconds, personal_records.time_seconds),
         goal_time_seconds = COALESCE(EXCLUDED.goal_time_seconds, personal_records.goal_time_seconds),
         fina_points = COALESCE(EXCLUDED.fina_points, personal_records.fina_points),
         cuts = COALESCE(EXCLUDED.cuts, personal_records.cuts),
         meet_name = COALESCE(EXCLUDED.meet_name, personal_records.meet_name),
         meet_date = COALESCE(EXCLUDED.meet_date, personal_records.meet_date)
       `,
      [
        userId,
        body.event,
        body.course,
        body.timeSeconds ?? null,
        body.goalTimeSeconds ?? null,
        body.finaPoints ?? null,
        body.cuts ?? null,
        body.meetName ?? null,
        meetDateISO,
      ]
    );

    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid payload' });
  }
});

export { recordsRouter };

