'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import type { FacetedFilterDef } from '@/components/data-table/data-table.types';
import { useDossiers } from '@/hooks/useDossiers';
import { useMinisteres } from '@/hooks/useReferentiels';
import { ROUTES } from '@/lib/constants/routes';
import { PROCESSUS_CODE_NAV_LABEL_KEYS } from '@/lib/constants/processus';
import { buildDossierColumns, DOSSIER_STATUTS } from '../columns';

/**
 * Liste (consultation seule) des dossiers d'un processus — ouverte depuis les cartes du tableau de bord
 * (`?processus=VA_CONDAMN`). Chaque ligne ouvre le détail en mode consultation : le dossier peut être lu
 * (informations, pièces, historique, documents) mais pas traité. Le traitement reste dans « Traitement de dossier ».
 */
export default function ListeDossiersProcessusPage() {
  const t = useTranslations('dossiers');
  const tStatuts = useTranslations('dossiers.statuts');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const processusCode = useSearchParams().get('processus') ?? '';

  const navLabelKey = PROCESSUS_CODE_NAV_LABEL_KEYS[processusCode];
  const { data: dossiers = [], isLoading } = useDossiers(navLabelKey ? { processusCode } : {});
  const { data: ministeres = [] } = useMinisteres();

  // Le processus est déjà fixé par la carte cliquée : la colonne « Processus » est inutile ici.
  const columns = useMemo(
    () => buildDossierColumns(t, tStatuts, tNav, ministeres).filter((c) => (c as { accessorKey?: string }).accessorKey !== 'processusCode'),
    [t, tStatuts, tNav, ministeres],
  );
  const filters: FacetedFilterDef[] = useMemo(() => [{
    columnId: 'statut',
    title: t('columns.statut'),
    options: DOSSIER_STATUTS.map((statut) => ({ value: statut, label: tStatuts(statut) })),
  }], [t, tStatuts]);

  const retour = (
    <Link href={ROUTES.DASHBOARD}>
      <Button variant="outline" data-testid="liste-dossiers-retour-button">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        {t('liste.retour')}
      </Button>
    </Link>
  );

  if (!navLabelKey) {
    return (
      <div data-testid="liste-dossiers-page" className="space-y-6">
        <PageHeader title={t('liste.title')} actions={retour} />
        <p className="text-sm text-muted-foreground" data-testid="liste-dossiers-processus-inconnu">{t('liste.processusInconnu')}</p>
      </div>
    );
  }

  return (
    <div data-testid="liste-dossiers-page" className="space-y-6">
      <PageHeader
        title={`${t('liste.title')} — ${tNav(navLabelKey as Parameters<typeof tNav>[0])}`}
        description={t('liste.description')}
        actions={retour}
      />
      <DataTable
        columns={columns}
        data={dossiers}
        filters={filters}
        loading={isLoading}
        onRowClick={(row) => router.push(ROUTES.DOSSIER_CONSULTATION(row.referenceActe))}
        exportFilename={`dossiers-${processusCode.toLowerCase()}`}
      />
    </div>
  );
}
