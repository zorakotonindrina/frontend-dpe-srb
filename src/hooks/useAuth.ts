'use client';

import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import type { UserRole } from '@/types/auth.types';
import { ROLE_PERMISSIONS } from '@/types/auth.types';

/**
 * Hook utilitaire pour accéder aux informations de la session courante
 * et aux actions d'authentification.
 */
export function useAuth() {
  const { user, isAuthenticated, isLoading, logout: contextLogout } = useAuthContext();
  const router = useRouter();

  const displayName = user ? (user.name ?? 'Utilisateur') : null;
  const role: UserRole | null = user?.role ?? null;

  function hasPermission(permission: string): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
  }

  function logout() {
    contextLogout();
    router.push('/login');
  }

  return {
    user,
    displayName,
    role,
    isLoading,
    isAuthenticated,
    hasPermission,
    logout,
  };
}
