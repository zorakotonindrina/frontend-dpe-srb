'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import type { Dossier, DossierStatut } from '@/lib/api/dossiers';
import { PROCESSUS_CODE_NAV_LABEL_KEYS } from '@/lib/constants/processus';

const STATUT_VARIANT: Record<DossierStatut, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  BROUILLON: 'outline',
  DEPOSE: 'secondary',
  EN_CONTROLE: 'secondary',
  A_COMPLETER: 'destructive',
  EN_TRAITEMENT_TECHNIQUE: 'secondary',
  EN_VALIDATION: 'secondary',
  VALIDE: 'default',
  REFUSE: 'destructive',
  LIVRABLE_GENERE: 'default',
  CLOTURE: 'outline',
};

export const DOSSIER_STATUTS = Object.keys(STATUT_VARIANT) as DossierStatut[];

export function buildDossierColumns(
  t: (key: string) => string,
  tStatuts: (key: string) => string,
  tNav: (key: string) => string,
  ministeres: { minCode: string; libelle: string }[] = [],
): ColumnDef<Dossier>[] {
  return [
    {
      accessorKey: 'referenceActe',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.reference')} />,
    },
    {
      accessorKey: 'processusCode',
      filterFn: 'arrIncludesSome',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.processus')} />,
      cell: ({ row }) => {
        const labelKey = PROCESSUS_CODE_NAV_LABEL_KEYS[row.original.processusCode];
        return labelKey ? tNav(labelKey) : row.original.processusCode;
      },
    },
    {
      accessorKey: 'dossierDateDepot',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.dateDepot')} />,
    },
    {
      accessorKey: 'ministereCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.ministere')} />,
      cell: ({ row }) => ministeres.find((m) => m.minCode === row.original.ministereCode)?.libelle ?? row.original.ministereCode,
    },
    {
      accessorKey: 'statut',
      filterFn: 'arrIncludesSome',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} />,
      cell: ({ row }) => (
        <Badge variant={STATUT_VARIANT[row.original.statut]}>
          {tStatuts(row.original.statut)}
        </Badge>
      ),
    },
  ];
}
