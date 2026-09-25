'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { ProcessusCreationHub } from '@/components/processus/ProcessusCreationHub';

/**
 * Écran "Dossiers" — point d'entrée de création, façon AUGURE ("choisir un processus" puis
 * redirection vers son écran dédié). La liste/recherche des dossiers existants a déménagé sur
 * `/dossiers/traitement` (voir `traitement/page.tsx`).
 */
export default function DossiersPage() {
  const t = useTranslations('dossiers');

  return (
    <div data-testid="dossiers-page" className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <ProcessusCreationHub />
    </div>
  );
}
