'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { History } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { DataTableRowActions } from '@/components/data-table/DataTableRowActions';
import type { FacetedFilterDef } from '@/components/data-table/data-table.types';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DocumentVersionsDialog, type DocumentVersionInfo } from '@/components/documents/DocumentVersionsDialog';
import { useDocuments } from '@/hooks/useDocuments';
import type { DocumentGenere, DocumentStatut } from '@/lib/api/documents';

const STATUT_VARIANT: Record<DocumentStatut, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  BROUILLON: 'outline', VALIDE: 'default', ANNULE: 'destructive', REMPLACE: 'secondary',
};

const STATUTS: DocumentStatut[] = ['BROUILLON', 'VALIDE', 'ANNULE', 'REMPLACE'];

/** Aucun document n'est jamais marqué REMPLACE côté backend aujourd'hui (regénérer un document
 *  crée toujours une nouvelle ligne, l'ancienne reste inchangée) — le seul lien entre "versions"
 *  d'un même acte est la paire (referenceActe, modeleCode), déjà utilisée de façon informelle dans
 *  dossiers/detail/page.tsx via `.filter(...).at(-1)`. Cette fonction calcule le numéro de version
 *  purement côté client, par tri chronologique sur genereLe — jamais d'appel à updateStatut. */
export function computeDocumentVersions(documents: DocumentGenere[]): Map<string, DocumentVersionInfo> {
  const families = new Map<string, DocumentGenere[]>();
  documents.forEach((d) => {
    const key = `${d.referenceActe}::${d.modeleCode}`;
    const arr = families.get(key) ?? [];
    arr.push(d);
    families.set(key, arr);
  });

  const result = new Map<string, DocumentVersionInfo>();
  families.forEach((docs) => {
    const sorted = docs
      .map((d, originalIndex) => ({ d, originalIndex }))
      .sort((a, b) => a.d.genereLe.localeCompare(b.d.genereLe) || a.originalIndex - b.originalIndex);

    sorted.forEach(({ d }, i) => {
      result.set(d.documentId, {
        versionIndex: i + 1,
        versionCount: sorted.length,
        isLatest: i === sorted.length - 1,
      });
    });
  });
  return result;
}

/** Aucun référentiel/constante centralisée n'existe pour les modèles de document — ces 12 codes
 *  sont les seuls réellement produits par le hub Jasper (voir les littéraux modeleCode éparpillés
 *  dans dossiers/detail/page.tsx). Liste locale, pas de fichier de constantes pour si peu. */
const MODELE_CODES = [
  'QUITUS_RECENSEMENT', 'BC_VISE', 'PV_CONSTATATION', 'PV_ORDRE_RECETTE', 'PV_RECEPTION',
  'ATTESTATION_APTITUDE', 'AUTORISATION_LOCATION', 'ATTESTATION_CARACTERISTIQUE',
  'RAPPORT_EXPERTISE', 'PV_CONDAMNATION', 'MISE_A_PRIX', 'RESULTAT_TEST_CHAUFFEUR', 'VISA_ARRETAGE_LIVRET', 'FICHE_EVALUATION',
] as const;

export default function DocumentsPage() {
  const t = useTranslations('documents');
  const tStatuts = useTranslations('documents.statuts');
  const tModeles = useTranslations('documents.modeles');
  const { data = [], isLoading } = useDocuments();

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [versionsFamily, setVersionsFamily] = useState<string | null>(null);

  const filteredData = useMemo(
    () => data.filter((d) =>
      (!dateFrom || d.genereLe >= dateFrom) && (!dateTo || d.genereLe <= dateTo)),
    [data, dateFrom, dateTo],
  );

  // Calculé sur `data` complet (non filtré) pour que "v2/3" ne change pas de sens quand
  // l'utilisateur applique un filtre de date/type — propriété de traçabilité, pas de vue.
  const versions = useMemo(() => computeDocumentVersions(data), [data]);

  const familyDocuments = useMemo(
    () => (versionsFamily ? data.filter((d) => `${d.referenceActe}::${d.modeleCode}` === versionsFamily) : []),
    [data, versionsFamily],
  );

  const filters: FacetedFilterDef[] = useMemo(() => [
    {
      columnId: 'modeleCode',
      title: t('filters.typeActe'),
      options: MODELE_CODES.map((code) => ({ value: code, label: tModeles(code) })),
    },
    {
      columnId: 'statut',
      title: t('filters.statut'),
      options: STATUTS.map((s) => ({ value: s, label: tStatuts(s) })),
    },
  ], [t, tModeles, tStatuts]);

  const columns: ColumnDef<DocumentGenere>[] = useMemo(() => [
    {
      accessorKey: 'numeroDocument',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.numeroDocument')} />,
      cell: ({ row }) => {
        const v = versions.get(row.original.documentId);
        return (
          <span className="flex items-center gap-1.5">
            <span>{row.original.numeroDocument}</span>
            {v && v.versionCount > 1 && (
              <span className="text-xs text-muted-foreground" data-testid={`document-version-badge-${row.original.documentId}`}>
                v{v.versionIndex}/{v.versionCount}
              </span>
            )}
          </span>
        );
      },
    },
    {
      accessorKey: 'modeleCode',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.modele')} />,
      cell: ({ row }) => tModeles(row.original.modeleCode) || row.original.modeleCode,
    },
    { accessorKey: 'referenceActe', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.reference')} /> },
    { accessorKey: 'genereLe', header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.genereLe')} /> },
    {
      accessorKey: 'statut',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('columns.statut')} />,
      cell: ({ row }) => <Badge variant={STATUT_VARIANT[row.original.statut]}>{tStatuts(row.original.statut)}</Badge>,
    },
    {
      id: 'actions',
      header: () => null,
      cell: ({ row }) => {
        const v = versions.get(row.original.documentId);
        if (!v || v.versionCount <= 1) return null;
        return (
          <DataTableRowActions
            row={row}
            actions={[{
              label: t('versions.action'),
              icon: History,
              onClick: (r) => setVersionsFamily(`${r.original.referenceActe}::${r.original.modeleCode}`),
              testId: `document-versions-button-${row.original.documentId}`,
            }]}
          />
        );
      },
    },
  ], [t, tStatuts, tModeles, versions]);

  return (
    <div data-testid="documents-page" className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label htmlFor="documents-date-from" className="text-sm text-muted-foreground">{t('filters.dateFrom')}</label>
          <Input
            id="documents-date-from"
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
            data-testid="documents-date-from-input"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label htmlFor="documents-date-to" className="text-sm text-muted-foreground">{t('filters.dateTo')}</label>
          <Input
            id="documents-date-to"
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
            data-testid="documents-date-to-input"
          />
        </div>
      </div>

      <DataTable columns={columns} data={filteredData} filters={filters} loading={isLoading} />

      <DocumentVersionsDialog
        open={!!versionsFamily}
        onOpenChange={(open) => !open && setVersionsFamily(null)}
        documents={familyDocuments}
        versions={versions}
        statutVariant={STATUT_VARIANT}
      />
    </div>
  );
}
