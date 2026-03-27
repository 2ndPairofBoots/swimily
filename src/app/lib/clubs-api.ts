import { authService } from './auth';

export interface ClubSearchResult {
  id: string;
  name: string;
  lsc?: string;
  city?: string;
  state?: string;
}

export async function searchClubs(query: string, limit = 10): Promise<ClubSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const res = await authService.fetchWithAuth(
    `/api/clubs/search?q=${encodeURIComponent(q)}&limit=${encodeURIComponent(String(limit))}`,
    { method: 'GET' }
  );
  if (!res.ok) return [];
  return (await res.json()) as ClubSearchResult[];
}

