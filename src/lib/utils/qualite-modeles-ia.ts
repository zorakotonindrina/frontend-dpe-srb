import type { CodeModeleIa, ModeleIa } from '@/lib/api/reportingIa';

/**
 * Lit les métriques jsonb de `ia.modele` (structure propre à chaque modèle, écrite par `ia-siigpe/modeles/*.py`) et en extrait les
 * indicateurs clés, **toujours comparés à la référence naïve** : un modèle n'a d'intérêt que s'il fait mieux qu'elle.
 */

export type FormatIndicateur = 'jours' | 'ariary' | 'pct' | 'score';

export interface IndicateurQualite {
  /** Clé i18n sous `reporting.ia.qualite.indicateurs`. */
  cle: string;
  modele: number;
  reference: number;
  format: FormatIndicateur;
  /** Vrai si une valeur plus faible est meilleure (erreurs) ; faux pour AUC, F1, rappel. */
  plusBasMieux: boolean;
}

export interface QualiteModele {
  code: CodeModeleIa;
  methodeRetenue: string;
  dateEntrainement: string;
  periodeDonnees: string;
  nbExemples: number;
  /** Données véhicules construites (lot JEU_2025_2026_V1) vs données réelles du workflow. */
  donneesConstruites: boolean;
  indicateurs: IndicateurQualite[];
  /** Le modèle appris bat-il la référence sur l'indicateur principal (le premier) ? */
  batReference: boolean;
}

type Obj = Record<string, unknown>;
const obj = (v: unknown): Obj => (v && typeof v === 'object' ? (v as Obj) : {});
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null);

function indicateur(cle: string, modele: unknown, reference: unknown, format: FormatIndicateur, plusBasMieux: boolean): IndicateurQualite[] {
  const m = num(modele);
  const r = num(reference);
  return m === null || r === null ? [] : [{ cle, modele: m, reference: r, format, plusBasMieux }];
}

export function estMeilleur(i: IndicateurQualite): boolean {
  return i.plusBasMieux ? i.modele < i.reference : i.modele > i.reference;
}

function indicateursDe(code: CodeModeleIa, m: Obj): IndicateurQualite[] {
  switch (code) {
    case 'DELAI_DOSSIER':
      return [
        ...indicateur('maeTemporel', m.mae_jours, m.reference_mae_jours, 'jours', true),
        ...indicateur('maeAleatoire', m.aleatoire_mae_jours, m.aleatoire_reference_mae_jours, 'jours', true),
      ];
    case 'DEPENSE_VEHICULE': {
      // Le meilleur modèle APPRIS face à la meilleure méthode SANS apprentissage (N+1 = N, tendance, moyenne historique).
      const nomAppris = String(m.meilleur_modele_appris ?? '');
      const comparaison = obj(m.comparaison);
      const appris = obj(comparaison[nomAppris]);
      const meilleureRef = obj(comparaison[String(m.meilleure_reference ?? '')]);
      const temporel = obj(m.comparaison_temporelle);
      const meilleureRefTemporelle = obj(temporel[String(m.meilleure_reference_temporelle ?? '')]);
      const backtest = obj(m.backtest_structures);
      return [
        ...indicateur('maeVehicule', appris.mae, meilleureRef.mae ?? appris.ref_mae, 'ariary', true),
        ...indicateur('maeBacktest', obj(temporel[nomAppris]).mae, meilleureRefTemporelle.mae, 'ariary', true),
        ...indicateur('mapeStructures', backtest.mape_structures, backtest.ref_mape_structures, 'pct', true),
      ];
    }
    case 'GROSSE_REPARATION': {
      const nom = String(m.modele_retenu ?? '');
      const retenu = obj(obj(m.comparaison)[nom]);
      const temporel = obj(obj(m.comparaison_temporelle)[nom]);
      return [
        ...indicateur('auc', retenu.auc, retenu.ref_auc, 'score', false),
        ...indicateur('aucBacktest', temporel.auc, temporel.ref_auc, 'score', false),
        ...indicateur('rappel', retenu.rappel, retenu.ref_rappel, 'pct', false),
      ];
    }
    case 'ANOMALIE_CARBURANT': {
      const kmGonfles = obj(obj(m.par_type).KM_GONFLES);
      return [
        ...indicateur('f1', obj(m.isolation_forest).f1, obj(m.regle_simple).f1, 'score', false),
        ...indicateur('rappelKmGonfles', kmGonfles.rappel_isolation_forest, kmGonfles.rappel_regle, 'pct', false),
      ];
    }
    default:
      return [];
  }
}

const ORDRE: CodeModeleIa[] = ['DEPENSE_VEHICULE', 'GROSSE_REPARATION', 'ANOMALIE_CARBURANT', 'DELAI_DOSSIER'];

export function qualiteModeles(modeles: ModeleIa[]): QualiteModele[] {
  return [...modeles]
    .sort((a, b) => ORDRE.indexOf(a.code) - ORDRE.indexOf(b.code))
    .map((mo) => {
      const indicateurs = indicateursDe(mo.code, mo.metriques);
      // Verdict calculé par ia-siigpe quand il existe (il combine les deux évaluations), sinon l'indicateur principal.
      const verdict = mo.metriques.ml_bat_reference ?? mo.metriques.clf_bat_reference;
      const batReference = typeof verdict === 'boolean' ? verdict : indicateurs.length > 0 && estMeilleur(indicateurs[0]);
      return {
        code: mo.code, methodeRetenue: mo.algorithme, dateEntrainement: mo.dateEntrainement, periodeDonnees: mo.periodeDonnees,
        nbExemples: mo.nbExemples, donneesConstruites: mo.code !== 'DELAI_DOSSIER', indicateurs, batReference,
      };
    });
}

export function formaterIndicateur(valeur: number, format: FormatIndicateur): string {
  switch (format) {
    case 'jours':
      return `${valeur.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} j`;
    case 'ariary':
      return `${Math.round(valeur).toLocaleString('fr-FR')} Ar`;
    case 'pct':
      return `${(valeur * 100).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
    default:
      return valeur.toLocaleString('fr-FR', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
  }
}
