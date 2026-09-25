/**
 * Clés TanStack Query centralisées — structure hiérarchique.
 * all → list(params) → detail(id)
 *
 * Usage :
 *   useQuery({ queryKey: QUERY_KEYS.vehicules.list(params) })
 *   qc.invalidateQueries({ queryKey: QUERY_KEYS.vehicules.all })
 */
import type { VehiculesParams } from '@/lib/api/vehicules';
import type { DossiersParams } from '@/lib/api/dossiers';
import type { WorkflowMesTachesParams } from '@/lib/api/workflow';

function domainKeys<TParams = Record<string, unknown> | undefined>(domain: string) {
  return {
    all:    [domain] as const,
    list:   (p?: TParams) => [domain, 'list', p] as const,
    detail: (id: string)  => [domain, 'detail', id] as const,
  };
}

export const QUERY_KEYS = {
  referentiels: {
    all:                  ['referentiels'] as const,
    categoriesVehicule:   () => ['referentiels', 'categories-vehicule'] as const,
    energies:             () => ['referentiels', 'energies'] as const,
    etatsVehicule:        () => ['referentiels', 'etats-vehicule'] as const,
    genres:               () => ['referentiels', 'genres'] as const,
    carrosseries:         () => ['referentiels', 'carrosseries'] as const,
    marques:              () => ['referentiels', 'marques'] as const,
    regions:              () => ['referentiels', 'regions'] as const,
    districts:            (regionCode?: string) => ['referentiels', 'districts', regionCode ?? ''] as const,
    communes:             (districtCode?: string) => ['referentiels', 'communes', districtCode ?? ''] as const,
    ministeres:           () => ['referentiels', 'ministeres'] as const,
    soas:                 (q = '') => ['referentiels', 'soas', q] as const,
    stds:                 () => ['referentiels', 'stds'] as const,
    ctds:                 () => ['referentiels', 'ctds'] as const,
    piecesDossier:        (typeCode: string) => ['referentiels', 'pieces-dossier', typeCode] as const,
    piecesDossierAdmin:   (typeCode?: string) => ['referentiels', 'pieces-dossier-admin', typeCode ?? ''] as const,
    signataires:          () => ['referentiels', 'signataires'] as const,
    experts:              () => ['referentiels', 'experts'] as const,
    sectionsEvaluation:   () => ['referentiels', 'sections-evaluation'] as const,
    sectionsMisePrix:     (categorie?: string) => ['referentiels', 'sections-mise-prix', categorie ?? ''] as const,
    elementsMisePrix:     () => ['referentiels', 'elements-mise-prix'] as const,
    elementsEvaluation:   (sectionId?: string) => ['referentiels', 'elements-evaluation', sectionId ?? ''] as const,
    sectionsConstatation: () => ['referentiels', 'sections-constatation'] as const,
    elementsConstatation: (sectionId: string) => ['referentiels', 'elements-constatation', sectionId] as const,
    typesLivret:          () => ['referentiels', 'types-livret'] as const,
    categoriesUtilisationVehicule: () => ['referentiels', 'categories-utilisation-vehicule'] as const,
    etatsGeneralConstate:          () => ['referentiels', 'etats-general-constate'] as const,
  },

  vehicules: domainKeys<VehiculesParams>('vehicules'),
  chauffeurs: domainKeys('chauffeurs'),
  dossiers:  domainKeys<DossiersParams>('dossiers'),

  recensement:               domainKeys('recensement'),
  constatationTechnique:     domainKeys('constatation-technique'),
  visaBonCommande:           domainKeys('visa-bon-commande'),
  receptionTechnique:        domainKeys('reception-technique'),
  receptionVaNeuf:           domainKeys('reception-va-neuf'),
  arretageLivret:            domainKeys('arretage-livret'),
  aptitudeLocation:          domainKeys('aptitude-location'),
  attestationCaracteristique: domainKeys('attestation-caracteristique'),
  expertise:                 domainKeys('expertise'),
  condamnation:               domainKeys('condamnation'),
  chauffeurTest:              domainKeys('test-chauffeur'),

  workflow: {
    all:       ['workflow'] as const,
    mesTaches: (p?: WorkflowMesTachesParams) => ['workflow', 'mes-taches', p] as const,
  },

  documents: domainKeys('documents'),

  reporting: {
    all:       ['reporting'] as const,
    dashboard: () => ['reporting', 'dashboard'] as const,
    vehicules: () => ['reporting', 'vehicules'] as const,
    dossiers:  () => ['reporting', 'dossiers'] as const,
    ia: {
      all:                 ['reporting', 'ia'] as const,
      modeles:             () => ['reporting', 'ia', 'modeles'] as const,
      previsionStructures: (annee?: number) => ['reporting', 'ia', 'prevision-structures', annee] as const,
      previsionVehicules:  (annee?: number, soa?: string) => ['reporting', 'ia', 'prevision-vehicules', annee, soa] as const,
      anomalies:           () => ['reporting', 'ia', 'anomalies-carburant'] as const,
      delais:              () => ['reporting', 'ia', 'delais'] as const,
    },
  },

  administration: {
    utilisateurs: domainKeys('administration-utilisateurs'),
    roles:        domainKeys('administration-roles'),
    audit:        domainKeys('administration-audit'),
  },
} as const;
