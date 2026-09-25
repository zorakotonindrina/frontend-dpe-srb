'use client';

import { formaterMontant } from '@/lib/utils/evaluation-texte';
import { libellesUtiles, type PrixParElement, type RangeeGrille } from '@/lib/utils/mise-prix';

export interface GrilleMisePrixTableProps {
  rangees: RangeeGrille[];
  prix: PrixParElement;
  /** Ajoute la ligne « valeur estimative » sous la grille. */
  valeurEstimative?: number;
}

/**
 * Grille de la « mise à prix » dessinée en <table> — miroir de `EvaluationReports.misePrix` (PDF Jasper
 * `MISE_A_PRIX`) : une table par rangée, en-têtes de sections grisés, ligne des libellés seulement si un
 * libellé diffère du titre de section, ligne des prix. Partagée par l'aperçu du document et par la
 * lecture seule de l'onglet du dossier.
 */
export function GrilleMisePrixTable({ rangees, prix, valeurEstimative }: GrilleMisePrixTableProps) {
  const cellule = 'border border-black px-1 py-1 text-center text-[10px]';
  return (
    <div className="space-y-2" data-testid="grille-mise-prix">
      {rangees.map((rangee) => {
        const avecLibelles = rangee.sections.some(libellesUtiles);
        return (
          <table key={rangee.ligne} className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                {rangee.sections.map((s) => (
                  <th
                    key={s.section.sectionId}
                    colSpan={s.elements.length}
                    rowSpan={avecLibelles && !libellesUtiles(s) ? 2 : 1}
                    className={`${cellule} bg-neutral-200 font-bold text-black`}
                  >
                    {s.section.sectionLibelle}
                  </th>
                ))}
              </tr>
              {avecLibelles && (
                <tr>
                  {rangee.sections.filter(libellesUtiles).flatMap((s) => s.elements.map((e) => (
                    <th key={e.elementId} className={`${cellule} h-7 font-normal`}>{e.elementLibelle}</th>
                  )))}
                </tr>
              )}
            </thead>
            <tbody>
              <tr>
                {rangee.sections.flatMap((s) => s.elements.map((e) => (
                  <td key={e.elementId} className={`${cellule} h-6 font-semibold`}>{formaterMontant(prix[e.elementId])}</td>
                )))}
              </tr>
            </tbody>
          </table>
        );
      })}
      {valeurEstimative !== undefined && (
        <table className="w-full table-fixed border-collapse">
          <tbody>
            <tr>
              <td className={`${cellule} w-3/4 text-xs`}>VALEUR ESTIMATIVE DU VEHICULE</td>
              <td className={`${cellule} text-xs font-semibold`} data-testid="valeur-estimative">{formaterMontant(valeurEstimative)}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
