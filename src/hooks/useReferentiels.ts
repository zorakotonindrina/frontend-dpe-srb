'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { referentielsApi, SIGNATAIRE_CHEF_SRB_BUDGET } from '@/lib/api/referentiels';
import type { Soa, Std, Ctd } from '@/lib/api/referentiels';
import { QUERY_KEYS } from '@/lib/constants/query-keys';

/** Repli si la ligne référentiel est absente (ne doit normalement jamais arriver une fois
 *  Script.sql rejoué) — même texte de secours que côté backend (JasperController). */
const SIGNATAIRE_CHEF_SRB_BUDGET_DEFAUT = 'Le Chef de Service Régional du Budget Analamanga';

const staleTime = 5 * 60 * 1000;

export function useCategoriesVehicule() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.categoriesVehicule(), queryFn: referentielsApi.categoriesVehicule, staleTime });
}

export function useEnergies() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.energies(), queryFn: referentielsApi.energies, staleTime });
}

export function useEtatsVehicule() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.etatsVehicule(), queryFn: referentielsApi.etatsVehicule, staleTime });
}

export function useGenres() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.genres(), queryFn: referentielsApi.genres, staleTime });
}

export function useCarrosseries() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.carrosseries(), queryFn: referentielsApi.carrosseries, staleTime });
}

export function useMarques() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.marques(), queryFn: referentielsApi.marques, staleTime });
}

export function useRegions() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.regions(), queryFn: referentielsApi.regions, staleTime });
}

export function useDistricts(regionCode?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.districts(regionCode),
    queryFn: () => referentielsApi.districts(regionCode),
    staleTime,
  });
}

export function useCommunes(districtCode?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.communes(districtCode),
    queryFn: () => referentielsApi.communes(districtCode),
    enabled: Boolean(districtCode),
    staleTime,
  });
}

export function useMinisteres() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.ministeres(), queryFn: referentielsApi.ministeres, staleTime });
}

/** `q` : texte tapé dans le combobox SOA — recherche serveur plafonnée à 50 résultats (voir
 *  referentielsApi.soas, la table réelle a 20 101 codes distincts). */
export function useSoas(q = '') {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.soas(q), queryFn: () => referentielsApi.soas(q), staleTime });
}

export function useStds() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.stds(), queryFn: referentielsApi.stds, staleTime });
}

export function useCtds() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.ctds(), queryFn: referentielsApi.ctds, staleTime });
}

export function useCreateSoa() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Soa) => referentielsApi.createSoa(input),
    // Préfixe partiel (['referentiels','soas']) : invalide toutes les recherches en cache, quel
    // que soit le texte tapé, pas seulement la recherche vide.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referentiels', 'soas'] }),
  });
}

export function useCreateStd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Std) => referentielsApi.createStd(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.referentiels.stds() }),
  });
}

export function useCreateCtd() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Ctd) => referentielsApi.createCtd(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.referentiels.ctds() }),
  });
}

export function usePiecesDossier(typeCode: string) {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.piecesDossier(typeCode),
    queryFn: () => referentielsApi.piecesDossier(typeCode),
    staleTime,
  });
}

export function useSectionsConstatation() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.sectionsConstatation(), queryFn: referentielsApi.sectionsConstatation, staleTime });
}

export function useElementsConstatation(sectionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.elementsConstatation(sectionId),
    queryFn: () => referentielsApi.elementsConstatation(sectionId),
    enabled: Boolean(sectionId),
    staleTime,
  });
}

/** Admin uniquement (`/administration/referentiels`) — liste toutes les pièces d'un type de
 *  processus (ou toutes si `typeCode` absent), contrairement à `usePiecesDossier` qui reste
 *  mocké pour l'usage métier existant (hors périmètre de ce lot). */
export function usePiecesDossierAdmin(typeCode?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.piecesDossierAdmin(typeCode),
    queryFn: () => referentielsApi.piecesDossierAdmin(typeCode),
    staleTime,
  });
}

export function useTypesLivret() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.typesLivret(), queryFn: referentielsApi.typesLivret, staleTime });
}

export function useCategoriesUtilisationVehicule() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.categoriesUtilisationVehicule(), queryFn: referentielsApi.categoriesUtilisationVehicule, staleTime });
}

export function useEtatsGeneralConstate() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.etatsGeneralConstate(), queryFn: referentielsApi.etatsGeneralConstate, staleTime });
}

/** Signataire "Chef de Service Régional du Budget Analamanga" — configurable depuis
 *  Administration > Référentiels (voir DemoReportBuilder.java, paramètre `signataireBudget`).
 *  Renvoie directement le texte à afficher (jamais undefined), avec repli le temps du chargement
 *  ou si la ligne référentiel est absente. */
export function useSignataireBudget(): string {
  const { data: signataires = [] } = useQuery({
    queryKey: QUERY_KEYS.referentiels.signataires(),
    queryFn: referentielsApi.signataires,
    staleTime,
  });
  return signataires.find((s) => s.signataireCode === SIGNATAIRE_CHEF_SRB_BUDGET)?.signataireTitre
    ?? SIGNATAIRE_CHEF_SRB_BUDGET_DEFAUT;
}

/** referentiel_siigpe.rsi_expert — liste déroulante "Expert" partagée par Constatation technique
 *  et Réception technique, éditable depuis Administration > Référentiels. Contrairement à
 *  useSignataireBudget(), renvoie la liste complète : c'est l'appelant qui construit les options
 *  du select (voir constatation-technique/nouveau/page.tsx et reception-technique/nouveau/page.tsx). */
export function useExperts() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.experts(), queryFn: referentielsApi.experts, staleTime });
}

/** Toutes les communes (sans district) — liste déroulante de recherche de la réception neuve
 *  (`FormCombobox`) ; la valeur enregistrée est le libellé, imprimé tel quel sur les PV. */
export function useAllCommunes() {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.communes(),
    queryFn: () => referentielsApi.communes(),
    staleTime,
  });
}

/** Grilles de « mise à prix » (Véhicule / Motocyclette) : sections triées par rangée puis éléments. */
export function useSectionsMisePrix(categorie?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.sectionsMisePrix(categorie),
    queryFn: () => referentielsApi.sectionsMisePrix(categorie),
    staleTime,
  });
}

export function useElementsMisePrix() {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.elementsMisePrix(),
    queryFn: () => referentielsApi.elementsMisePrix(),
    staleTime,
  });
}

/** Grille de la fiche d'évaluation du véhicule (sections puis éléments, tous d'un coup). */
export function useSectionsEvaluation() {
  return useQuery({ queryKey: QUERY_KEYS.referentiels.sectionsEvaluation(), queryFn: referentielsApi.sectionsEvaluation, staleTime });
}

export function useElementsEvaluation() {
  return useQuery({
    queryKey: QUERY_KEYS.referentiels.elementsEvaluation(),
    queryFn: () => referentielsApi.elementsEvaluation(),
    staleTime,
  });
}
