'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';
import mg from '../../messages/mg.json';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/i18n/locales';

/** Clé localStorage de la langue choisie (préférence par poste, comme la session). */
export const LOCALE_STORAGE_KEY = 'dpe-srb-locale';

type Messages = Record<string, unknown>;

/** Complète `cible` avec les clés de `base` absentes (repli sur le français pour les quelques clés
 *  non encore traduites en anglais ou en malgache). */
function completer(base: Messages, cible: Messages): Messages {
  const out: Messages = { ...base };
  for (const [cle, valeur] of Object.entries(cible)) {
    const b = base[cle];
    out[cle] = valeur && typeof valeur === 'object' && b && typeof b === 'object'
      ? completer(b as Messages, valeur as Messages)
      : valeur;
  }
  return out;
}

const MESSAGES: Record<Locale, Messages> = {
  fr,
  en: completer(fr, en),
  mg: completer(fr, mg),
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue>({ locale: DEFAULT_LOCALE, setLocale: () => {} });

function lireLocaleStockee(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const v = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return (LOCALES as readonly string[]).includes(v ?? '') ? (v as Locale) : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

/**
 * Langue de l'interface côté client (fr / en / mg). L'application est un export statique : la
 * langue ne peut pas être choisie par le serveur à chaque requête, elle est donc lue et mémorisée
 * dans le navigateur, et les trois fichiers de messages sont embarqués.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // Lecture après montage : le rendu statique initial reste en français (pas d'écart d'hydratation).
  useEffect(() => {
    const stockee = lireLocaleStockee();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stockee !== DEFAULT_LOCALE) setLocaleState(stockee);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, l);
    } catch {
      // stockage indisponible : le choix vaut pour la session en cours
    }
  }, []);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={value}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Indian/Antananarivo">
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
}

export function useLocaleChoice(): LocaleContextValue {
  return useContext(LocaleContext);
}
