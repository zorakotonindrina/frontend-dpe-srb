'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants/routes';
import { useAuditLog } from '@/hooks/useAudit';
import type { AuditLogEntry } from '@/lib/api/audit';

export default function AdministrationAuditPage() {
  const t = useTranslations('administration.audit');
  const { data = [], isLoading } = useAuditLog();

  const columns: ColumnDef<AuditLogEntry>[] = useMemo(() => [
    {
      accessorKey: 'dateAction',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.date')} />,
      cell: ({ row }) => new Date(row.original.dateAction).toLocaleString('fr-FR'),
    },
    {
      id: 'utilisateur',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.utilisateur')} />,
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.utilisateurNom || '—'}
          {row.original.utilisateurMatricule && <span className="ml-1 text-xs text-muted-foreground">({row.original.utilisateurMatricule})</span>}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.action')} />,
      cell: ({ row }) => <Badge variant="outline">{row.original.action}</Badge>,
    },
    {
      id: 'reference',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.reference')} />,
      cell: ({ row }) => (
        row.original.referenceActe ? (
          <Link href={ROUTES.DOSSIER_DETAIL(row.original.referenceActe)} className="text-primary underline" onClick={(e) => e.stopPropagation()}>
            {row.original.referenceActe}
          </Link>
        ) : '—'
      ),
    },
    { accessorKey: 'detail', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.detail')} /> },
  ], [t]);

  return (
    <div data-testid="administration-audit-page" className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <DataTable columns={columns} data={data} loading={isLoading} />
    </div>
  );
}
