import { AUTH_STORAGE_KEY } from '@/lib/constants/auth-storage';

interface SessionUser {
  id: string;
  name: string;
}

/** Lecture directe du localStorage (hors contexte React) — utilisable depuis lib/api/*.ts,
 * qui n'a pas accès aux hooks, pour attribuer une action au journal d'audit. */
export function getCurrentSessionUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}
