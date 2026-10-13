'use client';

import { Languages } from 'lucide-react';
import { useLocaleChoice } from '@/providers/LocaleProvider';
import type { Locale } from '@/i18n/locales';

const LIBELLES: Record<Locale, string> = { fr: 'FR', en: 'EN', mg: 'MG' };

/** Sélecteur de langue de l'interface (français, anglais, malgache). */
export function LanguageSwitcher() {
  const { locale, setLocale } = useLocaleChoice();
  return (
    <label className="flex items-center gap-1 text-xs text-muted-foreground print:hidden">
      <Languages className="size-4" aria-hidden="true" />
      <span className="sr-only">Langue / Language / Fiteny</span>
      <select
        data-testid="language-switcher"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
        className="h-8 rounded-md border bg-background px-1.5 text-xs font-medium text-foreground"
      >
        {(Object.keys(LIBELLES) as Locale[]).map((l) => (
          <option key={l} value={l}>{LIBELLES[l]}</option>
        ))}
      </select>
    </label>
  );
}
