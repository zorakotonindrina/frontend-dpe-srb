import {
  MOIS, anneeEnLettres, duMoisDe, heureEnLettres, montantEnLettres, nombreEnLettres,
} from '@/lib/utils/nombre-en-lettres';

/**
 * Textes assemblés des PV de réception de véhicule neuf — portage exact de
 * `ReceptionNeufTexte.java` (backend) : même sortie que le PDF Jasper `PV_ORDRE_RECETTE`.
 */

const vide = (s?: string | null): boolean => !s || s.trim() === '';

/** Zone de texte « une personne par ligne » → lignes à tirets (respecte un tiret déjà saisi). */
export function membresLignes(zoneTexte?: string | null): string[] {
  if (vide(zoneTexte)) return [];
  return (zoneTexte as string).split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
    .map((l) => (l.startsWith('-') ? l : `- ${l}`));
}

export function libelleFinancement(financement?: string | null): string {
  if (vide(financement)) return '';
  if (financement === 'CONVENTION') return 'Convention';
  if (financement === 'MARCHE') return 'Marché';
  return financement as string;
}

export function fournisseursLignes(
  nom: string, adresse: string, nif: string, stat: string, anneeCarteFiscale: string,
): string[] {
  const lignes: string[] = [];
  if (!vide(nom)) lignes.push(`- ${nom}`);
  if (!vide(adresse)) lignes.push(`- ${adresse}`);
  if (!vide(nif)) lignes.push(`NIF : ${nif}`);
  if (!vide(stat)) lignes.push(`STAT : ${stat}`);
  if (!vide(anneeCarteFiscale)) lignes.push(`Carte fiscale : ${anneeCarteFiscale}`);
  return lignes;
}

/** « L'an deux mil vingt-six et le vingt-trois du mois de Juin, dans l'enceinte du Service Régional du
 *  Budget Analamanga Andraharo, les membres de la commission composés de : » — l'heure (« , à neuf heures »)
 *  n'est imprimée que si elle est renseignée. Espace insécable avant « : ». */
export function introTransfert(datePv: string, heurePv: string): string {
  const d = new Date(datePv);
  const date = Number.isNaN(d.getTime())
    ? `Le ${datePv}`
    : `L'an ${anneeEnLettres(d.getFullYear())} et le ${nombreEnLettres(d.getDate())} ${duMoisDe(MOIS[d.getMonth()])}`;
  let heure = '';
  if (!vide(heurePv)) {
    const [h, m] = heurePv.split(':').map(Number);
    if (!Number.isNaN(h) && !Number.isNaN(m)) heure = `, à ${heureEnLettres(h, m)}`;
  }
  return `${date}${heure}, dans l'enceinte du Service Régional du Budget Analamanga Andraharo, les membres de la commission composés de\u00A0:`;
}

/** Structures féminines commençant par une consonne : « à la ». Heuristique sur le premier mot (sans
 *  accent, minuscules) — pas de dictionnaire ; défaut masculin (« Centre Hospitalier » → « au »). */
const FEMININS = new Set([
  'direction', 'commune', 'region', 'division', 'circonscription', 'delegation', 'prefecture',
  'sous-prefecture', 'mairie', 'societe', 'brigade', 'gendarmerie', 'structure', 'clinique', 'maternite',
  'cour', 'chambre', 'caisse', 'banque', 'police', 'presidence', 'primature', 'cellule', 'coordination',
  'commission', 'mission', 'fondation', 'federation', 'plateforme', 'radio', 'television', 'poste',
  'douane', 'bibliotheque', 'pharmacie',
]);

const sansAccent = (s: string): string => s.normalize('NFD').replace(/\p{M}/gu, '');

/** Article devant le nom d'une structure : « à la » (féminin), « à l' » (voyelle ou h muet), « au » (défaut).
 *  Portage exact de `ReceptionNeufTexte.articleStructure` (backend). */
export function articleStructure(structure?: string | null): string {
  if (vide(structure)) return 'au';
  const premier = sansAccent((structure as string).trim().split(/\s+/)[0]).toLowerCase();
  if (/^[aeiouy]/.test(premier) || premier.startsWith('hopital') || premier.startsWith('hotel')) return "à l'";
  return FEMININS.has(premier) ? 'à la' : 'au';
}

/** « PROCES VERBAL DE RECEPTION TECHNIQUE ET D'EVALUATION DE MATERIEL ROULANT APPARTENANT A LA DIRECTION… » */
export function titreTransfert(structure?: string | null): string {
  const base = "PROCES VERBAL DE RECEPTION TECHNIQUE ET D'EVALUATION DE MATERIEL ROULANT";
  if (vide(structure)) return base;
  const article = articleStructure(structure);
  const avecEspace = article.endsWith("'") ? article : `${article} `;
  return `${base} APPARTENANT ${avecEspace.replace('à', 'a').toUpperCase()}${(structure as string).trim().toUpperCase()}`;
}

/** Zone « une personne par ligne » → une ligne par personne, tiret initial retiré (le tiret est
 *  ré-imprimé par la mise en page : colonne de tirets + retrait suspendu). */
export function membresPuces(zoneTexte?: string | null): string[] {
  if (vide(zoneTexte)) return [];
  return (zoneTexte as string).split(/\r?\n/).map((l) => l.trim().replace(/^-+\s*/, '')).filter(Boolean);
}

const particule = (lettres: string): string => (/^[aeiouàéAEIOUÀÉ]/.test(lettres) ? "d'" : 'de ');
const deuxChiffres = (n: number): string => String(n).padStart(2, '0');

/** « Ont procédé à la Réception Technique et d'Evaluation d'UN (01) véhicule destiné à la » — la structure
 *  suit sur sa propre ligne, en gras. */
export function conclusionTransfert(nb: number, structure?: string | null): string {
  const lettres = nombreEnLettres(nb);
  const destination = vide(structure) ? 'à la structure' : articleStructure(structure);
  return `Ont procédé à la Réception Technique et d'Evaluation ${particule(lettres)}${lettres.toUpperCase()} (${deuxChiffres(nb)}) véhicule${nb > 1 ? 's destinés' : ' destiné'} ${destination}`;
}

/** « Arrêté au nombre d'un (01) véhicule et à la somme de « TROIS CENTS MILLIONS D'ARIARY » » */
export function arreteTransfert(nb: number, totalValeur: number): string {
  const lettres = nombreEnLettres(nb);
  return `Arrêté au nombre ${particule(lettres)}${lettres} (${deuxChiffres(nb)}) véhicule${nb > 1 ? 's' : ''} et à la somme de « ${montantEnLettres(Math.round(totalValeur)).toUpperCase()} D'ARIARY »`;
}

/** Séparateur de milliers en points (« 300.000.000 ») — comme le PDF. */
export function formaterValeurAr(valeur: number | null | undefined): string {
  if (valeur === null || valeur === undefined) return '';
  return Math.round(valeur).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
