import { getJsonWithAuth, sendJsonWithAuth } from './api-client';

export type RecordsCourse = 'SCY' | 'LCM' | 'SCM';

export interface PersonalRecord {
  id: string;
  event: string;
  course: RecordsCourse;
  timeSeconds?: number;
  goalTimeSeconds?: number;
  finaPoints?: number;
  cuts?: string[];
  meetName?: string;
  meetDate?: string;
}

export async function fetchRecords(course: 'SCY' | 'LCM'): Promise<PersonalRecord[]> {
  const url = `/api/records?course=${encodeURIComponent(course)}`;
  const raw = await getJsonWithAuth<Array<any>>(url, { cacheKey: `GET:${url}`, ttlMs: 10_000 });
  return raw.map((r) => ({
    id: String(r.id),
    event: String(r.event),
    course: r.course as RecordsCourse,
    timeSeconds: r.timeSeconds == null ? undefined : Number(r.timeSeconds),
    goalTimeSeconds: r.goalTimeSeconds == null ? undefined : Number(r.goalTimeSeconds),
    finaPoints: r.finaPoints == null ? undefined : Number(r.finaPoints),
    cuts: r.cuts ?? undefined,
    meetName: r.meetName ?? undefined,
    meetDate: r.meetDate ?? undefined,
  }));
}

export interface UpsertRecordPayload {
  event: string;
  course: RecordsCourse;
  date?: string;
  timeSeconds?: number;
  goalTimeSeconds?: number;
  finaPoints?: number;
  cuts?: string[];
  meetName?: string;
  meetDate?: string;
}

export async function upsertRecord(payload: UpsertRecordPayload): Promise<void> {
  await sendJsonWithAuth('/api/records', {
    method: 'PUT',
    body: payload,
    invalidatePrefix: 'GET:/api/records',
  });
}

