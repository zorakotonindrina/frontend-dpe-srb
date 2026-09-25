'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ROUTES } from '@/lib/constants/routes';
import { useControlesAptitude } from '@/hooks/useAptitudeLocation';
import type { ControleAptitude } from '@/lib/api/aptitudeLocation';

export default function AptitudeLocationListPage() {
  const t = useTranslations('processus.aptitudeLocation');
  const router = useRouter();
  const { data = [], isLoading } = useControlesAptitude();

  const columns: ColumnDef<ControleAptitude>[] = useMemo(() => [
    { accessorKey: 'objetMission', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.objetMission')} /> },
    { accessorKey: 'dateDebut', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.dateDebut')} /> },
    { accessorKey: 'dateFin', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.dateFin')} /> },
    { accessorKey: 'avisAptitude', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.avis')} /> },
    { accessorKey: 'statut', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} /> },
  ], [t]);

  return (
    <div data-testid="aptitude-location-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Link href={ROUTES.PROCESSUS_APTITUDE_LOCATION_NEW}>
            <Button data-testid="aptitude-location-new-button">
              <Plus className="mr-1.5 h-4 w-4" />
              {t('newTitle')}
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        data={data}
        loading={isLoading}
        onRowClick={(row) => router.push(ROUTES.DOSSIER_DETAIL(row.referenceActe))}
      />
    </div>
  );
}
