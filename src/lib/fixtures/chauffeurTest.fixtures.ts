/**
 * traitement_siigpe.tsi_chauffeur_test (Script.sql) — table stable (11 colonnes : test_id,
 * reference_acte, chauffeur_id, vehicule_id, date_test, examinateur_nom, resultat, observations,
 * date_saisie, utilisateur_saisie, statut). `resultat` reprend la contrainte CHECK de la table :
 * resultat IS NULL OR resultat IN ('APTE','NON_APTE') — capturé à la génération du livrable,
 * comme `controle_aptitude.avis_aptitude` et `reception_technique.avis`.
 *
 * `noteTheorique`/`notePratique` sont un ajout frontend uniquement : la table réelle n'a aucune
 * colonne pour ces notes — elles sont envoyées à la création (voir lib/api/chauffeurTest.ts) mais
 * silencieusement ignorées par le backend tant qu'il n'a pas les colonnes. À signaler côté backend.
 */
export interface ChauffeurTest {
  testId:          string;
  referenceActe:   string;
  chauffeurId:     string;
  vehiculeId?:     string;
  dateTest:        string;
  examinateurNom:  string;
  /** Saisie au moment de la décision (Apte/Inapte), pas à la création du test. */
  observations?:   string;
  noteTheorique:   number;
  notePratique:    number;
  resultat:        'APTE' | 'NON_APTE' | null;
  statut:          string;
}

export const chauffeurTestsFixtures: ChauffeurTest[] = [
  {
    testId: 'tch-1', referenceActe: 'TCH072026010', chauffeurId: 'ch-1', vehiculeId: 'veh-0004',
    dateTest: '2026-06-15', examinateurNom: 'RAKOTO Herimanana', observations: 'RAS',
    noteTheorique: 16, notePratique: 15, resultat: 'APTE', statut: 'LIVRABLE_GENERE',
  },
];
