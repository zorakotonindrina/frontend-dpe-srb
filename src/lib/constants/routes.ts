/**
 * Constantes de routes typées.
 * Toujours utiliser ces constantes plutôt que des chaînes littérales
 * pour garantir la cohérence et faciliter les refactorisations.
 */
export const ROUTES = {
  // Auth
  LOGIN:               '/login',
  FORGOT_PASSWORD:      '/mot-de-passe-oublie',

  // Dashboard
  DASHBOARD: '/',

  // Véhicules
  VEHICULES:        '/vehicules',
  VEHICULE_NEW:      '/vehicules/nouveau',
  // Export statique : IDs créés dynamiquement après le build, generateStaticParams
  // impossible — routes en query string plutôt qu'en segment de chemin.
  VEHICULE_DETAIL:  (id: string) => `/vehicules/detail?id=${encodeURIComponent(id)}`,
  VEHICULE_EDIT:    (id: string) => `/vehicules/detail/modifier?id=${encodeURIComponent(id)}`,

  // Chauffeurs (référentiel identité, hors processus)
  CHAUFFEURS:        '/chauffeurs',
  CHAUFFEUR_NEW:      '/chauffeurs/nouveau',
  CHAUFFEUR_DETAIL:  (id: string) => `/chauffeurs/detail?id=${encodeURIComponent(id)}`,

  // Dossiers
  DOSSIERS:            '/dossiers',
  DOSSIER_TRAITEMENT:  '/dossiers/traitement',
  DOSSIER_DETAIL:      (reference: string) => `/dossiers/detail?reference=${encodeURIComponent(reference)}`,
  /** Liste (consultation) des dossiers d'un processus — lancée depuis les cartes du tableau de bord. */
  DOSSIERS_LISTE:      (processusCode: string) => `/dossiers/liste?processus=${encodeURIComponent(processusCode)}`,
  /** Détail d'un dossier en lecture seule : aucun traitement (workflow, génération, pièces) n'y est proposé. */
  DOSSIER_CONSULTATION: (reference: string) => `/dossiers/detail?reference=${encodeURIComponent(reference)}&mode=consultation`,

  // Processus métier (BSCVA)
  PROCESSUS_RECENSEMENT:                '/processus/recensement',
  PROCESSUS_RECENSEMENT_NEW:            '/processus/recensement/nouveau',
  PROCESSUS_RECENSEMENT_DETAIL:         (id: string) => `/processus/recensement/${id}`,

  PROCESSUS_CONSTATATION:               '/processus/constatation-technique',
  PROCESSUS_CONSTATATION_NEW:           '/processus/constatation-technique/nouveau',
  PROCESSUS_CONSTATATION_DETAIL:        (id: string) => `/processus/constatation-technique/${id}`,

  PROCESSUS_VISA_BC:                    '/processus/visa-bon-commande',
  PROCESSUS_VISA_BC_NEW:                '/processus/visa-bon-commande/nouveau',
  PROCESSUS_VISA_BC_DETAIL:             (id: string) => `/processus/visa-bon-commande/${id}`,

  PROCESSUS_RECEPTION_TECHNIQUE:        '/processus/reception-technique',
  PROCESSUS_RECEPTION_TECHNIQUE_NEW:    '/processus/reception-technique/nouveau',
  PROCESSUS_RECEPTION_TECHNIQUE_DETAIL: (id: string) => `/processus/reception-technique/${id}`,

  PROCESSUS_RECEPTION_NEUF:             '/processus/reception-va-neuf',
  PROCESSUS_RECEPTION_NEUF_NEW:         '/processus/reception-va-neuf/nouveau',
  PROCESSUS_RECEPTION_NEUF_DETAIL:      (id: string) => `/processus/reception-va-neuf/${id}`,

  PROCESSUS_ARRETAGE_LIVRET:            '/processus/arretage-livret',
  PROCESSUS_ARRETAGE_LIVRET_NEW:        '/processus/arretage-livret/nouveau',
  PROCESSUS_ARRETAGE_LIVRET_DETAIL:     (id: string) => `/processus/arretage-livret/${id}`,

  PROCESSUS_APTITUDE_LOCATION:          '/processus/aptitude-location',
  PROCESSUS_APTITUDE_LOCATION_NEW:      '/processus/aptitude-location/nouveau',
  PROCESSUS_APTITUDE_LOCATION_DETAIL:   (id: string) => `/processus/aptitude-location/${id}`,

  PROCESSUS_ATTESTATION_CARAC:          '/processus/attestation-caracteristiques',
  PROCESSUS_ATTESTATION_CARAC_NEW:      '/processus/attestation-caracteristiques/nouveau',
  PROCESSUS_ATTESTATION_CARAC_DETAIL:   (id: string) => `/processus/attestation-caracteristiques/${id}`,

  PROCESSUS_EXPERTISE:                  '/processus/expertise',
  PROCESSUS_EXPERTISE_NEW:              '/processus/expertise/nouveau',
  PROCESSUS_EXPERTISE_DETAIL:           (id: string) => `/processus/expertise/${id}`,

  PROCESSUS_CONDAMNATION:               '/processus/condamnation',
  PROCESSUS_CONDAMNATION_NEW:           '/processus/condamnation/nouveau',
  PROCESSUS_CONDAMNATION_DETAIL:        (id: string) => `/processus/condamnation/${id}`,

  PROCESSUS_TEST_CHAUFFEUR:             '/processus/test-chauffeur',
  PROCESSUS_TEST_CHAUFFEUR_NEW:         '/processus/test-chauffeur/nouveau',
  PROCESSUS_TEST_CHAUFFEUR_DETAIL:      (id: string) => `/processus/test-chauffeur/${id}`,

  // Workflow
  WORKFLOW_MES_TACHES: '/workflow/mes-taches',

  // Documents
  DOCUMENTS: '/documents',

  // Reporting
  REPORTING: '/reporting',

  // Administration
  ADMINISTRATION:               '/administration',
  ADMINISTRATION_UTILISATEURS:  '/administration/utilisateurs',
  ADMINISTRATION_UTILISATEUR_NEW:  '/administration/utilisateurs/nouveau',
  ADMINISTRATION_UTILISATEUR_EDIT: (matricule: string) => `/administration/utilisateurs/modifier?matricule=${encodeURIComponent(matricule)}`,
  ADMINISTRATION_ROLES:         '/administration/roles',
  ADMINISTRATION_REFERENTIELS:  '/administration/referentiels',
  ADMINISTRATION_AUDIT:         '/administration/audit',
} as const;
