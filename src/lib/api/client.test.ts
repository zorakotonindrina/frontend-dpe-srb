import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError } from './client';
import { AUTH_STORAGE_KEY } from '@/lib/constants/auth-storage';

function reponse(status: number, body: unknown = {}) {
  return Promise.resolve(new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }));
}

describe('client API — session expirée (401)', () => {
  const assign = vi.fn();

  beforeEach(() => {
    window.localStorage.clear();
    assign.mockReset();
    vi.stubGlobal('location', { ...window.location, pathname: '/dossiers', search: '', assign });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('efface la session et renvoie vers la connexion quand un jeton est refusé', async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 'jeton-expire' }));
    vi.stubGlobal('fetch', vi.fn(() => reponse(401)));

    await expect(api.get('/api-workflow/api/dossiers')).rejects.toBeInstanceOf(ApiError);
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
    expect(assign).toHaveBeenCalledWith('/login?expire=1&callbackUrl=%2Fdossiers');
  });

  it('ne redirige pas sur un échec de connexion (aucun jeton envoyé)', async () => {
    vi.stubGlobal('fetch', vi.fn(() => reponse(401, { message: 'Identifiants invalides' })));

    await expect(api.post('/api-financiere/rest/login', { login: 'x', password: 'y' })).rejects.toMatchObject({ status: 401 });
    expect(assign).not.toHaveBeenCalled();
  });

  it('envoie le jeton en en-tête Authorization', async () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token: 'abc' }));
    const fetchMock = vi.fn(() => reponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    await api.get('/api-vehicules/api/vehicules');
    const init = (fetchMock.mock.calls[0] as unknown as [string, RequestInit])[1];
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer abc');
  });
});
