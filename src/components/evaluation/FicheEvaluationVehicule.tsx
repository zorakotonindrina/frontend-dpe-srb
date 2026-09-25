'use client';

import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useElementsEvaluation, useSectionsEvaluation } from '@/hooks/useReferentiels';
import type { FicheEvaluation } from '@/lib/api/evaluationFiche';
import { majValeur, valeursElement } from '@/lib/utils/fiche-evaluation';

export interface FicheEvaluationVehiculeProps {
  value: FicheEvaluation;
  onChange: (fiche: FicheEvaluation) => void;
  /** Masque la saisie de l'immatriculation (déjà connue de l'écran appelant). */
  immatriculationFigee?: boolean;
  testIdPrefix?: string;
}

/** Saisie d'un pourcentage 0-100 (vide = non renseigné). */
function ChampPourcentage({
  valeur, onChange, etiquette, ariaLabel, testId,
}: { valeur: number | null; onChange: (v: number | null) => void; etiquette?: string | null; ariaLabel: string; testId: string }) {
  return (
    <div className="flex items-center gap-1.5">
      {etiquette && <span className="w-9 text-xs text-muted-foreground">{etiquette}</span>}
      <Input
        type="number" min={0} max={100} className="w-20" aria-label={ariaLabel} data-testid={testId}
        value={valeur ?? ''}
        onChange={(e) => {
          const brut = e.target.value;
          if (brut === '') return onChange(null);
          onChange(Math.min(100, Math.max(0, Number(brut))));
        }}
      />
      <span className="text-sm text-muted-foreground">%</span>
    </div>
  );
}

/**
 * Fiche d'évaluation du véhicule — composant contrôlé et réutilisable (Réception neuve, Réception
 * technique, Évaluation/Condamnation) : grille Organes / Éléments / Pourcentage (1 ou 2 valeurs
 * par élément selon le référentiel), observation libre. L'état vit chez l'appelant : une étape de
 * wizard est démontée quand on la quitte.
 */
export function FicheEvaluationVehicule({
  value, onChange, immatriculationFigee = false, testIdPrefix = 'fiche-evaluation',
}: FicheEvaluationVehiculeProps) {
  const { data: sections = [] } = useSectionsEvaluation();
  const { data: elements = [] } = useElementsEvaluation();

  const parSection = useMemo(
    () => sections.map((s) => ({ section: s, elements: elements.filter((e) => e.sectionEvaluationId === s.sectionEvaluationId) })),
    [sections, elements],
  );

  return (
    <div className="space-y-4" data-testid={testIdPrefix}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`${testIdPrefix}-immat`}>Immatriculation</Label>
          <Input
            id={`${testIdPrefix}-immat`} value={value.immatriculation} disabled={immatriculationFigee}
            onChange={(e) => onChange({ ...value, immatriculation: e.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`${testIdPrefix}-km`}>Kilométrage</Label>
          <Input
            id={`${testIdPrefix}-km`} type="number" min={0} value={value.kilometrage ?? ''}
            onChange={(e) => onChange({ ...value, kilometrage: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="space-y-4">
        {parSection.map(({ section, elements: elts }) => (
          <div key={section.sectionEvaluationId}>
            <h4 className="mb-2 text-sm font-semibold text-foreground">{section.sectionLibelle}</h4>
            <ul className="space-y-1.5">
              {elts.map((el) => {
                const v = valeursElement(value, el.elementEvaluationId);
                return (
                  <li
                    key={el.elementEvaluationId}
                    className="flex flex-col gap-2 rounded-sm border border-border p-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <span className="text-sm">{el.elementLibelle}</span>
                    <div className="flex flex-wrap items-center gap-3">
                      <ChampPourcentage
                        valeur={v.valeur1} etiquette={el.libelleValeur1}
                        ariaLabel={`${el.elementLibelle}${el.libelleValeur1 ? ` ${el.libelleValeur1}` : ''}`}
                        testId={`${testIdPrefix}-${el.elementEvaluationId}-1`}
                        onChange={(n) => onChange(majValeur(value, el.elementEvaluationId, 1, n))}
                      />
                      {el.libelleValeur2 && (
                        <ChampPourcentage
                          valeur={v.valeur2} etiquette={el.libelleValeur2}
                          ariaLabel={`${el.elementLibelle} ${el.libelleValeur2}`}
                          testId={`${testIdPrefix}-${el.elementEvaluationId}-2`}
                          onChange={(n) => onChange(majValeur(value, el.elementEvaluationId, 2, n))}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`${testIdPrefix}-observation`}>Observation</Label>
        <Textarea
          id={`${testIdPrefix}-observation`} rows={3} value={value.observation}
          onChange={(e) => onChange({ ...value, observation: e.target.value })}
        />
      </div>
    </div>
  );
}
