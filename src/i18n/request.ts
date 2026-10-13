import { getRequestConfig } from 'next-intl/server';

import { DEFAULT_LOCALE } from './locales';

export { LOCALES, DEFAULT_LOCALE, type Locale } from './locales';

/**
 * Locale du rendu statique (export statique — pas de serveur pour lire un
 * cookie par requête) : le HTML est généré en `fr`, puis le choix de
 * l'utilisateur (fr / en / mg) est appliqué côté client par LocaleProvider.
 */
export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: (await import(`../../messages/${DEFAULT_LOCALE}.json`)).default,
}));
