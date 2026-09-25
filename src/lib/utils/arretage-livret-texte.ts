import { montantEnLettres } from '@/lib/utils/nombre-en-lettres';

/**
 * Phrases d'arrêté du visa d'arrêtage de livret — portage exact de `ArretageLivretTexte.java`
 * (backend) : même sortie que le PDF Jasper `VISA_ARRETAGE_LIVRET`, une phrase par feuille de livret
 * (photos du classeur IMPRIMES DIGITALISATION 2026.xlsx).
 */

const debut = (objet: string): string => `Arrêté le présent livret concernant ${objet}`;
const fin = (annee: number): string => ` durant l'année ${annee}.`;
const capitale = (s: string): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
const enLettres = (valeur: number): string => capitale(montantEnLettres(Math.round(valeur)));
const pluriel = (n: number, singulier: string, plur: string): string => (n > 1 ? plur : singulier);

/** Séparateur de milliers en points (« 1.250.000 »), arrondi à l'entier. */
const formater = (valeur: number): string => String(Math.round(valeur)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

export function phraseCarburants(litres: number, typeCarburant: string, annee: number): string {
  const objet = 'les carburants et lubrifiants';
  if (litres <= 0) return `${debut(objet)} à l'état néant${fin(annee)}`;
  const n = Math.round(litres);
  const carburant = typeCarburant.trim() ? ` de ${capitale(typeCarburant.trim())}` : '';
  return `${debut(objet)} à : ${enLettres(litres)}${pluriel(n, ' litre', ' litres')} (${n} l)${carburant}${fin(annee)}`;
}

function phraseMontant(objet: string, montant: number, annee: number): string {
  if (montant <= 0) return `${debut(objet)} à l'état néant${fin(annee)}`;
  return `${debut(objet)} à : ${enLettres(montant)} Ariary (${formater(montant)} Ar)${fin(annee)}`;
}

export const phrasePneumatiques = (montant: number, annee: number): string =>
  phraseMontant('les pneumatiques et accessoires', montant, annee);

export const phraseReparations = (montant: number, annee: number): string =>
  phraseMontant('les réparations', montant, annee);

export function phraseEntretien(operations: number, annee: number): string {
  if (operations <= 0) return `${debut("l'Entretien courant")} à l'état néant${fin(annee)}`;
  return `${debut("l'Entretien courant")} à : ${capitale(montantEnLettres(operations))}${pluriel(operations, ' opération', ' opérations')}${fin(annee)}`;
}

export function phraseParcours(km: number, annee: number): string {
  const objet = 'les parcours effectués';
  if (km <= 0) return `${debut(objet)} à l'état néant${fin(annee)}`;
  const n = Math.round(km);
  return `${debut(objet)} à : ${enLettres(km)}${pluriel(n, ' kilomètre', ' kilomètres')} (${n} km)${fin(annee)}`;
}
