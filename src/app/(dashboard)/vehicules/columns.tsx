'use client';

import type { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ROUTES } from '@/lib/constants/routes';
import type { Vehicule } from '@/lib/api/vehicules';

const ETAT_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  BON: 'default',
  MOYEN: 'secondary',
  MAUVAIS: 'destructive',
  HS: 'destructive',
};

export function buildVehiculeColumns(
  t: (key: string) => string,
  onDelete: (vehicule: Vehicule) => void,
): ColumnDef<Vehicule>[] {
  return [
    {
      accessorKey: 'vehiculeImmatriculation',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.immatriculation')} />,
    },
    {
      accessorKey: 'marqueLibelle',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.marque')} />,
    },
    {
      accessorKey: 'genreCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.genre')} />,
    },
    {
      accessorKey: 'categorieVehicule',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.categorie')} />,
    },
    {
      accessorKey: 'etatVehicule',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.etat')} />,
      cell: ({ row }) => (
        <Badge variant={ETAT_VARIANT[row.original.etatVehicule] ?? 'outline'}>
          {row.original.etatVehicule}
        </Badge>
      ),
    },
    {
      accessorKey: 'detenteurEffectif',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.detenteur')} />,
    },
    {
      accessorKey: 'soaCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.structure')} />,
      cell: ({ row }) => row.original.soaCode || '—',
    },
    {
      accessorKey: 'exercice',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.anneeRecensement')} />,
      cell: ({ row }) => row.original.exercice || '—',
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Link href={ROUTES.VEHICULE_EDIT(row.original.vehiculeId)} onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" aria-label={t('actions.edit')} data-testid={`vehicule-row-edit-${row.original.vehiculeId}`}>
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label={t('actions.delete')}
            data-testid={`vehicule-row-delete-${row.original.vehiculeId}`}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
