import { montantEnLettres, nombreEnLettres } from '@/lib/utils/nombre-en-lettres';
import { articleStructure } from '@/lib/utils/reception-neuf-texte';
import type { CategorieMisePrix } from '@/lib/fixtures/condamnation.fixtures';

/**
 * Textes du PV d'évaluation et du document « Mise à prix » — portage exact de `EvaluationTexte.java`
 * (backend) : même sortie que les PDF Jasper `PV_CONDAMNATION` et `MISE_A_PRIX`.
 */

const vide = (s?: string | null): boolean => !s || s.trim() === '';
const deuxChiffres = (n: number): string => String(n).padStart(2, '0');

/** Article devant la structure, sans accent ni élision collée : « A LA », « AU », « A L' ». */
function appartenant(structure?: string | null): string {
  const a = articleStructure(structure).replace('à', 'a').toUpperCase();
  return a.endsWith("'") ? a : `${a} `;
}

/** « PROCES VERBAL D'EVALUATION DE MATERIELS ROULANTS APPARTENANT AU CENTRE HOSPITALIER … » */
export function titrePv(structure?: string | null): string {
  const base = "PROCES VERBAL D'EVALUATION DE MATERIELS ROULANTS";
  if (vide(structure)) return base;
  return `${base} APPARTENANT ${appartenant(structure)}${(structure as string).trim().toUpperCase()}`;
}

/** « Ont procédé à l'évaluation d'UN (01) véhicule appartenant au {structure} du {ministère}. » */
export function conclusionPv(nb: number, structure?: string | null, ministere?: string | null): string {
  const lettres = nombreEnLettres(nb);
  const particule = /^[aeiouàéAEIOUÀÉ]/.test(lettres) ? "d'" : 'de ';
  let texte = `Ont procédé à l'évaluation ${particule}${lettres.toUpperCase()} (${deuxChiffres(nb)}) ${nb > 1 ? 'véhicules' : 'véhicule'} appartenant `;
  if (vide(structure)) {
    texte += 'à la structure';
  } else {
    const article = articleStructure(structure);
    texte += `${article.endsWith("'") ? article : `${article} `}${(structure as string).trim()}`;
  }
  if (!vide(ministere)) {
    const libelle = (ministere as string).trim().replace(/\s+/g, ' ');
    texte += `${/^MINIST[EÈ]RE/i.test(libelle) ? ' du ' : ' de '}${libelle}`;
  }
  return `${texte}.`;
}

/** « ARIARY », ou « D'ARIARY » quand le montant se termine par « millions ». */
function unite(montant: number): string {
  return montant > 0 && montant % 1_000_000 === 0 ? " D'ARIARY" : ' ARIARY';
}

/** « Arrêté au nombre de UN (01) véhicule évalué à la somme de « VINGT QUATRE MILLIONS … ARIARY » ». */
export function arretePv(nb: number, totalValeurEnAr: number): string {
  const total = Math.round(totalValeurEnAr);
  return `Arrêté au nombre de ${nombreEnLettres(nb).toUpperCase()} (${deuxChiffres(nb)}) ${nb > 1 ? 'véhicules évalués' : 'véhicule évalué'} `
    + `à la somme de « ${montantEnLettres(total).replace(/-/g, ' ').toUpperCase()}${unite(total)} »`;
}

/** BON_ETAT → « BON ETAT » ; un libellé libre est conservé. */
export function libelleEtat(etat?: string | null): string {
  if (vide(etat)) return '';
  switch (etat) {
    case 'BON_ETAT': return 'BON ETAT';
    case 'MOYEN_ETAT': return 'MOYEN ETAT';
    case 'MAUVAIS_ETAT': return 'MAUVAIS ETAT';
    default: return etat as string;
  }
}

/** 24470000 → « 24 470 000 » (espaces insécables : le montant ne se coupe pas en fin de ligne). */
export function formaterMontant(montant: number | null | undefined): string {
  if (montant === null || montant === undefined || Number.isNaN(montant)) return '';
  return Math.round(montant).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** « MISE A PRIX D'UN VEHICULE A EVALUER » / « MISE A PRIX D'UNE MOTOCYCLETTE A EVALUER ». */
export function titreMisePrix(categorie?: CategorieMisePrix | string | null): string {
  return categorie === 'MOTOCYCLE'
    ? "MISE A PRIX D'UNE MOTOCYCLETTE A EVALUER"
    : "MISE A PRIX D'UN VEHICULE A EVALUER";
}

/** « APPARTENANT A LA COMMUNE RURALE SADABE » (vide si la structure est inconnue). */
export function appartenanceMisePrix(structure?: string | null): string {
  if (vide(structure)) return '';
  return `APPARTENANT ${appartenant(structure)}${(structure as string).trim().toUpperCase()}`;
}

/** « ETAT DU VEHICULE : BON ETAT » (vide si l'état n'est pas renseigné). */
export function etatVehicule(etat?: string | null): string {
  return vide(etat) ? '' : `ETAT DU VEHICULE : ${libelleEtat(etat)}`;
}
