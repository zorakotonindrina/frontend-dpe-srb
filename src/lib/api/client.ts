import { AUTH_STORAGE_KEY } from '@/lib/constants/auth-storage';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

/** Lit le token JWT de la session courante directement depuis localStorage (module bas niveau,
 *  sans accès au contexte React `AuthProvider`). */
function authToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    return (JSON.parse(raw) as { token?: string }).token ?? null;
  } catch {
    return null;
  }
}

// ------------------------------------------------------------------
// Erreur API typée
// ------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ------------------------------------------------------------------
// Client HTTP de base — utilisé par les endpoints déjà branchés sur le
// vrai backend (login, mes-tâches) ; le reste du frontend passe encore
// par les stores de fixtures (lib/fixtures/*) en attendant leur tour.
// ------------------------------------------------------------------

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = authToken();
  // FormData (upload de fichier) : ne pas fixer Content-Type nous-mêmes — le navigateur doit
  // poser lui-même "multipart/form-data; boundary=...", impossible à reproduire à la main.
  const isFormData = options?.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(
      res.status,
      (error as { message?: string }).message ?? 'Erreur serveur',
      error,
    );
  }

  // 204 No Content — rien à désérialiser
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ------------------------------------------------------------------
// Objet api — façade typée
// ------------------------------------------------------------------

export const api = {
  get:    <T>(path: string)                => apiFetch<T>(path),
  post:   <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(path: string, body: unknown) => apiFetch<T>(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(path: string)               => apiFetch<T>(path, { method: 'DELETE' }),
  /** Upload multipart (FormData déjà construit par l'appelant). */
  upload: <T>(path: string, formData: FormData) => apiFetch<T>(path, { method: 'POST', body: formData }),
};

/** GET binaire (PDF...) — apiFetch renvoie du JSON, inadapté ici. Même gestion d'erreur/jeton
 *  qu'apiFetch, réponse en Blob plutôt qu'en JSON. */
export async function getBlob(path: string): Promise<Blob> {
  const token = authToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    throw new ApiError(res.status, res.statusText);
  }
  return res.blob();
}

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Construit un URLSearchParams en ignorant les valeurs undefined/null */
export function buildQS(params: object): string {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params as Record<string, unknown>)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)]),
    ),
  );
  const str = qs.toString();
  return str ? `?${str}` : '';
}
