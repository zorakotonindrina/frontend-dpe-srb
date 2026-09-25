'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { DataTable } from '@/components/data-table/DataTable';
import type { FacetedFilterDef } from '@/components/data-table/data-table.types';
import { ROUTES } from '@/lib/constants/routes';
import { useVehicules, useDeleteVehicule } from '@/hooks/useVehicules';
import { useEtatsVehicule, useCategoriesVehicule } from '@/hooks/useReferentiels';
import type { Vehicule } from '@/lib/api/vehicules';
import { buildVehiculeColumns } from './columns';

export default function VehiculesPage() {
  const t = useTranslations('vehicules');
  const router = useRouter();
  const { data: vehicules = [], isLoading } = useVehicules();
  const { data: etats = [] } = useEtatsVehicule();
  const { data: categories = [] } = useCategoriesVehicule();
  const deleteVehicule = useDeleteVehicule();

  const [deleteTarget, setDeleteTarget] = useState<Vehicule | null>(null);
  const [motif, setMotif] = useState('');

  const columns = useMemo(() => buildVehiculeColumns(t, setDeleteTarget), [t]);

  // Options des facettes STRUCTURE/année de recensement dérivées des véhicules déjà chargés (pas
  // de référentiel borné pour la STRUCTURE — 20 101 codes SOA, exposés uniquement en recherche
  // typeahead ailleurs dans ce frontend) — reflète l'état courant de chaque véhicule (dernier
  // recensement actif, voir q_vehicule_liste), pas tout l'historique des campagnes passées.
  const structures = useMemo(
    () => Array.from(new Set(vehicules.map((v) => v.soaCode).filter((v): v is string => Boolean(v)))).sort(),
    [vehicules],
  );
  const anneesRecensement = useMemo(
    () => Array.from(new Set(vehicules.map((v) => v.exercice).filter((v): v is string => Boolean(v)))).sort().reverse(),
    [vehicules],
  );

  const filters: FacetedFilterDef[] = useMemo(() => [
    {
      columnId: 'etatVehicule',
      title: t('filters.etat'),
      options: etats.map((e) => ({ value: e.etatVehicule, label: e.libelle })),
    },
    {
      columnId: 'categorieVehicule',
      title: t('filters.categorie'),
      options: categories.map((c) => ({ value: c.categorieCode, label: c.categorieLibelle })),
    },
    {
      columnId: 'soaCode',
      title: t('filters.structure'),
      options: structures.map((s) => ({ value: s, label: s })),
    },
    {
      columnId: 'exercice',
      title: t('filters.anneeRecensement'),
      options: anneesRecensement.map((a) => ({ value: a, label: a })),
    },
  ], [t, etats, categories, structures, anneesRecensement]);

  function closeDeleteDialog() {
    setDeleteTarget(null);
    setMotif('');
  }

  function confirmDelete() {
    if (!deleteTarget || !motif.trim()) return;
    deleteVehicule.mutate(
      { id: deleteTarget.vehiculeId, motif: motif.trim() },
      { onSuccess: closeDeleteDialog },
    );
  }

  return (
    <div data-testid="vehicules-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Link href={ROUTES.VEHICULE_NEW}>
            <Button data-testid="vehicules-new-button">
              <Plus className="mr-1.5 h-4 w-4" />
              {t('newTitle')}
            </Button>
          </Link>
        }
      />

      <DataTable
        columns={columns}
        data={vehicules}
        filters={filters}
        loading={isLoading}
        onRowClick={(row) => router.push(ROUTES.VEHICULE_DETAIL(row.vehiculeId))}
        exportFilename="vehicules"
      />

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmDescription')}
        variant="destructive"
        loading={deleteVehicule.isPending}
        onConfirm={motif.trim() ? confirmDelete : undefined}
        testId="vehicule-delete-dialog"
      >
        <Textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder={t('deleteMotifPlaceholder')}
          aria-label={t('deleteMotifLabel')}
          data-testid="vehicule-delete-motif-input"
        />
      </ConfirmDialog>
    </div>
  );
}
