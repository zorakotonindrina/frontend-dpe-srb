import type { ColonneFeuille } from '@/components/arretage-livret/FeuilleLivretEditor';
import type {
  ArretageCarburant, ArretagePneumatique, ArretageEntretien, ArretageReparation, ArretageParcours,
} from '@/lib/fixtures/arretageLivret.fixtures';

/** Traducteur restreint au bloc `processus.arretageLivret`. */
type Traducteur = (cle: string) => string;

/**
 * Colonnes des 5 feuilles de livret, dans l'ordre et avec les intitulés des feuilles papier (photos du
 * classeur IMPRIMES DIGITALISATION 2026.xlsx) : Service Automobile = carburants + pneumatiques ; Garage
 * Station Service = entretien courant + réparations ; Parcours = une seule feuille.
 */
export function colonnesFeuilles(t: Traducteur): {
  carburants: ColonneFeuille[]; pneumatiques: ColonneFeuille[]; entretiens: ColonneFeuille[];
  reparations: ColonneFeuille[]; parcours: ColonneFeuille[];
} {
  return {
    carburants: [
      { key: 'dateOperation', label: t('feuilles.colonnes.date'), type: 'date' },
      { key: 'nature', label: t('feuilles.colonnes.natureLivraisons'), type: 'texte' },
      { key: 'quantiteLitres', label: t('feuilles.colonnes.quantiteLitres'), type: 'nombre' },
      { key: 'huileLitres', label: t('feuilles.colonnes.huile'), type: 'nombre' },
    ],
    pneumatiques: [
      { key: 'dateLivraison', label: t('feuilles.colonnes.date'), type: 'date' },
      { key: 'nature', label: t('feuilles.colonnes.natureLivraisons'), type: 'texte' },
      { key: 'prix', label: t('feuilles.colonnes.prix'), type: 'nombre' },
    ],
    entretiens: [
      { key: 'kilometrage', label: t('feuilles.colonnes.kilometrageCompteur'), type: 'nombre' },
      { key: 'dateLavage', label: t('feuilles.colonnes.lavage'), type: 'date' },
      { key: 'dateVidange', label: t('feuilles.colonnes.vidange'), type: 'date' },
      { key: 'dateGraissage', label: t('feuilles.colonnes.graissage'), type: 'date' },
    ],
    reparations: [
      { key: 'dateEntree', label: t('feuilles.colonnes.dateEntree'), type: 'date' },
      { key: 'dateSortie', label: t('feuilles.colonnes.dateSortie'), type: 'date' },
      { key: 'nature', label: t('feuilles.colonnes.natureReparations'), type: 'texte' },
      { key: 'prix', label: t('feuilles.colonnes.prix'), type: 'nombre' },
    ],
    parcours: [
      { key: 'dateSortie', label: t('feuilles.colonnes.dateSortieParcours'), type: 'date' },
      { key: 'dateRentree', label: t('feuilles.colonnes.dateRentree'), type: 'date' },
      { key: 'motif', label: t('feuilles.colonnes.motifParcours'), type: 'texte' },
      { key: 'distanceKm', label: t('feuilles.colonnes.distanceKm'), type: 'nombre' },
    ],
  };
}

export const LIGNE_CARBURANT_VIDE: ArretageCarburant = { dateOperation: '', nature: '', quantiteLitres: null, huileLitres: null };
export const LIGNE_PNEUMATIQUE_VIDE: ArretagePneumatique = { dateLivraison: '', nature: '', prix: null };
export const LIGNE_ENTRETIEN_VIDE: ArretageEntretien = { kilometrage: null, dateLavage: '', dateVidange: '', dateGraissage: '' };
export const LIGNE_REPARATION_VIDE: ArretageReparation = { dateEntree: '', dateSortie: '', nature: '', prix: null };
export const LIGNE_PARCOURS_VIDE: ArretageParcours = { dateSortie: '', dateRentree: '', motif: '', distanceKm: null };
