/**
 * Local dev: leave `VITE_API_URL` unset — the Vite dev server proxies `/api` to the backend.
 * Production: set `VITE_API_URL` to your API origin, e.g. `https://api.swimily.app` (no trailing slash).
 */
export function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_URL;
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!base || typeof base !== 'string' || base.trim() === '') {
    return p;
  }
  return `${base.replace(/\/$/, '')}${p}`;
}

/** Use `include` when calling a different origin so refresh cookies work. */
export function apiFetchCredentials(): RequestCredentials {
  return import.meta.env.VITE_API_URL ? 'include' : 'same-origin';
}
