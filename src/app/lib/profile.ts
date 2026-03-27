import { authService } from './auth';

export type PreferredCourse = 'SCY' | 'LCM' | 'SCM';
export type DistanceUnits = 'yards' | 'meters';

export interface ProfileIdentityPayload {
  name: string;
  team?: string;
  birthday: string; // yyyy-mm-dd
  gender: 'M' | 'F';
}

export interface ProfilePreferencesPayload {
  preferredCourses: PreferredCourse[];
  units: DistanceUnits;
  haptics: boolean;
  analytics: boolean;
}

export interface ProfileNotificationsPayload {
  notificationsEnabled: boolean;
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
    birthday: string | null;
    gender: 'M' | 'F' | null;
    email: string;
    isPremium: boolean;
  };
  preferences: {
    preferredCourse: PreferredCourse;
    preferredCourses?: PreferredCourse[];
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
  const body = (await res.json()) as OwnProfileResponse;
  if (!body.preferences.preferredCourses || body.preferences.preferredCourses.length === 0) {
    body.preferences.preferredCourses = [body.preferences.preferredCourse];
  }
  if ((body.notifications as any).notificationsEnabled === undefined) {
    (body.notifications as any).notificationsEnabled = true;
  }
  return body;
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

export function isValidBirthday(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  if (d > now) return false;
  const ageYears = now.getUTCFullYear() - d.getUTCFullYear() - (
    (now.getUTCMonth() < d.getUTCMonth()) ||
    (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())
      ? 1
      : 0
  );
  return ageYears >= 5 && ageYears <= 120;
}

export function ageNumberToString(age: number | null | undefined): string {
  if (age === null || age === undefined) return '';
  return String(age);
}

export function ageFromBirthdayString(birthday: string | null | undefined): string {
  if (!birthday) return '';
  const d = new Date(birthday);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const ageYears = now.getUTCFullYear() - d.getUTCFullYear() - (
    (now.getUTCMonth() < d.getUTCMonth()) ||
    (now.getUTCMonth() === d.getUTCMonth() && now.getUTCDate() < d.getUTCDate())
      ? 1
      : 0
  );
  return String(ageYears);
}

