import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { rateLimitByUser } from '../middleware/rateLimit';

const aiRouter = Router();

const generateWorkoutSchema = z.object({
  workout_type: z.string().min(1),
  focus: z.string().min(1),
  duration_minutes: z.number().int().positive(),
  notes: z.string().optional(),
});

// MVP: simulate AI generation server-side so the frontend wiring is stable.
aiRouter.post(
  '/ai/generate',
  requireAuth,
  rateLimitByUser({ windowMs: 60_000, max: 10, keyPrefix: 'ai_generate' }),
  async (req, res) => {
  try {
    const body = generateWorkoutSchema.parse(req.body);

    const { workout_type, duration_minutes } = body;

    const totalYards =
      duration_minutes === 60 ? 4500 : duration_minutes === 90 ? 6000 : 3500;

    const mockWorkout = {
      title: `${workout_type} Workout`,
      totalYards,
      sets: [
        {
          name: 'Warmup',
          description: '400 yards easy freestyle, focus on technique',
          sets: ['1x400 Free Easy'],
        },
        {
          name: 'Main Set',
          description:
            workout_type === 'Sprint'
              ? '10x50 all-out sprints with full recovery'
              : '8x100 at race pace with short rest',
          sets:
            workout_type === 'Sprint'
              ? ['10x50 Free @ :45', '4x25 choice :30']
              : ['8x100 Free @ 1:30', '4x75 IM @ 1:15'],
        },
        {
          name: 'Cooldown',
          description: '200 easy choice',
          sets: ['1x200 Choice Easy'],
        },
      ],
    };

    return res.status(200).json(mockWorkout);
  } catch (e) {
    return res.status(400).json({ error: e instanceof Error ? e.message : 'Invalid payload' });
  }
  }
);

aiRouter.post(
  '/ocr-scan',
  requireAuth,
  rateLimitByUser({ windowMs: 60_000, max: 5, keyPrefix: 'ocr_scan' }),
  async (req, res) => {
  // MVP stub: real OCR would accept an image upload / storage path + call an OCR/LLM pipeline.
  return res.status(501).json({ error: 'OCR scan not implemented yet' });
  }
);

export { aiRouter };

