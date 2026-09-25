import type { ArretageFeuilles } from '@/lib/fixtures/arretageLivret.fixtures';

const somme = (valeurs: (number | null)[]): number => valeurs.reduce<number>((total, v) => total + (v ?? 0), 0);

export interface TotauxFeuilles {
  litres: number;
  huile: number;
  km: number;
  prixPneumatiques: number;
  prixReparations: number;
  /** Dates de lavage + vidange + graissage renseignées (feuille Entretien courant) */
  operations: number;
}

/** Totaux des 5 feuilles — mêmes règles que le serveur (`ArretageService.creerArretage`). */
export function totauxFeuilles(f: ArretageFeuilles): TotauxFeuilles {
  return {
    litres: somme(f.carburants.map((c) => c.quantiteLitres)),
    huile: somme(f.carburants.map((c) => c.huileLitres)),
    km: somme(f.parcours.map((p) => p.distanceKm)),
    prixPneumatiques: somme(f.pneumatiques.map((p) => p.prix)),
    prixReparations: somme(f.reparations.map((r) => r.prix)),
    operations: f.entretiens.reduce(
      (n, e) => n + [e.dateLavage, e.dateVidange, e.dateGraissage].filter(Boolean).length, 0),
  };
}

export interface Consommation {
  litres: number;
  km: number;
  /** Litres aux 100 km ; null si le carburant ou la distance du livret Parcours est nul (non calculable) */
  litresAux100km: number | null;
  kmParLitre: number | null;
}

const arrondi2 = (n: number): number => Math.round(n * 100) / 100;

/** Consommation = total litres (feuille Carburants) ÷ total distances (livret Parcours) × 100. */
export function calculerConsommation(litres: number, km: number): Consommation {
  const calculable = litres > 0 && km > 0;
  return {
    litres,
    km,
    litresAux100km: calculable ? arrondi2((litres * 100) / km) : null,
    kmParLitre: calculable ? arrondi2(km / litres) : null,
  };
}
