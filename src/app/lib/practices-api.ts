import { authService } from './auth';
import { getJsonWithAuth, sendJsonWithAuth } from './api-client';
import { Practice, PracticeSet } from './types';

type CourseType = 'SCY' | 'LCM' | 'SCM';

export async function fetchPractices(): Promise<Practice[]> {
  const raw = await getJsonWithAuth<Array<any>>('/api/practices', { cacheKey: 'GET:/api/practices', ttlMs: 10_000 });
  const currentUserId = authService.getCurrentUser()?.id;
  if (!currentUserId) throw new Error('Not authenticated');

  return raw.map((p) => {
    const practiceId = String(p.id);
    const createdAt = p.createdAt
      ? new Date(p.createdAt).toISOString()
      : p.date
        ? new Date(p.date).toISOString()
        : new Date().toISOString();
    const updatedAt = p.updatedAt ? new Date(p.updatedAt).toISOString() : undefined;

    const sets: PracticeSet[] = (p.sets ?? []).map((s: any, idx: number) => {
      const order = s.set_order ?? idx;
      return {
        id: `${practiceId}-${order}`,
        distance: Number(s.distance),
        repetitions: Number(s.repetitions),
        stroke: String(s.stroke),
        effort: String(s.effort),
        interval: s.interval ?? undefined,
        notes: s.notes ?? undefined,
      };
    });

    return {
      id: practiceId,
      userId: currentUserId,
      date: String(p.date),
      totalYards: Number(p.totalYards),
      duration: Number(p.duration),
      course: p.course ?? undefined,
      focus: p.focus ?? undefined,
      intensity: p.intensity ?? undefined,
      sets,
      notes: p.notes ?? undefined,
      xpEarned: Number(p.xpEarned ?? 0),
      createdAt,
      updatedAt,
    };
  });
}

export interface CreatePracticePayload {
  date: string; // ISO/RFC3339
  totalYards: number;
  duration: number; // minutes
  course?: CourseType;
  focus?: string;
  intensity?: string;
  notes?: string;
  xpEarned?: number;
  sets: Array<{
    distance: number;
    repetitions: number;
    stroke: string;
    effort: string;
    interval?: string;
    notes?: string;
  }>;
}

export async function createPractice(payload: CreatePracticePayload): Promise<void> {
  await sendJsonWithAuth('/api/practices', {
    method: 'POST',
    body: payload,
    invalidatePrefix: 'GET:/api/practices',
  });
}

