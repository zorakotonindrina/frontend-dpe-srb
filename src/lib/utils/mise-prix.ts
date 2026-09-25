import type { ElementMisePrix, SectionMisePrix } from '@/lib/api/referentiels';

/** Prix saisis, par `elementId` (null = non renseigné). */
export type PrixParElement = Record<string, number | null>;

export interface SectionGrille {
  section: SectionMisePrix;
  elements: ElementMisePrix[];
}

/** Une rangée d'impression de la grille : les sections d'une même `ligne` se partagent la largeur. */
export interface RangeeGrille {
  ligne: number;
  sections: SectionGrille[];
}

/**
 * Structure de la grille d'une catégorie (miroir de `EvaluationReports.parRangee` côté backend) :
 * sections triées par rangée puis rang, éléments par rang, sections sans élément ignorées.
 */
export function construireGrille(sections: SectionMisePrix[], elements: ElementMisePrix[]): RangeeGrille[] {
  const rangees = new Map<number, SectionGrille[]>();
  [...sections].sort((a, b) => a.ligne - b.ligne || a.rang - b.rang).forEach((section) => {
    const deSection = elements.filter((e) => e.sectionId === section.sectionId).sort((a, b) => a.rang - b.rang);
    if (deSection.length === 0) return;
    rangees.set(section.ligne, [...(rangees.get(section.ligne) ?? []), { section, elements: deSection }]);
  });
  return [...rangees.entries()].sort(([a], [b]) => a - b).map(([ligne, secs]) => ({ ligne, sections: secs }));
}

const normaliser = (s: string): string => s.trim().normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

/** Un libellé d'élément n'est répété que s'il apporte une information de plus que le titre de section. */
export function libellesUtiles(s: SectionGrille): boolean {
  return !(s.elements.length === 1 && normaliser(s.elements[0].elementLibelle) === normaliser(s.section.sectionLibelle));
}

/** Valeur estimative = somme des prix saisis. */
export function totalPrix(prix: PrixParElement): number {
  return Object.values(prix).reduce<number>((somme, p) => somme + (p ?? 0), 0);
}

/** Valeur en AR = valeur estimative après dépréciation (arrondie à l'unité, comme le serveur). */
export function valeurEnAr(valeurEstimee: number, depreciationPct: number): number {
  return Math.round(valeurEstimee * (1 - (depreciationPct || 0) / 100));
}
