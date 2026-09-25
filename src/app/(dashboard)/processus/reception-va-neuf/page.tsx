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
import { useReceptionsNeuf } from '@/hooks/useReceptionNeuf';
import type { ReceptionVaNeuf } from '@/lib/api/receptionNeuf';

export default function ReceptionNeufListPage() {
  const t = useTranslations('processus.receptionVaNeuf');
  const router = useRouter();
  const { data = [], isLoading } = useReceptionsNeuf();

  const columns: ColumnDef<ReceptionVaNeuf>[] = useMemo(() => [
    { accessorKey: 'referenceActe', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.reference')} /> },
    { accessorKey: 'fournisseurNom', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.fournisseur')} /> },
    { accessorKey: 'datePv', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.datePv')} /> },
    { accessorKey: 'statut', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} /> },
  ], [t]);

  return (
    <div data-testid="reception-neuf-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Link href={ROUTES.PROCESSUS_RECEPTION_NEUF_NEW}>
            <Button data-testid="reception-neuf-new-button">
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
