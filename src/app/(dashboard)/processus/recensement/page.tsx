'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ROUTES } from '@/lib/constants/routes';
import { useRecensements } from '@/hooks/useRecensement';
import { recensementApi, type Recensement } from '@/lib/api/recensement';
import { useMinisteres, useSoas } from '@/hooks/useReferentiels';
import { exportReportingToExcel } from '@/lib/utils/export-reporting-excel';

export default function RecensementListPage() {
  const t = useTranslations('processus.recensement');
  const router = useRouter();
  const { data = [], isLoading } = useRecensements();
  const { data: ministeres = [] } = useMinisteres();
  const { data: soas = [] } = useSoas();
  const [exporting, setExporting] = useState(false);

  async function handleExportPublipostage() {
    setExporting(true);
    try {
      const rows = await Promise.all(data.map(async (r) => {
        const lignes = await recensementApi.lignes(r.recensementId);
        return [
          r.referenceActe,
          ministeres.find((m) => m.minCode === r.minCode)?.libelle ?? r.minCode,
          soas.find((s) => s.soaCode === r.soaCode)?.libelle ?? r.soaCode ?? '',
          r.niveauType === 'CENTRALE' ? 'Centrale' : r.niveauType === 'REGIONALE' ? 'Régionale' : r.niveauType,
          r.niveauLibelle,
          r.dateSaisie ? new Date(r.dateSaisie).getFullYear() : '',
          lignes.length,
          r.pointFocalNom,
          r.pointFocalFonction,
          r.pointFocalTel,
          r.pointFocalEmail,
          r.dateSaisie,
        ];
      }));
      exportReportingToExcel(
        [{
          name: 'Publipostage quitus',
          headers: [
            'Référence', 'Ministère', 'SOA', 'Niveau', 'Catégorie', 'AnnéeExercice',
            'NombreVéhicules', 'PointFocalNom', 'PointFocalFonction', 'PointFocalTél', 'PointFocalEmail', 'DateSaisie',
          ],
          rows,
        }],
        'publipostage-quitus-recensement',
      );
    } finally {
      setExporting(false);
    }
  }

  const columns: ColumnDef<Recensement>[] = useMemo(() => [
    { accessorKey: 'referenceActe', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.reference')} /> },
    {
      accessorKey: 'minCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ministere')} />,
      cell: ({ row }) => ministeres.find((m) => m.minCode === row.original.minCode)?.libelle ?? row.original.minCode,
    },
    {
      accessorKey: 'soaCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.soa')} />,
      cell: ({ row }) => soas.find((s) => s.soaCode === row.original.soaCode)?.libelle ?? row.original.soaCode ?? '',
    },
    { accessorKey: 'dateSaisie', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.dateSaisie')} /> },
    { accessorKey: 'statut', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} /> },
  ], [t, ministeres, soas]);

  return (
    <div data-testid="recensement-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPublipostage}
              disabled={exporting || data.length === 0}
              data-testid="recensement-export-publipostage-button"
            >
              <Download className="mr-1.5 h-4 w-4" />
              {t('exporterPublipostage')}
            </Button>
            <Link href={ROUTES.PROCESSUS_RECENSEMENT_NEW}>
              <Button data-testid="recensement-new-button">
                <Plus className="mr-1.5 h-4 w-4" />
                {t('newTitle')}
              </Button>
            </Link>
          </div>
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
