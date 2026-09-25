'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ROUTES } from '@/lib/constants/routes';
import { useChauffeurTests } from '@/hooks/useChauffeurTest';
import { useChauffeurs } from '@/hooks/useChauffeurs';
import type { ChauffeurTest } from '@/lib/api/chauffeurTest';

export default function TestChauffeurListPage() {
  const t = useTranslations('processus.testChauffeur');
  const router = useRouter();
  const { data = [], isLoading } = useChauffeurTests();
  const { data: chauffeurs = [] } = useChauffeurs();

  const columns: ColumnDef<ChauffeurTest>[] = useMemo(() => [
    {
      id: 'chauffeur',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.chauffeur')} />,
      cell: ({ row }) => chauffeurs.find((c) => c.chauffeurId === row.original.chauffeurId)?.nom ?? '—',
    },
    { accessorKey: 'dateTest', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.dateTest')} /> },
    {
      id: 'resultat',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.resultat')} />,
      cell: ({ row }) => (row.original.resultat ? (
        <Badge variant={row.original.resultat === 'NON_APTE' ? 'destructive' : 'default'}>
          {row.original.resultat === 'NON_APTE' ? t('resultatDefavorable') : t('resultatFavorable')}
        </Badge>
      ) : '—'),
    },
    { accessorKey: 'statut', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} /> },
  ], [t, chauffeurs]);

  return (
    <div data-testid="test-chauffeur-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Link href={ROUTES.PROCESSUS_TEST_CHAUFFEUR_NEW}>
            <Button data-testid="test-chauffeur-new-button">
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
