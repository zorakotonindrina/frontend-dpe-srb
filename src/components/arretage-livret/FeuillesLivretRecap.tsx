'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ConsommationLivret } from '@/components/arretage-livret/ConsommationLivret';
import { colonnesFeuilles } from '@/components/arretage-livret/feuilles-config';
import type { ColonneFeuille } from '@/components/arretage-livret/FeuilleLivretEditor';
import type { ArretageFeuilles } from '@/lib/api/arretageLivret';
import { totauxFeuilles } from '@/lib/utils/consommation-livret';

/** Valeur d'une cellule en lecture seule : date au format français, nombre avec séparateurs, texte tel quel. */
function formaterCellule(colonne: ColonneFeuille, valeur: unknown): string {
  if (valeur === null || valeur === undefined || valeur === '') return '—';
  if (colonne.type === 'date') return new Date(String(valeur)).toLocaleDateString('fr-FR');
  if (colonne.type === 'nombre') return Number(valeur).toLocaleString('fr-FR');
  return String(valeur);
}

function FeuilleLecture({
  titre, colonnes, lignes, messageVide,
}: { titre: string; colonnes: ColonneFeuille[]; lignes: object[]; messageVide: string }) {
  return (
    <div className="space-y-2 rounded-sm border border-border p-3">
      <h4 className="text-sm font-semibold">{titre}</h4>
      {lignes.length === 0 ? (
        <p className="text-sm text-muted-foreground">{messageVide}</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>{colonnes.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}</TableRow>
          </TableHeader>
          <TableBody>
            {lignes.map((ligne, i) => (
              <TableRow key={i}>
                {colonnes.map((c) => (
                  <TableCell key={c.key}>{formaterCellule(c, (ligne as Record<string, unknown>)[c.key])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

/** Récapitulatif en lecture seule des 5 feuilles de livret d'un arrêtage + consommation (onglet du dossier). */
export function FeuillesLivretRecap({ feuilles }: { feuilles: ArretageFeuilles }) {
  const t = useTranslations('processus.arretageLivret');
  const colonnes = useMemo(() => colonnesFeuilles((cle) => t(cle)), [t]);
  const totaux = totauxFeuilles(feuilles);
  const neant = t('feuilles.neant');

  return (
    <div className="space-y-4" data-testid="arretage-feuilles-recap">
      <FeuilleLecture titre={`${t('typeLivretOptions.SA')} — ${t('feuilles.carburants')}`} colonnes={colonnes.carburants} lignes={feuilles.carburants} messageVide={neant} />
      <FeuilleLecture titre={`${t('typeLivretOptions.SA')} — ${t('feuilles.pneumatiques')}`} colonnes={colonnes.pneumatiques} lignes={feuilles.pneumatiques} messageVide={neant} />
      <FeuilleLecture titre={`${t('typeLivretOptions.GSS')} — ${t('feuilles.entretien')}`} colonnes={colonnes.entretiens} lignes={feuilles.entretiens} messageVide={neant} />
      <FeuilleLecture titre={`${t('typeLivretOptions.GSS')} — ${t('feuilles.reparations')}`} colonnes={colonnes.reparations} lignes={feuilles.reparations} messageVide={neant} />
      <FeuilleLecture titre={`${t('typeLivretOptions.PARCOURS')} — ${t('feuilles.parcours')}`} colonnes={colonnes.parcours} lignes={feuilles.parcours} messageVide={neant} />
      <ConsommationLivret litres={totaux.litres} km={totaux.km} testId="arretage-consommation-dossier" />
    </div>
  );
}
