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
import { useEvaluationsCondamnation } from '@/hooks/useCondamnation';
import { useVehicules } from '@/hooks/useVehicules';
import type { EvaluationCondamnation } from '@/lib/api/condamnation';

export default function CondamnationListPage() {
  const t = useTranslations('processus.condamnation');
  const router = useRouter();
  const { data = [], isLoading } = useEvaluationsCondamnation();
  const { data: vehicules = [] } = useVehicules();

  const columns: ColumnDef<EvaluationCondamnation>[] = useMemo(() => [
    {
      id: 'vehicule',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.vehicule')} />,
      cell: ({ row }) => vehicules.find((v) => v.vehiculeId === row.original.vehiculeId)?.vehiculeImmatriculation ?? '—',
    },
    { accessorKey: 'valeurEstimee', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.valeurEstimee')} /> },
    { accessorKey: 'miseAPrix', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.miseAPrix')} /> },
    { accessorKey: 'motifCondamnation', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.motifCondamnation')} /> },
    { accessorKey: 'statut', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} /> },
  ], [t, vehicules]);

  return (
    <div data-testid="condamnation-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Link href={ROUTES.PROCESSUS_CONDAMNATION_NEW}>
            <Button data-testid="condamnation-new-button">
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
