'use client';

import { useState, type ReactNode } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type TypeColonne = 'date' | 'texte' | 'nombre';

/** Une colonne de la feuille papier : `key` = champ de la ligne, `label` = intitulé imprimé sur la feuille. */
export interface ColonneFeuille {
  key: string;
  label: string;
  type: TypeColonne;
}

export interface FeuilleLivretEditorProps<T extends object> {
  /** Titre de la feuille (ex. « Carburants et lubrifiants — quantités délivrées ») */
  titre: string;
  colonnes: ColonneFeuille[];
  lignes: T[];
  onChange: (lignes: T[]) => void;
  /** Valeurs de la ligne de saisie vide (une par colonne) */
  ligneVide: T;
  /** Champs propres à la feuille, affichés au-dessus de la saisie (ex. type de carburant, dotations) */
  entete?: ReactNode;
  /** Ligne de total sous le tableau */
  pied?: ReactNode;
  /** Affiché quand la feuille est vide : la feuille sera arrêtée « à l'état néant » */
  messageVide: string;
  addLabel: string;
  testId: string;
}

type Brut = Record<string, unknown>;

function estVide(valeur: unknown): boolean {
  return valeur === '' || valeur === null || valeur === undefined;
}

/** Champ d'une cellule selon le type de colonne (date, texte ou nombre) — vide = null pour les nombres. */
function ChampCellule({
  colonne, valeur, onChange, ariaLabel, compact, testId,
}: {
  colonne: ColonneFeuille;
  valeur: unknown;
  onChange: (v: string | number | null) => void;
  ariaLabel: string;
  compact?: boolean;
  testId?: string;
}) {
  const className = compact ? 'h-8 min-w-24' : undefined;
  if (colonne.type === 'nombre') {
    return (
      <Input
        type="number" min={0} className={className} aria-label={ariaLabel} data-testid={testId}
        value={estVide(valeur) ? '' : String(valeur)}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      />
    );
  }
  return (
    <Input
      type={colonne.type === 'date' ? 'date' : 'text'} className={className} aria-label={ariaLabel} data-testid={testId}
      value={typeof valeur === 'string' ? valeur : ''}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

/**
 * Éditeur d'une feuille de livret : ligne de saisie avec les **intitulés de colonnes de la feuille papier**,
 * puis tableau modifiable en ligne (et suppression). Générique : les 5 feuilles (carburants, pneumatiques,
 * entretien courant, réparations, parcours) ne diffèrent que par leurs colonnes. L'état vit chez l'appelant
 * (une étape de wizard est démontée quand on la quitte).
 */
export function FeuilleLivretEditor<T extends object>({
  titre, colonnes, lignes, onChange, ligneVide, entete, pied, messageVide, addLabel, testId,
}: FeuilleLivretEditorProps<T>) {
  const [saisie, setSaisie] = useState<T>(ligneVide);

  const valeur = (ligne: T, cle: string): unknown => (ligne as Brut)[cle];
  const peutAjouter = colonnes.some((c) => !estVide(valeur(saisie, c.key)));

  function ajouter() {
    if (!peutAjouter) return;
    onChange([...lignes, saisie]);
    setSaisie(ligneVide);
  }

  function modifier(index: number, cle: string, v: string | number | null) {
    onChange(lignes.map((l, i) => (i === index ? { ...l, [cle]: v } : l)));
  }

  return (
    <div className="space-y-3 rounded-sm border border-border p-3" data-testid={testId}>
      <h4 className="text-sm font-semibold text-foreground">{titre}</h4>

      {entete}

      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {colonnes.map((c) => (
          <div key={c.key} className="space-y-1">
            <Label className="text-xs text-muted-foreground">{c.label}</Label>
            <ChampCellule
              colonne={c} valeur={valeur(saisie, c.key)} ariaLabel={c.label} testId={`${testId}-saisie-${c.key}`}
              onChange={(v) => setSaisie((prev) => ({ ...prev, [c.key]: v }))}
            />
          </div>
        ))}
        <Button type="button" variant="outline" onClick={ajouter} disabled={!peutAjouter} data-testid={`${testId}-ajouter`}>
          <Plus className="mr-1.5 h-4 w-4" />
          {addLabel}
        </Button>
      </div>

      {lignes.length > 0 ? (
        <Table data-testid={`${testId}-table`}>
          <TableHeader>
            <TableRow>
              {colonnes.map((c) => <TableHead key={c.key}>{c.label}</TableHead>)}
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {lignes.map((ligne, index) => (
              <TableRow key={index}>
                {colonnes.map((c, ci) => (
                  <TableCell key={c.key}>
                    <div className="flex items-center gap-2">
                      {ci === 0 && (ligne as { fromBc?: boolean }).fromBc && <Badge variant="outline">BC</Badge>}
                      <ChampCellule
                        colonne={c} valeur={valeur(ligne, c.key)} ariaLabel={`${c.label} (ligne ${index + 1})`} compact
                        testId={`${testId}-${index}-${c.key}`}
                        onChange={(v) => modifier(index, c.key, v)}
                      />
                    </div>
                  </TableCell>
                ))}
                <TableCell>
                  <Button type="button" variant="ghost" size="icon" onClick={() => onChange(lignes.filter((_, i) => i !== index))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-amber-600" data-testid={`${testId}-neant`}>{messageVide}</p>
      )}

      {pied}
    </div>
  );
}
