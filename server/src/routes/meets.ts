import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../storage/db';
import { requireAuth } from '../middleware/auth';

const meetsRouter = Router();

const createMeetSchema = z.object({
  name: z.string().min(1).max(255),
  date: z.string(), // ISO date
  location: z.string().optional(),
  meetType: z.enum(['dual', 'invitational', 'championship', 'time-trial']),
  notes: z.string().optional(),
});

meetsRouter.get('/meets', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const meetsRes = await pool.query(
      `SELECT id, name, date, location, meet_type, notes
       FROM meets
       WHERE user_id = $1
       ORDER BY date DESC, created_at DESC
       LIMIT 100`,
      [userId]
    );

    return res.json(
      meetsRes.rows.map((m: any) => ({
        id: m.id,
        userId,
        name: m.name,
        date: m.date,
        location: m.location ?? undefined,
        meetType: m.meet_type,
        notes: m.notes ?? undefined,
      }))
    );
  } catch {
    return res.status(500).json({ error: 'Failed to fetch meets' });
  }
});

meetsRouter.post('/meets', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const body = createMeetSchema.parse(req.body);
    const dateISO = new Date(body.date).toISOString().slice(0, 10);

    const meetRes = await pool.query(
      `INSERT INTO meets (user_id, name, date, location, meet_type, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, body.name, dateISO, body.location ?? null, body.meetType, body.notes ?? null]
    );

    return res.status(201).json({ id: meetRes.rows[0].id });
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid payload' });
  }
});

meetsRouter.delete('/meets/:id', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).auth?.userId as string | undefined;
    if (!userId) return res.status(401).json({ error: 'Invalid token' });

    const id = req.params.id;
    await pool.query(`DELETE FROM meets WHERE id = $1 AND user_id = $2`, [id, userId]);
    return res.status(204).send();
  } catch {
    return res.status(400).json({ error: 'Delete failed' });
  }
});

export { meetsRouter };

