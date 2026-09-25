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
import { useChauffeurs } from '@/hooks/useChauffeurs';
import { useMinisteres } from '@/hooks/useReferentiels';
import type { Chauffeur } from '@/lib/api/chauffeurs';

export default function ChauffeursListPage() {
  const t = useTranslations('chauffeurs');
  const router = useRouter();
  const { data = [], isLoading } = useChauffeurs();
  const { data: ministeres = [] } = useMinisteres();

  const columns: ColumnDef<Chauffeur>[] = useMemo(() => [
    { accessorKey: 'nom', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nom')} /> },
    { accessorKey: 'matricule', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.matricule')} /> },
    { accessorKey: 'permis', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.permis')} /> },
    {
      accessorKey: 'minCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ministere')} />,
      cell: ({ row }) => ministeres.find((m) => m.minCode === row.original.minCode)?.libelle ?? row.original.minCode,
    },
  ], [t, ministeres]);

  return (
    <div data-testid="chauffeurs-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Link href={ROUTES.CHAUFFEUR_NEW}>
            <Button data-testid="chauffeurs-new-button">
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
        onRowClick={(row) => router.push(ROUTES.CHAUFFEUR_DETAIL(row.chauffeurId))}
      />
    </div>
  );
}
