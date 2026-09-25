'use client';

import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { SectionCard, SectionCardHeader, SectionCardTitle, SectionCardAction, SectionCardContent } from '@/components/common/SectionCard';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { referentielsApi } from '@/lib/api/referentiels';

export interface ReferentielColumn {
  /** Nom du champ dans la ligne (camelCase, tel que renvoyé par `listFn`). */
  key: string;
  label: string;
  type?: 'text' | 'number' | 'boolean' | 'select';
  options?: { value: string; label: string }[];
  /** false pour une clé naturelle (le code = la clé primaire) : modifiable à la création
   *  seulement, figée en édition — même convention qu'AUGURE (code désactivé en édition). */
  editable?: boolean;
  required?: boolean;
}

export interface ReferentielCrudCardProps {
  title: string;
  /** Clé de la whitelist backend (`AdminReferentielController`). */
  slug: string;
  /** Champ de la ligne servant d'identifiant pour les appels update/delete. */
  idField: string;
  columns: ReferentielColumn[];
  /** Charge la liste — réutilise l'endpoint de lecture déjà existant de chaque table. Typé large
   *  (`unknown[]`) pour accepter directement `referentielsApi.xxx` sans caster à chaque appel —
   *  chaque type réel (GenreVehicule, SectionConstatation...) n'a pas de signature d'index et
   *  n'est donc pas assignable à `Record<string, unknown>[]` sans ce relâchement. */
  listFn: () => Promise<unknown[]>;
  queryKey: unknown[];
  /** Filtre parent optionnel (ex. section pour les éléments de constatation, type de processus
   *  pour les pièces de dossier) — un sélecteur simple au-dessus du tableau, et préremplit le
   *  champ correspondant (`columnKey`) à la création d'une nouvelle ligne. */
  parentFilter?: {
    label: string;
    columnKey: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
  };
}

type FormValues = Record<string, string | number | boolean>;

function emptyForm(columns: ReferentielColumn[], parentFilter?: ReferentielCrudCardProps['parentFilter']): FormValues {
  const values: FormValues = {};
  for (const col of columns) {
    values[col.key] = col.type === 'boolean' ? false : col.type === 'number' ? 0 : '';
  }
  if (parentFilter?.value) values[parentFilter.columnKey] = parentFilter.value;
  return values;
}

/**
 * Carte CRUD générique pour un référentiel BSCVA simple (code/libellé, éventuellement enfant d'un
 * parent) — un seul composant réutilisé pour les 11 tables de `AdminReferentielController`, plutôt
 * que N pages dupliquées (voir plan "Administration : Référentiels en vrai CRUD").
 */
export function ReferentielCrudCard({ title, slug, idField, columns, listFn, queryKey, parentFilter }: ReferentielCrudCardProps) {
  const queryClient = useQueryClient();
  const { data: rows = [], isLoading } = useQuery({
    queryKey,
    queryFn: listFn as () => Promise<Record<string, unknown>[]>,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(() => emptyForm(columns));
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm(columns, parentFilter));
    setDialogOpen(true);
  }

  function openEdit(row: Record<string, unknown>) {
    setEditingId(String(row[idField]));
    const values: FormValues = {};
    for (const col of columns) {
      const v = row[col.key];
      values[col.key] = col.type === 'boolean' ? Boolean(v) : (v as string | number) ?? '';
    }
    setForm(values);
    setDialogOpen(true);
  }

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey });
  }

  function champsManquants(): string[] {
    return columns
      .filter((col) => col.required && (form[col.key] === '' || form[col.key] === undefined))
      .map((col) => col.label);
  }

  async function handleSubmit() {
    const manquants = champsManquants();
    if (manquants.length > 0) {
      toast.error(`Champ(s) requis manquant(s) : ${manquants.join(', ')}`);
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await referentielsApi.updateReferentiel(slug, editingId, form);
        toast.success('Modifié avec succès');
      } else {
        await referentielsApi.createReferentiel(slug, form);
        toast.success('Ajouté avec succès');
      }
      setDialogOpen(false);
      await invalidate();
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await referentielsApi.deleteReferentiel(slug, String(deleteTarget[idField]));
      toast.success('Supprimé avec succès');
      setDeleteTarget(null);
      await invalidate();
    } catch {
      toast.error('Erreur serveur');
    } finally {
      setDeleting(false);
    }
  }

  const tableColumns = useMemo<ColumnDef<Record<string, unknown>, unknown>[]>(() => {
    const cols: ColumnDef<Record<string, unknown>, unknown>[] = columns.map((col) => ({
      accessorKey: col.key,
      header: ({ column }) => <DataTableColumnHeader column={column} title={col.label} />,
      cell: ({ row }) => {
        const value = row.original[col.key];
        if (col.type === 'boolean') return value ? 'Oui' : 'Non';
        if (col.type === 'select') return col.options?.find((o) => o.value === value)?.label ?? String(value ?? '');
        return String(value ?? '');
      },
    }));
    cols.push({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => openEdit(row.original)} data-testid={`${slug}-row-edit-${row.original[idField]}`}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => setDeleteTarget(row.original)} data-testid={`${slug}-row-delete-${row.original[idField]}`}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    });
    return cols;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, slug, idField]);

  return (
    <SectionCard>
      <SectionCardHeader>
        <SectionCardTitle>{title}</SectionCardTitle>
        <SectionCardAction>
          <Button size="sm" onClick={openCreate} data-testid={`${slug}-add-button`}>
            <Plus className="mr-1.5 h-4 w-4" />
            Ajouter
          </Button>
        </SectionCardAction>
      </SectionCardHeader>
      <SectionCardContent className="space-y-3">
        {parentFilter && (
          <div className="max-w-xs">
            <Label>{parentFilter.label}</Label>
            <select
              className="mt-1.5 h-9 w-full rounded-sm border border-gray-300 bg-white px-2 text-sm"
              value={parentFilter.value}
              onChange={(e) => parentFilter.onChange(e.target.value)}
            >
              <option value="">Tous</option>
              {parentFilter.options.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
        <DataTable<Record<string, unknown>, unknown> columns={tableColumns} data={rows} loading={isLoading} exportable={false} pageSize={10} />
      </SectionCardContent>

      <ConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editingId ? `Modifier — ${title}` : `Ajouter — ${title}`}
        loading={submitting}
        onConfirm={handleSubmit}
        confirmLabel="Enregistrer"
      >
        <div className="grid grid-cols-1 gap-3">
          {columns.map((col) => {
            const disabled = editingId !== null && col.editable === false;
            if (col.type === 'boolean') {
              return (
                <label key={col.key} className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={Boolean(form[col.key])}
                    onCheckedChange={(c) => setForm((prev) => ({ ...prev, [col.key]: c === true }))}
                    disabled={disabled}
                  />
                  {col.label}
                </label>
              );
            }
            if (col.type === 'select') {
              return (
                <div key={col.key}>
                  <Label>{col.label}{col.required && <span className="text-destructive ml-1">*</span>}</Label>
                  <select
                    className="mt-1.5 h-9 w-full rounded-sm border border-gray-300 bg-white px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    value={String(form[col.key] ?? '')}
                    onChange={(e) => setForm((prev) => ({ ...prev, [col.key]: e.target.value }))}
                    disabled={disabled}
                  >
                    <option value="">Sélectionner…</option>
                    {col.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              );
            }
            return (
              <div key={col.key}>
                <Label>{col.label}</Label>
                <Input
                  className="mt-1.5"
                  type={col.type === 'number' ? 'number' : 'text'}
                  value={String(form[col.key] ?? '')}
                  onChange={(e) => setForm((prev) => ({ ...prev, [col.key]: col.type === 'number' ? Number(e.target.value) : e.target.value }))}
                  disabled={disabled}
                />
              </div>
            );
          })}
        </div>
      </ConfirmDialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}
        title="Supprimer ?"
        description="Cette action est irréversible."
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        confirmLabel="Supprimer"
      />
    </SectionCard>
  );
}
