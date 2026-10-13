/** Locales supportées (module sans dépendance serveur, importable côté client). */
export const LOCALES = ['fr', 'en', 'mg'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'fr';
