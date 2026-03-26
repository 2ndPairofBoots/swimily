import { authService } from './auth';
import { getJsonWithAuth, sendJsonWithAuth } from './api-client';
import { Meet } from './types';

export async function fetchMeets(): Promise<Meet[]> {
  const raw = await getJsonWithAuth<Array<any>>('/api/meets', { cacheKey: 'GET:/api/meets', ttlMs: 10_000 });
  return raw.map((m) => ({
    id: String(m.id),
    userId: String(m.userId ?? authService.getCurrentUser()?.id ?? ''),
    name: String(m.name),
    date: String(m.date),
    location: m.location ?? undefined,
    meetType: m.meetType as Meet['meetType'],
    notes: m.notes ?? undefined,
  }));
}

export interface CreateMeetPayload {
  name: string;
  date: string; // yyyy-mm-dd
  location?: string;
  meetType: Meet['meetType'];
  notes?: string;
}

export async function createMeet(payload: CreateMeetPayload): Promise<string> {
  const res = await sendJsonWithAuth('/api/meets', {
    method: 'POST',
    body: payload,
    invalidatePrefix: 'GET:/api/meets',
  });

  const body = (await res.json()) as { id: string };
  return String(body.id);
}

export async function deleteMeet(id: string): Promise<void> {
  await sendJsonWithAuth(`/api/meets/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    invalidatePrefix: 'GET:/api/meets',
  });
}

