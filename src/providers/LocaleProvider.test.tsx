import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useTranslations } from 'next-intl';
import { LocaleProvider, LOCALE_STORAGE_KEY } from './LocaleProvider';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import fr from '../../messages/fr.json';
import en from '../../messages/en.json';
import mg from '../../messages/mg.json';

function Libelle() {
  const t = useTranslations('common');
  return <p data-testid="libelle">{t('save')}</p>;
}

function Ecran() {
  return (
    <LocaleProvider>
      <LanguageSwitcher />
      <Libelle />
    </LocaleProvider>
  );
}

describe('LocaleProvider + LanguageSwitcher', () => {
  beforeEach(() => window.localStorage.clear());

  it('affiche le français par défaut', () => {
    render(<Ecran />);
    expect(screen.getByTestId('libelle')).toHaveTextContent(fr.common.save);
  });

  it('bascule en anglais puis en malgache et mémorise le choix', async () => {
    const user = userEvent.setup({ delay: null });
    render(<Ecran />);

    await user.selectOptions(screen.getByTestId('language-switcher'), 'en');
    expect(screen.getByTestId('libelle')).toHaveTextContent(en.common.save);
    expect(window.localStorage.getItem(LOCALE_STORAGE_KEY)).toBe('en');
    expect(document.documentElement.lang).toBe('en');

    await user.selectOptions(screen.getByTestId('language-switcher'), 'mg');
    expect(screen.getByTestId('libelle')).toHaveTextContent(mg.common.save);
  });

  it('reprend la langue mémorisée au chargement', async () => {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, 'mg');
    render(<Ecran />);
    expect(await screen.findByText(mg.common.save)).toBeInTheDocument();
  });
});
