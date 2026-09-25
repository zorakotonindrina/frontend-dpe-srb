import { getRequestConfig } from 'next-intl/server';

/** Locales supportées */
export const LOCALES = ['fr', 'en', 'mg'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';

/**
 * Locale fixe (export statique — pas de serveur pour lire un cookie par
 * requête). Aucun sélecteur de langue n'existe dans l'UI à ce jour, donc
 * l'app tournait déjà toujours en `fr` en pratique : aucun changement de
 * comportement observable.
 */
export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default,
}));
