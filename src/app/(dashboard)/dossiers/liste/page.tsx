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
import { estDossierEnCours } from '@/lib/constants/workflow-etapes';
import { buildDossierColumns, DOSSIER_STATUTS } from '../columns';

/**
 * Liste (consultation seule) des dossiers — ouverte depuis le tableau de bord :
 * - `?processus=VA_CONDAMN` : les dossiers d'un processus (cartes « Liste des dossiers ») ;
 * - `?vue=en-cours` : tous les dossiers en cours, tous processus (carte « Dossiers en cours », même décompte).
 * Chaque ligne ouvre le détail en mode consultation : le dossier peut être lu (informations, pièces, historique,
 * documents) mais pas traité. Le traitement reste dans « Traitement de dossier ».
 */
export default function ListeDossiersProcessusPage() {
  const t = useTranslations('dossiers');
  const tStatuts = useTranslations('dossiers.statuts');
  const tNav = useTranslations('nav');
  const router = useRouter();
  const searchParams = useSearchParams();
  const processusCode = searchParams.get('processus') ?? '';
  const vueEnCours = searchParams.get('vue') === 'en-cours';

  const navLabelKey = PROCESSUS_CODE_NAV_LABEL_KEYS[processusCode];
  const { data: dossiersBruts = [], isLoading } = useDossiers(navLabelKey ? { processusCode } : {});
  const dossiers = vueEnCours ? dossiersBruts.filter((d) => estDossierEnCours(d.statut)) : dossiersBruts;
  const { data: ministeres = [] } = useMinisteres();

  // Pour un processus, il est déjà fixé par la carte cliquée : la colonne « Processus » est inutile ;
  // pour la vue « en cours », elle distingue les processus et devient filtrable.
  const columns = useMemo(
    () => buildDossierColumns(t, tStatuts, tNav, ministeres)
      .filter((c) => vueEnCours || (c as { accessorKey?: string }).accessorKey !== 'processusCode'),
    [t, tStatuts, tNav, ministeres, vueEnCours],
  );
  const filters: FacetedFilterDef[] = useMemo(() => [
    ...(vueEnCours ? [{
      columnId: 'processusCode',
      title: t('columns.processus'),
      options: Object.entries(PROCESSUS_CODE_NAV_LABEL_KEYS).map(([code, cle]) => ({ value: code, label: tNav(cle) })),
    }] : []),
    {
      columnId: 'statut',
      title: t('columns.statut'),
      options: DOSSIER_STATUTS.filter((statut) => !vueEnCours || estDossierEnCours(statut))
        .map((statut) => ({ value: statut, label: tStatuts(statut) })),
    },
  ], [t, tStatuts, tNav, vueEnCours]);

  const retour = (
    <Link href={ROUTES.DASHBOARD}>
      <Button variant="outline" data-testid="liste-dossiers-retour-button">
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        {t('liste.retour')}
      </Button>
    </Link>
  );

  if (vueEnCours) {
    return (
      <div data-testid="liste-dossiers-page" className="space-y-6">
        <PageHeader title={t('liste.titreEnCours')} description={t('liste.description')} actions={retour} />
        <DataTable
          columns={columns}
          data={dossiers}
          filters={filters}
          loading={isLoading}
          onRowClick={(row) => router.push(ROUTES.DOSSIER_CONSULTATION(row.referenceActe))}
          exportFilename="dossiers-en-cours"
        />
      </div>
    );
  }

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
