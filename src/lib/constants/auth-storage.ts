/** Clé localStorage de la session — extraite dans un fichier neutre pour éviter un cycle
 * d'imports entre `providers/AuthProvider.tsx` et `lib/utils/current-session.ts`. */
export const AUTH_STORAGE_KEY = 'dpe-srb-auth-session';
