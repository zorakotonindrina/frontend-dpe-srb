'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Power, PowerOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { DataTableRowActions } from '@/components/data-table/DataTableRowActions';
import { Badge } from '@/components/ui/badge';
import { ROUTES } from '@/lib/constants/routes';
import { useUtilisateurs, useUpdateUtilisateur } from '@/hooks/useUtilisateurs';
import { ROLE_LABELS } from '@/types/auth.types';
import type { UtilisateurFixture } from '@/lib/api/utilisateurs';

export default function AdministrationUtilisateursPage() {
  const t = useTranslations('administration.utilisateurs');
  const router = useRouter();
  const { data = [], isLoading } = useUtilisateurs();
  const updateUtilisateur = useUpdateUtilisateur();

  const [toggleTarget, setToggleTarget] = useState<UtilisateurFixture | null>(null);

  function confirmToggle() {
    if (!toggleTarget) return;
    const nextStatut = toggleTarget.statut === '1' ? '0' : '1';
    updateUtilisateur.mutate(
      { matricule: toggleTarget.utilisateurMatricule, patch: { statut: nextStatut } },
      { onSuccess: () => setToggleTarget(null) },
    );
  }

  const columns: ColumnDef<UtilisateurFixture>[] = useMemo(() => [
    { accessorKey: 'utilisateurMatricule', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.matricule')} /> },
    { accessorKey: 'login', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.login')} /> },
    { accessorKey: 'nom', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.nom')} /> },
    { accessorKey: 'prenom', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.prenom')} /> },
    {
      accessorKey: 'role',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.role')} />,
      cell: ({ row }) => <Badge variant="outline">{ROLE_LABELS[row.original.role]}</Badge>,
    },
    {
      accessorKey: 'statut',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} />,
      cell: ({ row }) => <Badge variant={row.original.statut === '1' ? 'default' : 'destructive'}>{row.original.statut === '1' ? t('actif') : t('desactive')}</Badge>,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => (
        <DataTableRowActions
          row={row}
          actions={[
            {
              label: t('actions.modifier'),
              icon: Pencil,
              onClick: (r) => router.push(ROUTES.ADMINISTRATION_UTILISATEUR_EDIT(r.original.utilisateurMatricule)),
              testId: `utilisateur-edit-button-${row.original.utilisateurMatricule}`,
            },
            {
              label: row.original.statut === '1' ? t('actions.desactiver') : t('actions.activer'),
              icon: row.original.statut === '1' ? PowerOff : Power,
              onClick: (r) => setToggleTarget(r.original),
              destructive: row.original.statut === '1',
              testId: `utilisateur-toggle-button-${row.original.utilisateurMatricule}`,
            },
          ]}
        />
      ),
    },
  ], [t, router]);

  return (
    <div data-testid="administration-utilisateurs-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Link href={ROUTES.ADMINISTRATION_UTILISATEUR_NEW}>
            <Button data-testid="utilisateur-new-button">
              <Plus className="mr-1.5 h-4 w-4" />
              {t('newTitle')}
            </Button>
          </Link>
        }
      />
      <DataTable columns={columns} data={data} loading={isLoading} />

      <ConfirmDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => !open && setToggleTarget(null)}
        title={toggleTarget?.statut === '1' ? t('desactiverConfirmTitle') : t('activerConfirmTitle')}
        variant={toggleTarget?.statut === '1' ? 'destructive' : 'default'}
        loading={updateUtilisateur.isPending}
        onConfirm={confirmToggle}
        testId="utilisateur-toggle-dialog"
      />
    </div>
  );
}
