import { authService } from './auth';

export type PreferredCourse = 'SCY' | 'LCM';
export type DistanceUnits = 'yards' | 'meters';

export interface ProfileIdentityPayload {
  name: string;
  team: string;
  age: number;
  gender: 'M' | 'F';
}

export interface ProfilePreferencesPayload {
  preferredCourse: PreferredCourse;
  units: DistanceUnits;
  haptics: boolean;
  analytics: boolean;
}

export interface ProfileNotificationsPayload {
  pushEnabled: boolean;
  emailEnabled: boolean;
  practiceReminders: boolean;
  achievements: boolean;
  weeklyReports: boolean;
  meetReminders: boolean;
  prAlerts: boolean;
}

export interface OwnProfilePayload {
  profile: ProfileIdentityPayload;
  preferences: ProfilePreferencesPayload;
  notifications: ProfileNotificationsPayload;
}

export interface OwnProfileResponse {
  profile: {
    name: string | null;
    team: string | null;
    age: number | null;
    gender: 'M' | 'F' | null;
    email: string;
    isPremium: boolean;
  };
  preferences: {
    preferredCourse: PreferredCourse;
    units: DistanceUnits;
    haptics: boolean;
    analytics: boolean;
  };
  notifications: ProfileNotificationsPayload;
  onboardingComplete: boolean;
}

function getApiErrorMessage(res: Response): Promise<string | null> {
  return res
    .json()
    .then((body) => (typeof body?.error === 'string' ? body.error : null))
    .catch(() => null);
}

export async function fetchOwnProfile(): Promise<OwnProfileResponse> {
  const res = await authService.fetchWithAuth('/api/profile', { method: 'GET' });
  if (!res.ok) {
    const msg = await getApiErrorMessage(res);
    throw new Error(msg || `Failed to fetch profile (${res.status})`);
  }
  return (await res.json()) as OwnProfileResponse;
}

export async function saveOwnProfile(payload: OwnProfilePayload): Promise<OwnProfileResponse> {
  const res = await authService.fetchWithAuth('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const msg = await getApiErrorMessage(res);
    throw new Error(msg || `Failed to save profile (${res.status})`);
  }

  return (await res.json()) as OwnProfileResponse;
}

export function parseAgeString(age: string): number | null {
  const trimmed = age.trim();
  if (!trimmed) return null;

  const n = Number(trimmed);
  if (!Number.isFinite(n) || !Number.isInteger(n)) return null;
  if (n < 1 || n > 119) return null;
  return n;
}

export function ageNumberToString(age: number | null | undefined): string {
  if (age === null || age === undefined) return '';
  return String(age);
}

