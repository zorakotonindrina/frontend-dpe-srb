'use client';

import { useMemo } from 'react';
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
import { useConstatations } from '@/hooks/useConstatation';
import { useVehicules } from '@/hooks/useVehicules';
import { useDossiers } from '@/hooks/useDossiers';
import { useDocuments } from '@/hooks/useDocuments';
import { useMinisteres } from '@/hooks/useReferentiels';
import { exportReportingToExcel } from '@/lib/utils/export-reporting-excel';
import type { ConstatationTechnique } from '@/lib/api/constatation';

export default function ConstatationTechniqueListPage() {
  const t = useTranslations('processus.constatationTechnique');
  const router = useRouter();
  const { data = [], isLoading } = useConstatations();
  const { data: vehicules = [] } = useVehicules();
  const { data: dossiers = [] } = useDossiers();
  const { data: documents = [] } = useDocuments();
  const { data: ministeres = [] } = useMinisteres();

  function handleExportPublipostage() {
    const rows = data.map((c) => {
      const vehicule = vehicules.find((v) => v.vehiculeId === c.vehiculeId);
      const dossier = dossiers.find((d) => d.referenceActe === c.referenceActe);
      const ministereLibelle = ministeres.find((m) => m.minCode === dossier?.ministereCode)?.libelle ?? dossier?.ministereCode ?? '';
      // Le n° de PV n'existe qu'après génération (survient une fois le workflow déjà validé,
      // donc déjà « signé ») — reste naturellement vide tant que le document n'a pas été généré.
      const pv = documents.find((d) => d.referenceActe === c.referenceActe && d.modeleCode === 'PV_CONSTATATION');
      return [
        c.referenceActe, ministereLibelle, c.soa, c.lieu, c.expertNom, c.dateConstat, c.heureConstat,
        vehicule?.vehiculeImmatriculation ?? '', c.etatGeneral, c.kilometrage, c.detenteur, c.numeroConstat,
        pv?.numeroDocument ?? '', pv?.genereLe ?? '',
      ];
    });
    exportReportingToExcel(
      [{
        name: 'Publipostage PV constatation',
        headers: [
          'Référence', 'Ministère', 'SOA', 'LieuConstatation', 'Expert', 'DateConstat', 'HeureConstat',
          'Immatriculation', 'ÉtatGénéral', 'Kilométrage', 'Détenteur', 'NuméroConstat', 'NuméroPV', 'DatePV',
        ],
        rows,
      }],
      'publipostage-pv-constatation',
    );
  }

  const columns: ColumnDef<ConstatationTechnique>[] = useMemo(() => [
    { accessorKey: 'numeroConstat', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.numeroConstat')} /> },
    {
      id: 'vehicule',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.vehicule')} />,
      cell: ({ row }) => vehicules.find((v) => v.vehiculeId === row.original.vehiculeId)?.vehiculeImmatriculation ?? '—',
    },
    { accessorKey: 'dateConstat', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.dateConstat')} /> },
    { accessorKey: 'lieu', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.lieu')} /> },
    { accessorKey: 'statut', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} /> },
  ], [t, vehicules]);

  return (
    <div data-testid="constatation-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportPublipostage}
              disabled={data.length === 0}
              data-testid="constatation-export-publipostage-button"
            >
              <Download className="mr-1.5 h-4 w-4" />
              {t('exporterPublipostage')}
            </Button>
            <Link href={ROUTES.PROCESSUS_CONSTATATION_NEW}>
              <Button data-testid="constatation-new-button">
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
