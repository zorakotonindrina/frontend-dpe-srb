'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useElementsMisePrix, useSectionsMisePrix } from '@/hooks/useReferentiels';
import { construireGrille, type PrixParElement } from '@/lib/utils/mise-prix';
import type { CategorieMisePrix } from '@/lib/fixtures/condamnation.fixtures';

export interface GrillePrixEditorProps {
  categorie: CategorieMisePrix;
  prix: PrixParElement;
  onChange: (prix: PrixParElement) => void;
  testIdPrefix?: string;
}

/**
 * Saisie du prix de chaque composant de la grille de mise à prix (jeu Véhicule ou Motocyclette, lu dans le
 * référentiel modifiable en Administration). Les sections d'une même rangée sont côte à côte, comme sur
 * l'imprimé ; les valeurs estimative et en AR sont calculées par le parent.
 */
export function GrillePrixEditor({ categorie, prix, onChange, testIdPrefix = 'grille-prix' }: GrillePrixEditorProps) {
  const t = useTranslations('processus.condamnation');
  const { data: sections = [], isLoading } = useSectionsMisePrix(categorie);
  const { data: elements = [] } = useElementsMisePrix();
  const rangees = useMemo(() => construireGrille(sections, elements), [sections, elements]);

  if (!isLoading && rangees.length === 0) {
    return <p className="text-sm text-muted-foreground" data-testid={`${testIdPrefix}-vide`}>{t('grille.vide')}</p>;
  }

  return (
    <div className="space-y-4" data-testid={testIdPrefix}>
      {rangees.map((rangee) => (
        <div key={rangee.ligne} className="flex flex-wrap gap-3">
          {rangee.sections.map((s) => (
            <fieldset key={s.section.sectionId} className="min-w-[10rem] flex-1 rounded-md border p-3">
              <legend className="px-1 text-xs font-semibold uppercase text-muted-foreground">{s.section.sectionLibelle}</legend>
              <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${Math.min(s.elements.length, 3)}, minmax(0, 1fr))` }}>
                {s.elements.map((e) => (
                  <div key={e.elementId} className="space-y-1">
                    <Label htmlFor={`${testIdPrefix}-${e.elementId}`} className="text-xs">{e.elementLibelle}</Label>
                    <Input
                      id={`${testIdPrefix}-${e.elementId}`}
                      data-testid={`${testIdPrefix}-${e.elementId}`}
                      type="number"
                      min={0}
                      inputMode="numeric"
                      placeholder="0"
                      value={prix[e.elementId] ?? ''}
                      onChange={(ev) => {
                        const brut = ev.target.value;
                        onChange({ ...prix, [e.elementId]: brut === '' ? null : Math.max(0, Number(brut)) });
                      }}
                    />
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      ))}
    </div>
  );
}
