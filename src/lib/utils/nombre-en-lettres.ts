/**
 * Nombre → lettres françaises (0-9999), portage exact de `NombreEnLettres.java` (backend) — même
 * sortie pour un même nombre, que le document soit affiché côté client ou rendu en PDF côté
 * serveur. Sert aussi bien au décompte de véhicules du quitus qu'aux dates en toutes lettres.
 */

const UNITES = [
  'zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
  'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
];
const DIZAINES: Record<number, string> = { 2: 'vingt', 3: 'trente', 4: 'quarante', 5: 'cinquante', 6: 'soixante', 8: 'quatre-vingt' };

export const MOIS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

/** « du mois de Janvier » / « du mois d'Avril » — élision devant une voyelle. */
export function duMoisDe(mois: string): string {
  return /^[AEIOUÀÉ]/i.test(mois) ? `du mois d'${mois}` : `du mois de ${mois}`;
}

/** 0-99, avec la liaison « et un »/« et onze » (21, 31, 41, 51, 61, 71). */
function convertirDizaines(n: number): string {
  if (n < 20) return UNITES[n];
  if (n < 70) {
    const d = Math.floor(n / 10);
    const u = n % 10;
    if (u === 0) return DIZAINES[d];
    if (u === 1) return `${DIZAINES[d]} et un`;
    return `${DIZAINES[d]}-${UNITES[u]}`;
  }
  if (n < 80) {
    if (n === 70) return 'soixante-dix';
    if (n === 71) return 'soixante et onze';
    return `soixante-${UNITES[n - 60]}`;
  }
  if (n < 100) return n === 80 ? 'quatre-vingts' : `quatre-vingt-${UNITES[n - 80]}`;
  return String(n);
}

/** 0-999 — « cent »/« cents » (pluriel seulement s'il ne reste rien derrière), « deux cent un ». */
function convertirCentaines(n: number): string {
  if (n < 100) return convertirDizaines(n);
  const centaines = Math.floor(n / 100);
  const reste = n % 100;
  const cent = centaines === 1 ? 'cent' : `${UNITES[centaines]} cent`;
  if (reste === 0) return centaines > 1 ? `${cent}s` : cent;
  return `${cent} ${convertirDizaines(reste)}`;
}

/** 0-9999 — « mille »/« mil » (invariable) selon le contexte. */
function convertirMilliers(n: number, milleWord: string): string {
  if (n < 1000) return convertirCentaines(n);
  const milliers = Math.floor(n / 1000);
  const reste = n % 1000;
  const prefix = milliers === 1 ? milleWord : `${UNITES[milliers]} ${milleWord}`;
  if (reste === 0) return prefix;
  return `${prefix} ${convertirCentaines(reste)}`;
}

export function nombreEnLettres(n: number): string {
  return convertirMilliers(n, 'mille');
}

/** Année en tête d'une formule de date (« L'an deux mil vingt-six ») — « mil » plutôt que « mille »,
 *  convention confirmée par le modèle source (utils/IMPRIMES DIGITALISATION 2026.xlsx). */
export function anneeEnLettres(annee: number): string {
  return convertirMilliers(annee, 'mil');
}

/** 0-999 avec accord de « vingts »/« cents » : pluriel seulement si le groupe est final ou suivi de
 *  « million(s) » — « trois cent mille » mais « trois cents millions ». */
function groupe(n: number, pluriel: boolean): string {
  const c = Math.floor(n / 100);
  const r = n % 100;
  const dizaines = r === 80 && !pluriel ? 'quatre-vingt' : convertirDizaines(r);
  if (c === 0) return dizaines;
  const cent = c === 1 ? 'cent' : `${UNITES[c]} cent`;
  if (r === 0) return c > 1 && pluriel ? `${cent}s` : cent;
  return `${cent} ${dizaines}`;
}

/** Montant entier jusqu'à 999 999 999 (« trois cents millions ») — portage exact de
 *  `NombreEnLettres.montantEnLettres` (backend), usage : « à la somme de … ». */
export function montantEnLettres(n: number): string {
  if (n === 0) return 'zéro';
  if (n < 0 || n > 999_999_999 || !Number.isInteger(n)) return String(n);
  const parts: string[] = [];
  const millions = Math.floor(n / 1_000_000);
  const milliers = Math.floor((n % 1_000_000) / 1000);
  const reste = n % 1000;
  if (millions > 0) parts.push(`${groupe(millions, true)}${millions > 1 ? ' millions' : ' million'}`);
  if (milliers > 0) parts.push(milliers === 1 ? 'mille' : `${groupe(milliers, false)} mille`);
  if (reste > 0) parts.push(groupe(reste, true));
  return parts.join(' ');
}

/** « huit heures » (minutes = 0) ou « quatorze heures trente » — accord « une heure » (pas « un
 *  heure ») pour heures === 1. */
export function heureEnLettres(heures: number, minutes: number): string {
  const heureMot = heures === 1 ? 'une heure' : `${nombreEnLettres(heures)} heures`;
  return minutes === 0 ? heureMot : `${heureMot} ${nombreEnLettres(minutes)}`;
}

/** « vingt-quatre Septembre deux mil vingt-six » — jour + nom du mois + année, sans heure. */
export function dateCompleteEnLettres(date: Date): string {
  return `${nombreEnLettres(date.getDate())} ${MOIS[date.getMonth()]} ${anneeEnLettres(date.getFullYear())}`;
}

/** « 08 Décembre 2025 » — jour zéro-paddé, mois en lettres, année en chiffres (distinct de
 *  dateCompleteEnLettres : utilisé pour citer une date de pièce jointe, ex. bon de commande, dans
 *  un paragraphe qui a déjà sa propre date d'ouverture en toutes lettres). Portage exact de
 *  DateEnLettres.dateSimple (backend). */
export function dateSimple(date: Date): string {
  return `${String(date.getDate()).padStart(2, '0')} ${MOIS[date.getMonth()]} ${date.getFullYear()}`;
}
