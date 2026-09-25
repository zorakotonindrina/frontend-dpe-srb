export const PATTERNS = {
  MATRICULE:    /^\d{6,12}$/,
  LOGIN:        /^[A-Za-z0-9._@-]{3,100}$/,
  PHONE:        /^\+?[0-9]{6,20}$/,
  FREE_TEXT:    /^[A-Za-zÀ-ÿ0-9\s.,\-]{0,100}$/,
  POSTE_AGENT:  /^[A-Z0-9]\d{6}$/,
} as const;

/**
 * Valide une valeur contre un pattern et la retourne trimée.
 * Lève une Error si invalide — à capturer dans le try/catch appelant.
 */
export function sanitize(value: string, pattern: RegExp, field = 'value'): string {
  const trimmed = value.trim();
  if (!pattern.test(trimmed)) throw new Error(`Invalid ${field}`);
  return trimmed;
}
