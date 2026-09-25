'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { api, ApiError } from '@/lib/api/client';
import { auditApi } from '@/lib/api/audit';
import { AUTH_STORAGE_KEY } from '@/lib/constants/auth-storage';
import type { UserRole } from '@/types/auth.types';

export interface AuthUser {
  id:     string;
  name:   string;
  login:  string;
  role:   UserRole;
  sigle?: string;
  site?:  string;
  token:  string;
}

/** Réponse de POST /api-financiere/rest/login (RuleAuthentificationController, hub api-financiere). */
interface LoginResponse {
  token:                string;
  utilisateurMatricule: string;
  nom:                  string;
  prenom:               string;
  role:                 UserRole;
  sigle?:               string;
  site?:                string;
}

export type LoginResult =
  | { ok: true }
  | { ok: false; code: 'ACCOUNT_DISABLED' | 'INVALID_CREDENTIALS' };

interface AuthContextValue {
  user:            AuthUser | null;
  isAuthenticated: boolean;
  isLoading:       boolean;
  login:  (login: string, password: string) => Promise<LoginResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Authentification réelle contre le hub `api-financiere`
 * (POST /api-financiere/rest/login, via la gateway). Le token JWT renvoyé est
 * stocké avec le reste de la session ; `lib/api/client.ts` le relit directement
 * depuis localStorage pour l'attacher en `Authorization` aux appels suivants.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedUser, setStoredUser, removeStoredUser] = useLocalStorage<AuthUser | null>(AUTH_STORAGE_KEY, null);

  // Le premier rendu doit rester identique entre le HTML statique et le
  // client avant que useLocalStorage n'ait lu le localStorage (cf. son propre
  // commentaire) — on ne considère la session connue qu'après ce montage.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    // Détection de montage client — cas explicitement couvert par les docs
    // React (hydratation SSR-safe), aucun équivalent "ajustement pendant le
    // rendu" n'existe pour ce cas précis (pas de prop à comparer).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHydrated(true);
  }, []);

  const login = useCallback(async (loginValue: string, password: string): Promise<LoginResult> => {
    let found: LoginResponse;
    try {
      found = await api.post<LoginResponse>('/api-financiere/rest/login', { login: loginValue, password });
    } catch (e) {
      if (e instanceof ApiError && e.status === 403) {
        auditApi.log('CONNEXION_ECHEC', `Tentative de connexion sur un compte désactivé ("${loginValue}")`, { utilisateurMatricule: loginValue });
        return { ok: false, code: 'ACCOUNT_DISABLED' };
      }
      auditApi.log('CONNEXION_ECHEC', `Tentative de connexion échouée pour "${loginValue}"`, { utilisateurMatricule: loginValue });
      return { ok: false, code: 'INVALID_CREDENTIALS' };
    }

    const nom = `${found.nom} ${found.prenom}`.trim();
    auditApi.log('CONNEXION_REUSSIE', `Connexion de ${nom}`, { utilisateurMatricule: found.utilisateurMatricule, utilisateurNom: nom });
    setStoredUser({
      id:    found.utilisateurMatricule,
      name:  nom,
      login: loginValue,
      role:  found.role,
      sigle: found.sigle,
      site:  found.site,
      token: found.token,
    });
    return { ok: true };
  }, [setStoredUser]);

  const logout = useCallback(() => {
    if (storedUser) {
      auditApi.log('DECONNEXION', `Déconnexion de ${storedUser.name}`, { utilisateurMatricule: storedUser.id, utilisateurNom: storedUser.name });
    }
    removeStoredUser();
  }, [removeStoredUser, storedUser]);

  const value: AuthContextValue = {
    user:            hydrated ? storedUser : null,
    isAuthenticated: hydrated && storedUser !== null,
    isLoading:       !hydrated,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext doit être utilisé sous AuthProvider');
  return ctx;
}
