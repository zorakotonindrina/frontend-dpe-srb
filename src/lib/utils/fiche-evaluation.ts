import type { FicheEvaluation } from '@/lib/api/evaluationFiche';

export function ficheVide(immatriculation = '', kilometrage: number | null = null): FicheEvaluation {
  return { immatriculation, kilometrage, observation: '', elements: [] };
}

export function valeursElement(fiche: FicheEvaluation, elementEvaluationId: string): { valeur1: number | null; valeur2: number | null } {
  const e = fiche.elements.find((x) => x.elementEvaluationId === elementEvaluationId);
  return { valeur1: e?.valeur1 ?? null, valeur2: e?.valeur2 ?? null };
}

/** Renvoie une nouvelle fiche avec la valeur (1 ou 2) de l'élément mise à jour ; un élément dont
 *  les deux valeurs sont vides est retiré (rien n'est envoyé au serveur pour lui). */
export function majValeur(
  fiche: FicheEvaluation, elementEvaluationId: string, rang: 1 | 2, valeur: number | null,
): FicheEvaluation {
  const courant = valeursElement(fiche, elementEvaluationId);
  const suivant = { ...courant, [rang === 1 ? 'valeur1' : 'valeur2']: valeur };
  const autres = fiche.elements.filter((e) => e.elementEvaluationId !== elementEvaluationId);
  const elements = suivant.valeur1 === null && suivant.valeur2 === null
    ? autres
    : [...autres, { elementEvaluationId, valeur1: suivant.valeur1, valeur2: suivant.valeur2 }];
  return { ...fiche, elements };
}

/** « AV: 70 % — AR: 70 % » / « 75 % » / « » — même rendu que le PDF Jasper (FICHE_EVALUATION). */
export function formaterPourcentage(
  valeur1: number | null, valeur2: number | null, libelle1: string | null, libelle2: string | null,
): string {
  const partie = (v: number | null, l: string | null) => (v === null ? null : `${l ? `${l}: ` : ''}${v} %`);
  return [partie(valeur1, libelle1), partie(valeur2, libelle2)].filter(Boolean).join('     ');
}
