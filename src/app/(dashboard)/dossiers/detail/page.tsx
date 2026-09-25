'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { FileText, FileCheck, Ban, Plus, Upload, Pencil, Download, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { SummaryList } from '@/components/common/SummaryList';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  useDossier, useDossierPieces, useDossierHistorique, useAddDossierPiece, useAttachPieceFile, useUpdateDossierPieceStatut,
  useTelechargerPieceFichier, useSupprimerPieceFichier,
} from '@/hooks/useDossiers';
import { useDocuments, useGenererDocumentReel } from '@/hooks/useDocuments';
import { useRecensementByReference, useRecensementLignes, useValiderRecensement } from '@/hooks/useRecensement';
import {
  useConstatationByReference, useConstatationElements, useValiderConstatation,
  useConstatationPiecesRemplacer, useConstatationReparations, useConstatationAccessoires,
} from '@/hooks/useConstatation';
import {
  useVisasBc, useVisaBcByReference, useVisaBcPieces, useUpdateVisaBcDecision,
} from '@/hooks/useVisaBc';
import {
  useReceptionTechniqueByReference, useReceptionConstats, useUpdateReceptionAvis,
} from '@/hooks/useReceptionTechnique';
import { useReceptionNeufByReference, useReceptionNeufLignes, useValiderReceptionNeuf } from '@/hooks/useReceptionNeuf';
import {
  useArretageLivretByReference, useArretageLivretComplet, useUpdateArretageLivret, useValiderArretageLivret,
} from '@/hooks/useArretageLivret';
import { useAptitudeLocationByReference, useUpdateAptitudeAvis, useGenererAutorisationLocation } from '@/hooks/useAptitudeLocation';
import { useAttestationCaracteristiqueByReference, useValiderAttestationCaracteristique } from '@/hooks/useAttestationCaracteristique';
import { useExpertiseByReference, useExpertiseDommages, useValiderExpertise } from '@/hooks/useExpertise';
import { useCondamnationComplet, useValiderCondamnation } from '@/hooks/useCondamnation';
import { useChauffeurTestByReference, useUpdateChauffeurTestResultat } from '@/hooks/useChauffeurTest';
import { useChauffeurs } from '@/hooks/useChauffeurs';
import { useVehicules } from '@/hooks/useVehicules';
import {
  useCategoriesUtilisationVehicule, useEtatsGeneralConstate,
  useSectionsConstatation, useElementsConstatation, useMinisteres, useMarques, useSoas,
  useSectionsMisePrix, useElementsMisePrix,
} from '@/hooks/useReferentiels';
import type { ConstatationElement } from '@/lib/api/constatation';
import { WORKFLOW_ETAPES } from '@/lib/constants/workflow-etapes';
import { ROUTES } from '@/lib/constants/routes';
import { WorkflowStepper } from '@/components/workflow/WorkflowStepper';
import { EtapeActionPanel } from '@/components/workflow/EtapeActionPanel';
import { PvConstatationDialog } from '@/components/constatation/PvConstatationDialog';
import { FicheEvaluationSection } from '@/components/evaluation/FicheEvaluationSection';
import { BonCommandeViseDialog } from '@/components/visa-bc/BonCommandeViseDialog';
import { ReceptionTechniqueDialog } from '@/components/reception-technique/ReceptionTechniqueDialog';
import { PvOrdreRecetteDialog } from '@/components/reception-neuf/PvOrdreRecetteDialog';
import { VisaArretageLivretDialog } from '@/components/arretage-livret/VisaArretageLivretDialog';
import { FeuillesLivretRecap } from '@/components/arretage-livret/FeuillesLivretRecap';
import { feuillesVides } from '@/lib/fixtures/arretageLivret.fixtures';
import { AttestationAptitudeDialog } from '@/components/aptitude-location/AttestationAptitudeDialog';
import { AutorisationLocationDialog } from '@/components/aptitude-location/AutorisationLocationDialog';
import { AttestationCaracteristiquesDialog } from '@/components/attestation-caracteristiques/AttestationCaracteristiquesDialog';
import { RapportExpertiseDialog } from '@/components/expertise/RapportExpertiseDialog';
import { PvCondamnationDialog } from '@/components/condamnation/PvCondamnationDialog';
import { MisePrixDialog } from '@/components/condamnation/MisePrixDialog';
import { GrilleMisePrixTable } from '@/components/condamnation/GrilleMisePrixTable';
import { construireGrille, type PrixParElement } from '@/lib/utils/mise-prix';
import { formaterMontant, libelleEtat } from '@/lib/utils/evaluation-texte';
import { ResultatTestChauffeurDialog } from '@/components/test-chauffeur/ResultatTestChauffeurDialog';
import { QuitusRecensementDialog } from '@/components/recensement/QuitusRecensementDialog';

const PIECE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ATTENDUE: 'outline',
  RECUE: 'secondary',
  ABSENTE: 'destructive',
  NON_CONFORME: 'destructive',
  REMPLACEE: 'secondary',
  VALIDEE: 'default',
};

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value ?? '—'}</dd>
    </div>
  );
}

export default function DossierDetailPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference') ?? '';
  // Ouvert depuis « Liste des dossiers » : lecture seule, aucun traitement (workflow, génération, pièces).
  const consultation = searchParams.get('mode') === 'consultation';
  const t = useTranslations('dossiers');
  const tCommon = useTranslations('common');
  const tStatuts = useTranslations('dossiers.statuts');
  const tEtapes = useTranslations('dossiers.etapes');
  const tPieces = useTranslations('dossiers.piecesStatuts');
  const tConstat = useTranslations('processus.constatationTechnique');
  const tVisaBc = useTranslations('processus.visaBonCommande');
  const tReception = useTranslations('processus.receptionTechnique');
  const tReceptionNeuf = useTranslations('processus.receptionVaNeuf');
  const tArretageLivret = useTranslations('processus.arretageLivret');
  const tAptitudeLocation = useTranslations('processus.aptitudeLocation');
  const tAttestationCarac = useTranslations('processus.attestationCaracteristiques');
  const tExpertise = useTranslations('processus.expertise');
  const tCondamnation = useTranslations('processus.condamnation');
  const tTestChauffeur = useTranslations('processus.testChauffeur');
  const tRecensement = useTranslations('processus.recensement');
  const tVehicules = useTranslations('vehicules');

  const { data: dossier, isLoading } = useDossier(reference);
  // Faux en consultation : désactive d'un coup tous les boutons de traitement (valider, générer, avis, viser…).
  const livrableAtteint = Boolean(
    dossier
      && !consultation
      && (dossier.etapeCode === null
        || WORKFLOW_ETAPES.indexOf(dossier.etapeCode) >= WORKFLOW_ETAPES.indexOf('EDITION_LIVRABLE')),
  );
  const messageBlocage = consultation ? t('actions.consultationSeule') : t('actions.livrableIndisponible');
  const { data: pieces = [] } = useDossierPieces(reference);
  const addDossierPiece = useAddDossierPiece();
  const [piecesLibelle, setPiecesLibelle] = useState('');
  const [piecesFile, setPiecesFile] = useState<File | null>(null);
  const attachPieceFile = useAttachPieceFile();
  const [attachingPieceId, setAttachingPieceId] = useState<string | null>(null);
  const [attachingFile, setAttachingFile] = useState<File | null>(null);
  const updateDossierPieceStatut = useUpdateDossierPieceStatut();
  const [pieceObservations, setPieceObservations] = useState<Record<string, string>>({});
  const telechargerPieceFichier = useTelechargerPieceFichier();
  const supprimerPieceFichier = useSupprimerPieceFichier();
  const [deletingPieceFichierId, setDeletingPieceFichierId] = useState<string | null>(null);
  const { data: historique = [] } = useDossierHistorique(reference);
  const { data: documents = [] } = useDocuments();

  const isRecensement = dossier?.processusCode === 'VA_RECENS';
  const { data: recensement } = useRecensementByReference(reference, isRecensement);
  const { data: recensementLignes = [] } = useRecensementLignes(recensement?.recensementId ?? '');
  const validerRecensement = useValiderRecensement();
  // SOA porté par la ligne (pas par le dossier, voir Script.sql §18.9) — un seul SOA affiché sur le
  // quitus, celui de la première ligne, même mécanique que côté PDF Jasper (DemoReportBuilder).
  const { data: soas = [] } = useSoas(recensementLignes[0]?.soaCode ?? '');

  const isConstatation = dossier?.processusCode === 'VA_CONSTAT';
  const { data: constatation } = useConstatationByReference(reference, isConstatation);
  const { data: constatationElements = [] } = useConstatationElements(constatation?.constatationId ?? '');
  const validerConstatation = useValiderConstatation();
  const { data: constatationPieces = [] } = useConstatationPiecesRemplacer(constatation?.constatationId ?? '');
  const { data: constatationReparations = [] } = useConstatationReparations(constatation?.constatationId ?? '');
  const { data: constatationAccessoires = [] } = useConstatationAccessoires(constatation?.constatationId ?? '');
  const { data: sectionsConstatation = [] } = useSectionsConstatation();
  const genererDocumentReel = useGenererDocumentReel();
  const [pvDialogOpen, setPvDialogOpen] = useState(false);

  const isVisaBc = dossier?.processusCode === 'VA_VISA_BC';
  const { data: visaBc } = useVisaBcByReference(reference, isVisaBc);
  const { data: visaBcPieces = [] } = useVisaBcPieces(visaBc?.visaBcId ?? '');
  const { data: visasBcList = [] } = useVisasBc();
  const updateVisaBcDecision = useUpdateVisaBcDecision();
  const [bcDialogOpen, setBcDialogOpen] = useState(false);
  const [refuserDialogOpen, setRefuserDialogOpen] = useState(false);
  const [motifRefusBc, setMotifRefusBc] = useState('');
  const [numeroVisaSaisi, setNumeroVisaSaisi] = useState('');
  const [dateVisaSaisi, setDateVisaSaisi] = useState('');
  const [visaDefaultsForId, setVisaDefaultsForId] = useState<string | null>(null);

  // Pré-remplit une seule fois par visaBc (dès qu'il est chargé et en attente de décision) avec les
  // valeurs par défaut suggérées — ajustement pendant le rendu plutôt que dans un effect, cf.
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  if (visaBc && visaBc.decision === null && visaDefaultsForId !== visaBc.visaBcId) {
    const annee = new Date().getFullYear();
    const nbVisas = visasBcList.filter((v) => v.numeroVisa).length;
    setNumeroVisaSaisi(`VISA-${annee}-${String(nbVisas + 1).padStart(4, '0')}`);
    setDateVisaSaisi(new Date().toISOString().slice(0, 10));
    setVisaDefaultsForId(visaBc.visaBcId);
  }

  const isReceptionTechnique = dossier?.processusCode === 'VA_RECEPT';
  const { data: reception } = useReceptionTechniqueByReference(reference, isReceptionTechnique);
  const { data: receptionConstats = [] } = useReceptionConstats(reception?.receptionId ?? '');
  const updateReceptionAvis = useUpdateReceptionAvis();
  const [receptionDialogOpen, setReceptionDialogOpen] = useState(false);

  const isReceptionNeuf = dossier?.processusCode === 'VA_RECEPT_NEUF';
  const { data: receptionNeuf } = useReceptionNeufByReference(reference, isReceptionNeuf);
  const { data: receptionNeufLignes = [] } = useReceptionNeufLignes(receptionNeuf?.receptionNeufId ?? '');
  const validerReceptionNeuf = useValiderReceptionNeuf();
  const [pvOrdreRecetteDialogOpen, setPvOrdreRecetteDialogOpen] = useState(false);

  const isArretageLivret = dossier?.processusCode === 'VA_ARRET_LIV';
  const { data: arretageLivret } = useArretageLivretByReference(reference, isArretageLivret);
  const { data: arretageComplet } = useArretageLivretComplet(arretageLivret?.arretageId ?? '');
  const arretageFeuilles = arretageComplet?.feuilles ?? feuillesVides();
  const arretageLivretDetails = arretageComplet?.details ?? [];
  const arretageSansFeuilles = Object.values(arretageFeuilles).every((lignes) => lignes.length === 0);
  const [visaArretageDialogOpen, setVisaArretageDialogOpen] = useState(false);
  const updateArretageLivret = useUpdateArretageLivret();
  const validerArretageLivret = useValiderArretageLivret();
  const [numeroArretageSaisi, setNumeroArretageSaisi] = useState('');
  const [dateArretageSaisi, setDateArretageSaisi] = useState('');
  const [arretageDefaultsForId, setArretageDefaultsForId] = useState<string | null>(null);

  // Pré-remplit une seule fois par arretageLivret (dès qu'il est chargé et pas encore finalisé)
  // avec les valeurs par défaut suggérées — ajustement pendant le rendu plutôt que dans un effect,
  // même pattern que numeroVisaSaisi/dateVisaSaisi (visa bon de commande).
  if (arretageLivret && !arretageLivret.numeroArretage && arretageDefaultsForId !== arretageLivret.arretageId) {
    const annee = new Date().getFullYear();
    const nbVal = documents.filter((d) => d.modeleCode === 'VISA_ARRETAGE_LIVRET').length;
    setNumeroArretageSaisi(`VAL-${annee}-${String(nbVal + 1).padStart(4, '0')}`);
    setDateArretageSaisi(arretageLivret.dateArretage);
    setArretageDefaultsForId(arretageLivret.arretageId);
  }

  const isAptitudeLocation = dossier?.processusCode === 'VA_LOCATION';
  const { data: controleAptitude } = useAptitudeLocationByReference(reference, isAptitudeLocation);
  const updateAptitudeAvis = useUpdateAptitudeAvis();
  const genererAutorisationLocationReel = useGenererAutorisationLocation();
  const [attestationDialogOpen, setAttestationDialogOpen] = useState(false);
  const [autorisationDialogOpen, setAutorisationDialogOpen] = useState(false);
  const [avisAptitudeDialogOpen, setAvisAptitudeDialogOpen] = useState<'APTE' | 'NON_APTE' | null>(null);
  const [observationAptitude, setObservationAptitude] = useState('');

  const isAttestationCaracteristique = dossier?.processusCode === 'VA_ATT_CARAC';
  const { data: attestationCaracteristique } = useAttestationCaracteristiqueByReference(reference, isAttestationCaracteristique);
  const [attestationCaracDialogOpen, setAttestationCaracDialogOpen] = useState(false);
  const validerAttestationCaracteristique = useValiderAttestationCaracteristique();

  const isExpertise = dossier?.processusCode === 'VA_EXPERTISE';
  const { data: expertise } = useExpertiseByReference(reference, isExpertise);
  const { data: expertiseDommages = [] } = useExpertiseDommages(expertise?.expertiseId ?? '');
  const validerExpertise = useValiderExpertise();
  const [rapportExpertiseDialogOpen, setRapportExpertiseDialogOpen] = useState(false);

  const isCondamnation = dossier?.processusCode === 'VA_CONDAMN';
  const { data: condamnation } = useCondamnationComplet(reference, isCondamnation);
  const validerCondamnation = useValiderCondamnation();
  const [pvCondamnationDialogOpen, setPvCondamnationDialogOpen] = useState(false);
  const [misePrixDialogOpen, setMisePrixDialogOpen] = useState(false);
  const categorieMisePrix = condamnation?.typeMiseAPrix ?? 'VEHICULE';
  const { data: sectionsMisePrix = [] } = useSectionsMisePrix(categorieMisePrix);
  const { data: elementsMisePrix = [] } = useElementsMisePrix();
  const grilleMisePrix = useMemo(() => construireGrille(sectionsMisePrix, elementsMisePrix), [sectionsMisePrix, elementsMisePrix]);
  const prixMisePrix = useMemo<PrixParElement>(
    () => Object.fromEntries((condamnation?.prix ?? []).map((p) => [p.elementId, p.prix])),
    [condamnation?.prix],
  );

  const isTestChauffeur = dossier?.processusCode === 'VA_TEST_CHAUF';
  const { data: chauffeurTest } = useChauffeurTestByReference(reference, isTestChauffeur);
  const updateChauffeurTestResultat = useUpdateChauffeurTestResultat();
  const [resultatTestChauffeurDialogOpen, setResultatTestChauffeurDialogOpen] = useState(false);
  const [resultatTestChauffeurChoix, setResultatTestChauffeurChoix] = useState<'APTE' | 'NON_APTE' | null>(null);
  const [observationTestChauffeur, setObservationTestChauffeur] = useState('');

  const { data: vehicules = [] } = useVehicules();
  const { data: chauffeurs = [] } = useChauffeurs();
  const { data: categoriesUtilisation = [] } = useCategoriesUtilisationVehicule();
  const { data: etatsGeneral = [] } = useEtatsGeneralConstate();
  const { data: ministeres = [] } = useMinisteres();
  const { data: marques = [] } = useMarques();
  const [quitusDialogOpen, setQuitusDialogOpen] = useState(false);

  const documentsLies = documents.filter((d) => d.referenceActe === reference);

  function genererPv() {
    if (!dossier || !constatation || !livrableAtteint) return;
    validerConstatation.mutate(constatation.constatationId);
    genererDocumentReel.mutate(
      { referenceActe: dossier.referenceActe, modeleCode: 'PV_CONSTATATION' },
      { onSuccess: () => setPvDialogOpen(true) },
    );
  }

  function genererDocumentBc() {
    if (!dossier) return;
    genererDocumentReel.mutate({ referenceActe: dossier.referenceActe, modeleCode: 'BC_VISE' });
  }

  function viserBc() {
    if (!visaBc || !livrableAtteint || !numeroVisaSaisi.trim() || !dateVisaSaisi) return;
    updateVisaBcDecision.mutate(
      {
        visaBcId: visaBc.visaBcId,
        decision: { decision: 'VISA', numeroVisa: numeroVisaSaisi.trim(), dateVisa: dateVisaSaisi },
      },
      { onSuccess: () => { genererDocumentBc(); setBcDialogOpen(true); } },
    );
  }

  function confirmRefuserBc() {
    if (!visaBc || !motifRefusBc.trim() || !livrableAtteint || !numeroVisaSaisi.trim() || !dateVisaSaisi) return;
    updateVisaBcDecision.mutate(
      {
        visaBcId: visaBc.visaBcId,
        decision: {
          decision: 'REFUS',
          motifRefus: motifRefusBc.trim(),
          numeroVisa: numeroVisaSaisi.trim(),
          dateVisa: dateVisaSaisi,
        },
      },
      { onSuccess: () => { genererDocumentBc(); setRefuserDialogOpen(false); setMotifRefusBc(''); setBcDialogOpen(true); } },
    );
  }

  function genererVisaArretageLivret() {
    if (!dossier || !arretageLivret || !livrableAtteint || !numeroArretageSaisi.trim() || !dateArretageSaisi) return;
    updateArretageLivret.mutate(
      { arretageId: arretageLivret.arretageId, numeroArretage: numeroArretageSaisi.trim(), dateArretage: dateArretageSaisi },
      {
        onSuccess: () => {
          validerArretageLivret.mutate(arretageLivret.arretageId);
          genererDocumentReel.mutate(
            { referenceActe: dossier.referenceActe, modeleCode: 'VISA_ARRETAGE_LIVRET' },
            { onSuccess: () => setVisaArretageDialogOpen(true) },
          );
        },
      },
    );
  }

  function genererPvOrdreRecette() {
    if (!dossier || !receptionNeuf || !livrableAtteint) return;
    validerReceptionNeuf.mutate(receptionNeuf.receptionNeufId);
    genererDocumentReel.mutate(
      { referenceActe: dossier.referenceActe, modeleCode: 'PV_ORDRE_RECETTE' },
      { onSuccess: () => setPvOrdreRecetteDialogOpen(true) },
    );
  }

  function genererDocumentReception() {
    if (!dossier) return;
    genererDocumentReel.mutate({ referenceActe: dossier.referenceActe, modeleCode: 'PV_RECEPTION' });
  }

  function donnerAvisReception(avis: 'FAVORABLE' | 'DEFAVORABLE') {
    if (!reception || !livrableAtteint) return;
    updateReceptionAvis.mutate(
      { receptionId: reception.receptionId, avis },
      { onSuccess: () => { genererDocumentReception(); setReceptionDialogOpen(true); } },
    );
  }

  function genererAttestationAptitude() {
    if (!dossier) return;
    // Le vrai PDF est déjà généré côté serveur par AptitudeService.appliquerAvis (appelé par
    // updateAptitudeAvis.mutate juste avant) — on le récupère ici pour l'ouvrir.
    genererDocumentReel.mutate({ referenceActe: dossier.referenceActe, modeleCode: 'ATTESTATION_APTITUDE' });
  }

  function genererAutorisationLocation() {
    if (!dossier || !controleAptitude || !livrableAtteint) return;
    genererAutorisationLocationReel.mutate(controleAptitude.aptitudeId, {
      onSuccess: () => {
        // Le vrai PDF est déjà généré côté serveur par AptitudeService.genererAutorisationLocation
        // (appelé par genererAutorisationLocationReel.mutate ci-dessus) — récupéré ici pour l'ouvrir.
        genererDocumentReel.mutate(
          { referenceActe: dossier.referenceActe, modeleCode: 'AUTORISATION_LOCATION' },
          { onSuccess: () => setAutorisationDialogOpen(true) },
        );
      },
    });
  }

  function donnerAvisAptitude(avis: 'APTE' | 'NON_APTE') {
    if (!controleAptitude || !livrableAtteint) return;
    updateAptitudeAvis.mutate(
      { aptitudeId: controleAptitude.aptitudeId, avisAptitude: avis, observation: observationAptitude.trim() },
      {
        onSuccess: () => {
          genererAttestationAptitude();
          setAttestationDialogOpen(true);
          setAvisAptitudeDialogOpen(null);
          setObservationAptitude('');
        },
      },
    );
  }

  function genererAttestationCaracteristique() {
    if (!dossier || !attestationCaracteristique || !livrableAtteint) return;
    validerAttestationCaracteristique.mutate(attestationCaracteristique.attestationId);
    genererDocumentReel.mutate(
      { referenceActe: dossier.referenceActe, modeleCode: 'ATTESTATION_CARACTERISTIQUE' },
      { onSuccess: () => setAttestationCaracDialogOpen(true) },
    );
  }

  function genererRapportExpertise() {
    if (!dossier || !expertise || !livrableAtteint) return;
    validerExpertise.mutate(expertise.expertiseId);
    genererDocumentReel.mutate(
      { referenceActe: dossier.referenceActe, modeleCode: 'RAPPORT_EXPERTISE' },
      { onSuccess: () => setRapportExpertiseDialogOpen(true) },
    );
  }

  function genererPvCondamnation() {
    if (!dossier || !condamnation || !livrableAtteint) return;
    validerCondamnation.mutate(condamnation.evaluationId);
    genererDocumentReel.mutate(
      { referenceActe: dossier.referenceActe, modeleCode: 'PV_CONDAMNATION' },
      { onSuccess: () => setPvCondamnationDialogOpen(true) },
    );
  }

  /** La mise à prix ne valide pas la condamnation (c'est le PV d'évaluation qui l'acte) : génération seule. */
  function genererMisePrix() {
    if (!dossier || !condamnation || !livrableAtteint) return;
    genererDocumentReel.mutate(
      { referenceActe: dossier.referenceActe, modeleCode: 'MISE_A_PRIX' },
      { onSuccess: () => setMisePrixDialogOpen(true) },
    );
  }

  function genererResultatTestChauffeur() {
    if (!dossier || !livrableAtteint) return;
    genererDocumentReel.mutate(
      { referenceActe: dossier.referenceActe, modeleCode: 'RESULTAT_TEST_CHAUFFEUR' },
      { onSuccess: () => setResultatTestChauffeurDialogOpen(true) },
    );
  }

  function donnerResultatTestChauffeur(resultat: 'APTE' | 'NON_APTE') {
    if (!chauffeurTest || !livrableAtteint) return;
    updateChauffeurTestResultat.mutate(
      { testId: chauffeurTest.testId, resultat, observations: observationTestChauffeur.trim() },
      {
        onSuccess: () => {
          genererResultatTestChauffeur();
          setResultatTestChauffeurChoix(null);
          setObservationTestChauffeur('');
        },
      },
    );
  }

  function genererQuitus() {
    if (!dossier || !recensement || !livrableAtteint) return;
    validerRecensement.mutate(recensement.recensementId, {
      onSuccess: () => {
        genererDocumentReel.mutate(
          { referenceActe: dossier.referenceActe, modeleCode: 'QUITUS_RECENSEMENT' },
          { onSuccess: () => setQuitusDialogOpen(true) },
        );
      },
    });
  }

  function handleAjouterPiece() {
    if (!dossier || !piecesLibelle.trim() || !piecesFile) return;
    addDossierPiece.mutate(
      { referenceActe: dossier.referenceActe, pieceLibelle: piecesLibelle.trim(), file: piecesFile },
      { onSuccess: () => { setPiecesLibelle(''); setPiecesFile(null); } },
    );
  }

  function handleAttachPieceFile(dossierPieceId: string) {
    if (!dossier || !attachingFile) return;
    attachPieceFile.mutate(
      { dossierPieceId, referenceActe: dossier.referenceActe, file: attachingFile },
      { onSuccess: () => { setAttachingPieceId(null); setAttachingFile(null); } },
    );
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!dossier) return <p className="text-sm text-muted-foreground">Dossier introuvable.</p>;

  return (
    <div data-testid="dossier-detail-page" className="space-y-6">
      <PageHeader
        title={t('detailTitle', { reference: dossier.referenceActe })}
        description={dossier.dossierMotif}
        actions={<Badge>{tStatuts(dossier.statut)}</Badge>}
      />

      <FormSection title={t('workflow.title')}>
        <WorkflowStepper etapeCode={dossier.etapeCode} motifRejet={dossier.motifRejet} />
      </FormSection>

      {consultation ? (
        <p className="rounded-sm border border-dashed border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground" data-testid="dossier-consultation-banner">
          {t('consultation.bandeau')}
        </p>
      ) : (
        <EtapeActionPanel dossier={dossier} />
      )}

      <Tabs defaultValue="informations">
        <TabsList>
          <TabsTrigger value="informations" data-testid="dossier-tab-informations">{t('tabs.informations')}</TabsTrigger>
          <TabsTrigger value="pieces" data-testid="dossier-tab-pieces">{t('tabs.pieces')}</TabsTrigger>
          <TabsTrigger value="historique" data-testid="dossier-tab-historique">{t('tabs.historique')}</TabsTrigger>
          <TabsTrigger value="documents" data-testid="dossier-tab-documents">{t('tabs.documents')}</TabsTrigger>
          {isRecensement && (
            <TabsTrigger value="vehicules" data-testid="dossier-tab-vehicules">{t('tabs.vehicules')}</TabsTrigger>
          )}
          {isConstatation && (
            <TabsTrigger value="constatation" data-testid="dossier-tab-constatation">{t('tabs.constatation')}</TabsTrigger>
          )}
          {isVisaBc && (
            <TabsTrigger value="visaBc" data-testid="dossier-tab-visa-bc">{t('tabs.visaBc')}</TabsTrigger>
          )}
          {isReceptionTechnique && (
            <TabsTrigger value="receptionTechnique" data-testid="dossier-tab-reception-technique">{t('tabs.receptionTechnique')}</TabsTrigger>
          )}
          {isReceptionNeuf && (
            <TabsTrigger value="receptionNeuf" data-testid="dossier-tab-reception-neuf">{t('tabs.receptionVaNeuf')}</TabsTrigger>
          )}
          {isArretageLivret && (
            <TabsTrigger value="arretageLivret" data-testid="dossier-tab-arretage-livret">{t('tabs.arretageLivret')}</TabsTrigger>
          )}
          {isAptitudeLocation && (
            <TabsTrigger value="aptitudeLocation" data-testid="dossier-tab-aptitude-location">{t('tabs.aptitudeLocation')}</TabsTrigger>
          )}
          {isAttestationCaracteristique && (
            <TabsTrigger value="attestationCaracteristiques" data-testid="dossier-tab-attestation-caracteristiques">{t('tabs.attestationCaracteristiques')}</TabsTrigger>
          )}
          {isExpertise && (
            <TabsTrigger value="expertise" data-testid="dossier-tab-expertise">{t('tabs.expertise')}</TabsTrigger>
          )}
          {isCondamnation && (
            <TabsTrigger value="condamnation" data-testid="dossier-tab-condamnation">{t('tabs.condamnation')}</TabsTrigger>
          )}
          {isTestChauffeur && (
            <TabsTrigger value="testChauffeur" data-testid="dossier-tab-test-chauffeur">{t('tabs.testChauffeur')}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="informations" className="pt-4">
          <FormSection title={t('tabs.informations')}>
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={t('fields.reference')} value={dossier.referenceActe} />
              <Field label={t('fields.processus')} value={dossier.typeActe} />
              <Field label={t('fields.dateDepot')} value={dossier.dossierDateDepot} />
              <Field label={t('fields.motif')} value={dossier.dossierMotif} />
              <Field label={t('fields.ministere')} value={ministeres.find((m) => m.minCode === dossier.ministereCode)?.libelle ?? dossier.ministereCode} />
              {dossier.motifRejet && (
                <Field label={t('actions.motifRejetLabel')} value={dossier.motifRejet} />
              )}
            </dl>
          </FormSection>
        </TabsContent>

        <TabsContent value="pieces" className="pt-4">
          <div className="space-y-4">
            {consultation ? null : dossier.etapeCode !== null ? (
              <div className="flex flex-col gap-2 rounded-sm border border-dashed border-border p-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="nouvelle-piece-libelle">{t('pieces.libelle')}</label>
                  <Input id="nouvelle-piece-libelle" value={piecesLibelle} onChange={(e) => setPiecesLibelle(e.target.value)} placeholder={t('pieces.libellePlaceholder')} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor="nouvelle-piece-fichier">{t('pieces.fichier')}</label>
                  <Input id="nouvelle-piece-fichier" type="file" onChange={(e) => setPiecesFile(e.target.files?.[0] ?? null)} />
                </div>
                <Button type="button" onClick={handleAjouterPiece} disabled={!piecesLibelle.trim() || !piecesFile || addDossierPiece.isPending} data-testid="ajouter-piece-button">
                  <Plus className="mr-1.5 h-4 w-4" />
                  {t('pieces.ajouter')}
                </Button>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{t('pieces.dossierClosed')}</p>
            )}

            {pieces.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-2">
                {pieces.map((p) => (
                  <li key={p.dossierPieceId} className="flex flex-col gap-2 rounded-sm border border-border px-3 py-2">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <span className="text-sm">
                          {p.pieceLibelle}
                          {!p.obligatoire && (
                            <span className="ml-2 text-xs text-muted-foreground">({tPieces('nonBloquant')})</span>
                          )}
                        </span>
                        {p.nomOriginal && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => telechargerPieceFichier.mutate({ dossierPieceId: p.dossierPieceId, nomOriginal: p.nomOriginal })}
                              disabled={telechargerPieceFichier.isPending}
                              className="text-xs text-primary underline disabled:opacity-50"
                              data-testid={`piece-fichier-${p.dossierPieceId}`}
                            >
                              {p.nomOriginal}
                            </button>
                            {!consultation && (
                              <button
                                type="button"
                                onClick={() => setDeletingPieceFichierId(p.dossierPieceId)}
                                className="text-muted-foreground hover:text-destructive"
                                data-testid={`piece-fichier-supprimer-${p.dossierPieceId}`}
                                aria-label={t('pieces.supprimerFichier')}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={PIECE_VARIANT[p.statutPiece]}>{tPieces(p.statutPiece)}</Badge>

                        {dossier.etapeCode !== null && !consultation && (
                          attachingPieceId === p.dossierPieceId ? (
                            <>
                              <Input
                                type="file"
                                className="h-8 w-40"
                                onChange={(e) => setAttachingFile(e.target.files?.[0] ?? null)}
                                data-testid={`piece-attach-input-${p.dossierPieceId}`}
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleAttachPieceFile(p.dossierPieceId)}
                                disabled={!attachingFile || attachPieceFile.isPending}
                                data-testid={`piece-attach-confirm-${p.dossierPieceId}`}
                              >
                                {p.nomOriginal ? t('pieces.remplacer') : t('pieces.joindre')}
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => { setAttachingPieceId(null); setAttachingFile(null); }}
                              >
                                {tCommon('cancel')}
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => setAttachingPieceId(p.dossierPieceId)}
                              data-testid={`piece-attach-button-${p.dossierPieceId}`}
                            >
                              <Upload className="mr-1.5 h-3.5 w-3.5" />
                              {p.nomOriginal ? t('pieces.remplacer') : t('pieces.joindre')}
                            </Button>
                          )
                        )}
                      </div>
                    </div>

                    {dossier.etapeCode !== null && !consultation && (
                      <div className="flex flex-col gap-1.5 border-t border-dashed border-border pt-2 sm:flex-row sm:items-start">
                        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Checkbox
                            checked={p.statutPiece !== 'ATTENDUE'}
                            onCheckedChange={(checked) => updateDossierPieceStatut.mutate({
                              dossierPieceId: p.dossierPieceId,
                              statutPiece: checked === true ? 'RECUE' : 'ATTENDUE',
                            })}
                            data-testid={`piece-recue-checkbox-${p.dossierPieceId}`}
                          />
                          {t('pieces.recue')}
                        </label>
                        <Textarea
                          className="h-8 min-h-8 flex-1 text-xs"
                          placeholder={t('pieces.observationPlaceholder')}
                          value={pieceObservations[p.dossierPieceId] ?? p.observation ?? ''}
                          onChange={(e) => setPieceObservations((prev) => ({ ...prev, [p.dossierPieceId]: e.target.value }))}
                          onBlur={(e) => {
                            if (e.target.value !== (p.observation ?? '')) {
                              updateDossierPieceStatut.mutate({ dossierPieceId: p.dossierPieceId, observation: e.target.value });
                            }
                          }}
                          data-testid={`piece-observation-${p.dossierPieceId}`}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historique" className="pt-4">
          {historique.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-5">
              {historique.map((h) => (
                <li key={`${h.activiteCode}-${h.tacheAFaire}-${h.rang}`} className="text-sm">
                  <p className="font-medium text-foreground">
                    {tEtapes(h.tacheAFaire as Parameters<typeof tEtapes>[0])}
                    {!h.dateFin && <span className="ml-2 text-xs text-[color:var(--color-info)]">({t('workflow.enCours')})</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {h.detenteur ?? '—'} — {h.dateDebut ?? '—'}{h.dateFin ? ` → ${h.dateFin}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="documents" className="pt-4">
          {documentsLies.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <ul className="space-y-2">
              {documentsLies.map((d) => (
                <li key={d.documentId} className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  <span className="text-sm">{d.numeroDocument} — {d.modeleCode}</span>
                  <Badge>{d.statut}</Badge>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>

        {isRecensement && (
          <TabsContent value="vehicules" className="pt-4">
            {recensement && (
              <div className="mb-3 flex justify-end">
                {documents.some((d) => d.referenceActe === reference && d.modeleCode === 'QUITUS_RECENSEMENT') ? (
                  <Button variant="outline" onClick={() => setQuitusDialogOpen(true)} data-testid="revoir-quitus-button">
                    <FileText className="mr-1.5 h-4 w-4" />
                    {tRecensement('revoirQuitus')}
                  </Button>
                ) : (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="inline-flex">
                          <Button onClick={genererQuitus} disabled={validerRecensement.isPending || genererDocumentReel.isPending || !livrableAtteint} data-testid="generer-quitus-button">
                            <FileText className="mr-1.5 h-4 w-4" />
                            {tRecensement('genererQuitus')}
                          </Button>
                        </span>
                      }
                    />
                    {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                  </Tooltip>
                )}
              </div>
            )}

            {recensementLignes.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-2">
                {recensementLignes.map((l) => {
                  const vehicule = vehicules.find((v) => v.vehiculeId === l.vehiculeId);
                  const categorie = categoriesUtilisation.find((c) => c.categorieUtilisationCode === l.categorieUtilisation)?.libelle ?? l.categorieUtilisation;
                  const etat = etatsGeneral.find((e) => e.etatGeneralCode === l.etatGeneral)?.libelle ?? l.etatGeneral;
                  return (
                    <li key={l.recensementLigneId} className="flex items-start justify-between gap-2 rounded-sm border border-border px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {vehicule?.vehiculeImmatriculation ?? '—'} — {l.detenteurEffectif}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {l.type} · {categorie} · {etat} · Carte grise {l.carteGriseDispo ? 'oui' : 'non'} · Livrets {l.livretsDispo ? 'oui' : 'non'}
                        </p>
                      </div>
                      {vehicule && (
                        <Link href={ROUTES.VEHICULE_EDIT(vehicule.vehiculeId)}>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={tVehicules('actions.edit')}
                            data-testid={`recensement-ligne-edit-vehicule-${vehicule.vehiculeId}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}

            {recensement && (
              <QuitusRecensementDialog
                open={quitusDialogOpen}
                onOpenChange={setQuitusDialogOpen}
                recensement={recensement}
                lignes={recensementLignes}
                vehicules={vehicules}
                ministeres={ministeres}
                marques={marques}
                soas={soas}
              />
            )}
          </TabsContent>
        )}

        {isConstatation && (
          <TabsContent value="constatation" className="pt-4">
            {constatation ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="inline-flex">
                          <Button onClick={genererPv} disabled={validerConstatation.isPending || genererDocumentReel.isPending || !livrableAtteint} data-testid="generer-pv-button">
                            <FileText className="mr-1.5 h-4 w-4" />
                            {tConstat('pvGenerer')}
                          </Button>
                        </span>
                      }
                    />
                    {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                  </Tooltip>
                </div>
                <SummaryList
                  items={[
                    { label: tConstat('fields.expertNom'), value: constatation.expertNom },
                    { label: tConstat('fields.lieu'), value: constatation.lieu },
                    { label: tConstat('fields.dateConstat'), value: constatation.dateConstat },
                    { label: tConstat('fields.heureConstat'), value: constatation.heureConstat },
                    { label: tConstat('fields.soa'), value: constatation.soa },
                    { label: tConstat('fields.etatGeneral'), value: etatsGeneral.find((e) => e.etatGeneralCode === constatation.etatGeneral)?.libelle },
                    { label: tConstat('fields.kilometrage'), value: constatation.kilometrage },
                    { label: tConstat('fields.detenteur'), value: constatation.detenteur },
                    { label: tConstat('fields.numeroConstat'), value: constatation.numeroConstat },
                    { label: tConstat('fields.equipementVerif'), value: constatation.equipementVerif },
                    { label: tConstat('fields.nomChauffeur'), value: constatation.nomChauffeur },
                    { label: tConstat('fields.constats'), value: constatation.constats },
                  ]}
                />
                <div>
                  {sectionsConstatation.map((section) => (
                    <ConstatationSectionSummary
                      key={section.sectionId}
                      sectionId={section.sectionId}
                      sectionCode={section.sectionCode}
                      sectionLibelle={section.sectionLibelle}
                      elements={constatationElements}
                    />
                  ))}
                </div>

                <PvConstatationDialog
                  open={pvDialogOpen}
                  onOpenChange={setPvDialogOpen}
                  constatation={constatation}
                  vehicule={vehicules.find((v) => v.vehiculeId === constatation.vehiculeId)}
                  elements={constatationElements}
                  pieces={constatationPieces}
                  reparations={constatationReparations}
                  accessoires={constatationAccessoires}
                  ministereLibelle={ministeres.find((m) => m.minCode === dossier.ministereCode)?.libelle ?? dossier.ministereCode}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isVisaBc && (
          <TabsContent value="visaBc" className="pt-4">
            {visaBc ? (
              <div className="space-y-4">
                {visaBc.decision === null ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="visa-numero-input">{tVisaBc('fields.numeroVisa')}</Label>
                        <Input
                          id="visa-numero-input"
                          className="mt-1.5"
                          value={numeroVisaSaisi}
                          onChange={(e) => setNumeroVisaSaisi(e.target.value)}
                          disabled={consultation}
                          data-testid="visa-numero-input"
                        />
                      </div>
                      <div>
                        <Label htmlFor="visa-date-input">{tVisaBc('fields.dateVisa')}</Label>
                        <Input
                          id="visa-date-input"
                          type="date"
                          className="mt-1.5"
                          value={dateVisaSaisi}
                          onChange={(e) => setDateVisaSaisi(e.target.value)}
                          disabled={consultation}
                          data-testid="visa-date-input"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span className="inline-flex">
                              <Button
                                onClick={viserBc}
                                disabled={updateVisaBcDecision.isPending || !livrableAtteint || !numeroVisaSaisi.trim() || !dateVisaSaisi}
                                data-testid="viser-bc-button"
                              >
                                <FileCheck className="mr-1.5 h-4 w-4" />
                                {visaBc.grandsTravaux ? tVisaBc('viserSousReserve') : tVisaBc('viserSansReserve')}
                              </Button>
                            </span>
                          }
                        />
                        {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span className="inline-flex">
                              <Button
                                variant="outline"
                                onClick={() => setRefuserDialogOpen(true)}
                                disabled={!livrableAtteint || !numeroVisaSaisi.trim() || !dateVisaSaisi}
                                data-testid="refuser-bc-button"
                              >
                                <Ban className="mr-1.5 h-4 w-4" />
                                {tVisaBc('refuser')}
                              </Button>
                            </span>
                          }
                        />
                        {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                      </Tooltip>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <Badge variant={visaBc.decision === 'REFUS' ? 'destructive' : 'default'}>
                      {visaBc.decision === 'REFUS'
                        ? tVisaBc('refuser')
                        : visaBc.grandsTravaux ? tVisaBc('viserSousReserve') : tVisaBc('viserSansReserve')}
                    </Badge>
                    <Button variant="outline" onClick={() => setBcDialogOpen(true)} data-testid="revoir-document-bc-button">
                      <FileText className="mr-1.5 h-4 w-4" />
                      {tVisaBc('revoirDocument')}
                    </Button>
                  </div>
                )}

                <SummaryList
                  items={[
                    { label: tVisaBc('fields.vehicule'), value: vehicules.find((v) => v.vehiculeId === visaBc.vehiculeId)?.vehiculeImmatriculation },
                    { label: tVisaBc('fields.numeroBc'), value: visaBc.numeroBc },
                    { label: tVisaBc('fields.dateBc'), value: visaBc.dateBc },
                    { label: tVisaBc('fields.fournisseur'), value: visaBc.fournisseur },
                    { label: tVisaBc('fields.nif'), value: visaBc.nif },
                    { label: tVisaBc('fields.stat'), value: visaBc.stat },
                    { label: tVisaBc('fields.referencePvConstat'), value: visaBc.referencePvConstat },
                    { label: tVisaBc('fields.montant'), value: visaBc.montant.toLocaleString('fr-FR') },
                    ...(visaBc.numeroVisa ? [{ label: tVisaBc('fields.numeroVisa'), value: visaBc.numeroVisa }] : []),
                    ...(visaBc.dateVisa ? [{ label: tVisaBc('fields.dateVisa'), value: visaBc.dateVisa }] : []),
                  ]}
                />

                {visaBcPieces.length > 0 && (
                  <ul className="divide-y divide-border rounded-sm border border-border">
                    {visaBcPieces.map((p) => (
                      <li key={p.id} className="px-3 py-2 text-sm">
                        {p.designation} — {p.quantite} × {p.prixUnitaire.toLocaleString('fr-FR')} = {(p.quantite * p.prixUnitaire).toLocaleString('fr-FR')}
                      </li>
                    ))}
                  </ul>
                )}

                <BonCommandeViseDialog
                  open={bcDialogOpen}
                  onOpenChange={setBcDialogOpen}
                  visaBc={visaBc}
                  vehicule={vehicules.find((v) => v.vehiculeId === visaBc.vehiculeId)}
                  pieces={visaBcPieces}
                />

                <ConfirmDialog
                  open={refuserDialogOpen}
                  onOpenChange={(open) => { if (!open) { setRefuserDialogOpen(false); setMotifRefusBc(''); } }}
                  title={tVisaBc('refuser')}
                  variant="destructive"
                  loading={updateVisaBcDecision.isPending}
                  onConfirm={motifRefusBc.trim() ? confirmRefuserBc : undefined}
                >
                  <Textarea
                    value={motifRefusBc}
                    onChange={(e) => setMotifRefusBc(e.target.value)}
                    placeholder={tVisaBc('motifRefusLabel')}
                    aria-label={tVisaBc('motifRefusLabel')}
                  />
                </ConfirmDialog>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isReceptionTechnique && (
          <TabsContent value="receptionTechnique" className="pt-4">
            {reception ? (
              <div className="space-y-4">
                {reception.avis === null ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button onClick={() => donnerAvisReception('FAVORABLE')} disabled={updateReceptionAvis.isPending || !livrableAtteint} data-testid="avis-favorable-button">
                              <FileCheck className="mr-1.5 h-4 w-4" />
                              {tReception('avisFavorable')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button variant="outline" onClick={() => donnerAvisReception('DEFAVORABLE')} disabled={updateReceptionAvis.isPending || !livrableAtteint} data-testid="avis-defavorable-button">
                              <Ban className="mr-1.5 h-4 w-4" />
                              {tReception('avisDefavorable')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <Badge variant={reception.avis === 'DEFAVORABLE' ? 'destructive' : 'default'}>
                      {reception.avis === 'DEFAVORABLE' ? tReception('avisDefavorable') : tReception('avisFavorable')}
                    </Badge>
                    <Button variant="outline" onClick={() => setReceptionDialogOpen(true)} data-testid="revoir-document-reception-button">
                      <FileText className="mr-1.5 h-4 w-4" />
                      {tReception('revoirDocument')}
                    </Button>
                  </div>
                )}

                <SummaryList
                  items={[
                    { label: tReception('fields.vehicule'), value: vehicules.find((v) => v.vehiculeId === reception.vehiculeId)?.vehiculeImmatriculation },
                    { label: tReception('fields.visaBc'), value: visasBcList.find((v) => v.visaBcId === reception.visaBcId)?.numeroBc },
                    { label: tReception('fields.dateReception'), value: reception.dateReception },
                    { label: tReception('fields.heureReception'), value: reception.heureReception },
                    { label: tReception('fields.minSoa'), value: reception.minSoa },
                    { label: tReception('fields.expertNom'), value: reception.expertNom },
                  ]}
                />

                {receptionConstats.length > 0 && (
                  <ul className="divide-y divide-border rounded-sm border border-border">
                    {receptionConstats.map((c) => (
                      <li key={c.id} className="px-3 py-2 text-sm">{c.rang}. {c.libelle}</li>
                    ))}
                  </ul>
                )}

                <FicheEvaluationSection
                  referenceActe={reception.referenceActe}
                  vehiculesParDefaut={(() => {
                    const v = vehicules.find((x) => x.vehiculeId === reception.vehiculeId);
                    return v ? [{ immatriculation: v.vehiculeImmatriculation, vehiculeId: v.vehiculeId }] : [];
                  })()}
                  livrableAtteint={livrableAtteint}
                  lectureSeule={consultation}
                  generationEnCours={genererDocumentReel.isPending}
                  onGenerer={() => genererDocumentReel.mutate({ referenceActe: reception.referenceActe, modeleCode: 'FICHE_EVALUATION' })}
                />

                <ReceptionTechniqueDialog
                  open={receptionDialogOpen}
                  onOpenChange={setReceptionDialogOpen}
                  reception={reception}
                  vehicule={vehicules.find((v) => v.vehiculeId === reception.vehiculeId)}
                  constats={receptionConstats}
                  visaBc={visasBcList.find((v) => v.visaBcId === reception.visaBcId)}
                  ministereLibelle={ministeres.find((m) => m.minCode === dossier.ministereCode)?.libelle ?? dossier.ministereCode}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isReceptionNeuf && (
          <TabsContent value="receptionNeuf" className="pt-4">
            {receptionNeuf ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="inline-flex">
                          <Button onClick={genererPvOrdreRecette} disabled={validerReceptionNeuf.isPending || genererDocumentReel.isPending || !livrableAtteint} data-testid="generer-pv-ordre-recette-button">
                            <FileText className="mr-1.5 h-4 w-4" />
                            {tReceptionNeuf('pvGenerer')}
                          </Button>
                        </span>
                      }
                    />
                    {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                  </Tooltip>
                </div>
                <SummaryList
                  items={[
                    { label: tReceptionNeuf('fields.typeAcquisition'), value: tReceptionNeuf(`typeAcquisitionOptions.${receptionNeuf.typeAcquisition}`) },
                    { label: tReceptionNeuf('fields.financement'), value: receptionNeuf.financement ? tReceptionNeuf(`financementOptions.${receptionNeuf.financement}`) : undefined },
                    { label: tReceptionNeuf('fields.nomFinancement'), value: receptionNeuf.nomFinancement },
                    { label: tReceptionNeuf('fields.budgetCode'), value: receptionNeuf.budgetCode },
                    { label: tReceptionNeuf('fields.chapitre'), value: receptionNeuf.chapitre },
                    { label: tReceptionNeuf('fields.article'), value: receptionNeuf.article },
                    { label: tReceptionNeuf('fields.compte'), value: receptionNeuf.compte },
                    { label: tReceptionNeuf('fields.commune'), value: receptionNeuf.commune },
                    { label: tReceptionNeuf('fields.referenceMarche'), value: receptionNeuf.referenceMarche },
                    { label: tReceptionNeuf('fields.fournisseurNom'), value: receptionNeuf.fournisseurNom },
                    { label: tReceptionNeuf('fields.fournisseurAnneeCarteFiscale'), value: receptionNeuf.fournisseurAnneeCarteFiscale },
                    { label: tReceptionNeuf('fields.soaCode'), value: receptionNeuf.soaCode },
                    { label: tReceptionNeuf('fields.depositaireNom'), value: receptionNeuf.depositaireNom },
                    { label: tReceptionNeuf('fields.commissionMembresEntite'), value: receptionNeuf.commissionMembresEntite },
                    { label: tReceptionNeuf('fields.commissionMembresDpe'), value: receptionNeuf.commissionMembresDpe },
                    { label: tReceptionNeuf('fields.datePv'), value: receptionNeuf.datePv },
                    { label: tReceptionNeuf('fields.heurePv'), value: receptionNeuf.heurePv },
                  ]}
                />
                {receptionNeufLignes.length > 0 && (
                  <ul className="divide-y divide-border rounded-sm border border-border">
                    {receptionNeufLignes.map((l) => (
                      <li key={l.id} className="px-3 py-2 text-sm">
                        {l.designation} — {l.immatriculation || '—'} — {l.marque} — {l.quantiteFacturee}/{l.quantiteReconnue} — {tReceptionNeuf(`decisionOptions.${l.decision}`)}
                      </li>
                    ))}
                  </ul>
                )}

                <FicheEvaluationSection
                  referenceActe={receptionNeuf.referenceActe}
                  vehiculesParDefaut={receptionNeufLignes.map((l) => ({ immatriculation: l.immatriculation, kilometrage: l.kilometrage }))}
                  livrableAtteint={livrableAtteint}
                  lectureSeule={consultation}
                  generationEnCours={genererDocumentReel.isPending}
                  onGenerer={() => genererDocumentReel.mutate({ referenceActe: receptionNeuf.referenceActe, modeleCode: 'FICHE_EVALUATION' })}
                />

                <PvOrdreRecetteDialog
                  open={pvOrdreRecetteDialogOpen}
                  onOpenChange={setPvOrdreRecetteDialogOpen}
                  reception={receptionNeuf}
                  lignes={receptionNeufLignes}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isArretageLivret && (
          <TabsContent value="arretageLivret" className="pt-4">
            {arretageLivret ? (
              <div className="space-y-4">
                {!arretageLivret.numeroArretage && (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <Label htmlFor="arretage-numero-input">{tArretageLivret('fields.numeroArretage')}</Label>
                      <Input
                        id="arretage-numero-input"
                        className="mt-1.5"
                        value={numeroArretageSaisi}
                        onChange={(e) => setNumeroArretageSaisi(e.target.value)}
                        disabled={consultation}
                        data-testid="arretage-numero-input"
                      />
                    </div>
                    <div>
                      <Label htmlFor="arretage-date-input">{tArretageLivret('fields.dateArretage')}</Label>
                      <Input
                        id="arretage-date-input"
                        type="date"
                        className="mt-1.5"
                        value={dateArretageSaisi}
                        onChange={(e) => setDateArretageSaisi(e.target.value)}
                        disabled={consultation}
                        data-testid="arretage-date-input"
                      />
                    </div>
                  </div>
                )}
                <div className="flex justify-end">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span className="inline-flex">
                          <Button
                            onClick={genererVisaArretageLivret}
                            disabled={updateArretageLivret.isPending || validerArretageLivret.isPending || genererDocumentReel.isPending || !livrableAtteint || !numeroArretageSaisi.trim() || !dateArretageSaisi}
                            data-testid="generer-visa-arretage-button"
                          >
                            <FileText className="mr-1.5 h-4 w-4" />
                            {tArretageLivret('visaGenerer')}
                          </Button>
                        </span>
                      }
                    />
                    {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                  </Tooltip>
                </div>
                <SummaryList
                  items={[
                    { label: tArretageLivret('fields.vehicule'), value: vehicules.find((v) => v.vehiculeId === arretageLivret.vehiculeId)?.vehiculeImmatriculation },
                    { label: tArretageLivret('fields.dateArretage'), value: arretageLivret.dateArretage },
                    { label: tArretageLivret('fields.dernierBc'), value: arretageLivret.dernierBc },
                    { label: tArretageLivret('fields.vehiculeFonction'), value: arretageLivret.vehiculeFonction ? 'oui' : 'non' },
                    ...(arretageLivret.numeroArretage ? [{ label: tArretageLivret('fields.numeroArretage'), value: arretageLivret.numeroArretage }] : []),
                  ]}
                />
                {arretageSansFeuilles && arretageLivretDetails.length > 0 ? (
                  // Dossier antérieur au détail par feuille : ancien détail plat (rubrique / valeur arrêtée)
                  <ul className="divide-y divide-border rounded-sm border border-border">
                    {arretageLivretDetails.map((d) => (
                      <li key={d.id} className="px-3 py-2 text-sm">
                        {tArretageLivret(`typeLivretOptions.${d.typeLivretCode}`)} — {d.rubrique} — {d.valeurArretee}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <FeuillesLivretRecap feuilles={arretageFeuilles} />
                )}

                <VisaArretageLivretDialog
                  open={visaArretageDialogOpen}
                  onOpenChange={setVisaArretageDialogOpen}
                  arretage={arretageComplet?.arretage ?? arretageLivret}
                  vehicule={vehicules.find((v) => v.vehiculeId === arretageLivret.vehiculeId)}
                  feuilles={arretageFeuilles}
                  details={arretageLivretDetails}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isAptitudeLocation && (
          <TabsContent value="aptitudeLocation" className="pt-4">
            {controleAptitude ? (
              <div className="space-y-4">
                {controleAptitude.avisAptitude === null ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button onClick={() => setAvisAptitudeDialogOpen('APTE')} disabled={updateAptitudeAvis.isPending || !livrableAtteint} data-testid="avis-apte-button">
                              <FileCheck className="mr-1.5 h-4 w-4" />
                              {tAptitudeLocation('avisFavorable')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button variant="outline" onClick={() => setAvisAptitudeDialogOpen('NON_APTE')} disabled={updateAptitudeAvis.isPending || !livrableAtteint} data-testid="avis-non-apte-button">
                              <Ban className="mr-1.5 h-4 w-4" />
                              {tAptitudeLocation('avisDefavorable')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Badge variant={controleAptitude.avisAptitude === 'NON_APTE' ? 'destructive' : 'default'}>
                      {controleAptitude.avisAptitude === 'NON_APTE' ? tAptitudeLocation('avisDefavorable') : tAptitudeLocation('avisFavorable')}
                    </Badge>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => setAttestationDialogOpen(true)} data-testid="revoir-attestation-aptitude-button">
                        <FileText className="mr-1.5 h-4 w-4" />
                        {tAptitudeLocation('revoirAttestation')}
                      </Button>
                      {controleAptitude.avisAptitude === 'APTE' && (
                        documents.some((d) => d.referenceActe === reference && d.modeleCode === 'AUTORISATION_LOCATION') ? (
                          <Button variant="outline" onClick={() => setAutorisationDialogOpen(true)} data-testid="revoir-autorisation-location-button">
                            <FileText className="mr-1.5 h-4 w-4" />
                            {tAptitudeLocation('revoirAutorisation')}
                          </Button>
                        ) : (
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <span className="inline-flex">
                                  <Button onClick={genererAutorisationLocation} disabled={genererAutorisationLocationReel.isPending || !livrableAtteint} data-testid="generer-autorisation-location-button">
                                    <FileCheck className="mr-1.5 h-4 w-4" />
                                    {tAptitudeLocation('genererAutorisation')}
                                  </Button>
                                </span>
                              }
                            />
                            {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                          </Tooltip>
                        )
                      )}
                    </div>
                  </div>
                )}

                <SummaryList
                  items={[
                    { label: tAptitudeLocation('fields.vehicule'), value: vehicules.find((v) => v.vehiculeId === controleAptitude.vehiculeId)?.vehiculeImmatriculation },
                    { label: tAptitudeLocation('fields.objetMission'), value: controleAptitude.objetMission },
                    { label: tAptitudeLocation('fields.itineraire'), value: controleAptitude.itineraire },
                    { label: tAptitudeLocation('fields.dateDebut'), value: controleAptitude.dateDebut },
                    { label: tAptitudeLocation('fields.dateFin'), value: controleAptitude.dateFin },
                    { label: tAptitudeLocation('fields.contratLocation'), value: controleAptitude.contratLocation },
                    { label: tAptitudeLocation('fields.fournisseurNifStat'), value: controleAptitude.fournisseurNifStat },
                    { label: tAptitudeLocation('fields.observation'), value: controleAptitude.observation },
                  ]}
                />

                <AttestationAptitudeDialog
                  open={attestationDialogOpen}
                  onOpenChange={setAttestationDialogOpen}
                  controle={controleAptitude}
                  vehicule={vehicules.find((v) => v.vehiculeId === controleAptitude.vehiculeId)}
                />
                <AutorisationLocationDialog
                  open={autorisationDialogOpen}
                  onOpenChange={setAutorisationDialogOpen}
                  controle={controleAptitude}
                  vehicule={vehicules.find((v) => v.vehiculeId === controleAptitude.vehiculeId)}
                />

                <ConfirmDialog
                  open={avisAptitudeDialogOpen !== null}
                  onOpenChange={(open) => { if (!open) { setAvisAptitudeDialogOpen(null); setObservationAptitude(''); } }}
                  title={avisAptitudeDialogOpen === 'NON_APTE' ? tAptitudeLocation('avisDefavorable') : tAptitudeLocation('avisFavorable')}
                  variant={avisAptitudeDialogOpen === 'NON_APTE' ? 'destructive' : 'success'}
                  loading={updateAptitudeAvis.isPending}
                  onConfirm={avisAptitudeDialogOpen ? () => donnerAvisAptitude(avisAptitudeDialogOpen) : undefined}
                >
                  <Textarea
                    value={observationAptitude}
                    onChange={(e) => setObservationAptitude(e.target.value)}
                    placeholder={tAptitudeLocation('fields.observationPlaceholder')}
                    aria-label={tAptitudeLocation('fields.observation')}
                  />
                </ConfirmDialog>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isAttestationCaracteristique && (
          <TabsContent value="attestationCaracteristiques" className="pt-4">
            {attestationCaracteristique ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  {documents.some((d) => d.referenceActe === reference && d.modeleCode === 'ATTESTATION_CARACTERISTIQUE') ? (
                    <Button variant="outline" onClick={() => setAttestationCaracDialogOpen(true)} data-testid="revoir-attestation-caracteristiques-button">
                      <FileText className="mr-1.5 h-4 w-4" />
                      {tAttestationCarac('revoirAttestation')}
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button onClick={genererAttestationCaracteristique} disabled={validerAttestationCaracteristique.isPending || genererDocumentReel.isPending || !livrableAtteint} data-testid="generer-attestation-caracteristiques-button">
                              <FileText className="mr-1.5 h-4 w-4" />
                              {tAttestationCarac('genererAttestation')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                  )}
                </div>

                <SummaryList
                  items={[
                    { label: tAttestationCarac('fields.vehicule'), value: attestationCaracteristique.immatriculation },
                    { label: tAttestationCarac('fields.minCode'), value: ministeres.find((m) => m.minCode === attestationCaracteristique.minCode)?.libelle ?? attestationCaracteristique.minCode },
                    { label: tAttestationCarac('fields.soaLibelle'), value: attestationCaracteristique.soaLibelle },
                    { label: tAttestationCarac('fields.marque'), value: marques.find((m) => m.marqueCode === attestationCaracteristique.marque)?.libelle ?? attestationCaracteristique.marque },
                    { label: tAttestationCarac('fields.genre'), value: attestationCaracteristique.genre },
                    { label: tAttestationCarac('fields.carrosserie'), value: attestationCaracteristique.carrosserie },
                    { label: tAttestationCarac('fields.type'), value: attestationCaracteristique.typeVeh },
                    { label: tAttestationCarac('fields.numeroSerie'), value: attestationCaracteristique.numeroSerieType },
                    { label: tAttestationCarac('fields.numeroMoteur'), value: attestationCaracteristique.numeroMoteur },
                    { label: tAttestationCarac('fields.nombrePlace'), value: attestationCaracteristique.nombrePlace },
                    { label: tAttestationCarac('fields.sourceEnergie'), value: attestationCaracteristique.sourceEnergie },
                    { label: tAttestationCarac('fields.puissanceAdministrative'), value: attestationCaracteristique.puissanceAdmin },
                    { label: tAttestationCarac('fields.poidsVide'), value: attestationCaracteristique.poidsVide },
                    { label: tAttestationCarac('fields.chargeUtile'), value: attestationCaracteristique.chargeUtile },
                    { label: tAttestationCarac('fields.poidsTotal'), value: attestationCaracteristique.ptac },
                    { label: tAttestationCarac('fields.anneeMiseCirculation'), value: attestationCaracteristique.anneePremiereMise },
                    { label: tAttestationCarac('fields.motifPerte'), value: attestationCaracteristique.motifPerte },
                    ...(attestationCaracteristique.observation
                      ? [{ label: tAttestationCarac('fields.observation'), value: attestationCaracteristique.observation }] : []),
                  ]}
                />

                <AttestationCaracteristiquesDialog
                  open={attestationCaracDialogOpen}
                  onOpenChange={setAttestationCaracDialogOpen}
                  attestation={attestationCaracteristique}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isExpertise && (
          <TabsContent value="expertise" className="pt-4">
            {expertise ? (
              <div className="space-y-4">
                <div className="flex justify-end">
                  {documents.some((d) => d.referenceActe === reference && d.modeleCode === 'RAPPORT_EXPERTISE') ? (
                    <Button variant="outline" onClick={() => setRapportExpertiseDialogOpen(true)} data-testid="revoir-rapport-expertise-button">
                      <FileText className="mr-1.5 h-4 w-4" />
                      {tExpertise('revoirRapport')}
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button onClick={genererRapportExpertise} disabled={validerExpertise.isPending || genererDocumentReel.isPending || !livrableAtteint} data-testid="generer-rapport-expertise-button">
                              <FileText className="mr-1.5 h-4 w-4" />
                              {tExpertise('genererRapport')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                  )}
                </div>

                <SummaryList
                  items={[
                    { label: tExpertise('fields.vehicule'), value: vehicules.find((v) => v.vehiculeId === expertise.vehiculeId)?.vehiculeImmatriculation },
                    { label: tExpertise('fields.typeExpertise'), value: tExpertise(`typeExpertiseOptions.${expertise.typeExpertise}`) },
                    { label: tExpertise('fields.dateAccident'), value: expertise.dateAccident },
                    { label: tExpertise('fields.lieuAccident'), value: expertise.lieuAccident },
                    { label: tExpertise('fields.vehiculePriveImmat'), value: expertise.vehiculePriveImmat },
                    { label: tExpertise('fields.montantEstime'), value: expertise.montantEstime?.toLocaleString('fr-FR') },
                    { label: tExpertise('fields.rapport'), value: expertise.rapport },
                  ]}
                />

                {expertiseDommages.length > 0 && (
                  <ul className="divide-y divide-border rounded-sm border border-border">
                    {expertiseDommages.map((d) => (
                      <li key={d.id} className="px-3 py-2 text-sm">{d.libelle} — {d.coutEstime.toLocaleString('fr-FR')}</li>
                    ))}
                  </ul>
                )}

                <RapportExpertiseDialog
                  open={rapportExpertiseDialogOpen}
                  onOpenChange={setRapportExpertiseDialogOpen}
                  expertise={expertise}
                  vehicule={vehicules.find((v) => v.vehiculeId === expertise.vehiculeId)}
                  dommages={expertiseDommages}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isCondamnation && (
          <TabsContent value="condamnation" className="pt-4">
            {condamnation ? (
              <div className="space-y-4">
                <div className="flex flex-wrap justify-end gap-2">
                  {documents.some((d) => d.referenceActe === reference && d.modeleCode === 'PV_CONDAMNATION') ? (
                    <Button variant="outline" onClick={() => setPvCondamnationDialogOpen(true)} data-testid="revoir-pv-condamnation-button">
                      <FileText className="mr-1.5 h-4 w-4" />
                      {tCondamnation('revoirPv')}
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button onClick={genererPvCondamnation} disabled={validerCondamnation.isPending || genererDocumentReel.isPending || !livrableAtteint} data-testid="generer-pv-condamnation-button">
                              <FileText className="mr-1.5 h-4 w-4" />
                              {tCondamnation('genererPv')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                  )}
                  {documents.some((d) => d.referenceActe === reference && d.modeleCode === 'MISE_A_PRIX') ? (
                    <Button variant="outline" onClick={() => setMisePrixDialogOpen(true)} data-testid="revoir-mise-a-prix-button">
                      <FileText className="mr-1.5 h-4 w-4" />
                      {tCondamnation('revoirMisePrix')}
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button onClick={genererMisePrix} disabled={genererDocumentReel.isPending || !livrableAtteint} data-testid="generer-mise-a-prix-button">
                              <FileText className="mr-1.5 h-4 w-4" />
                              {tCondamnation('genererMisePrix')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                  )}
                </div>

                <SummaryList
                  items={[
                    { label: tCondamnation('fields.vehicule'), value: vehicules.find((v) => v.vehiculeId === condamnation.vehiculeId)?.vehiculeImmatriculation },
                    ...(condamnation.typeMiseAPrix ? [{ label: tCondamnation('fields.typeMiseAPrix'), value: tCondamnation(`typesMisePrix.${condamnation.typeMiseAPrix}`) }] : []),
                    ...(condamnation.typeVeh ? [{ label: tCondamnation('fields.typeVeh'), value: condamnation.typeVeh }] : []),
                    ...(condamnation.etatActuel ? [{ label: tCondamnation('fields.etatActuel'), value: libelleEtat(condamnation.etatActuel) }] : []),
                    ...(condamnation.depreciationPct !== null && condamnation.depreciationPct !== undefined
                      ? [{ label: tCondamnation('fields.depreciationPct'), value: `${condamnation.depreciationPct} %` }] : []),
                    { label: tCondamnation('fields.valeurEstimee'), value: formaterMontant(condamnation.valeurEstimee) },
                    ...(condamnation.valeurEnAr !== null && condamnation.valeurEnAr !== undefined
                      ? [{ label: tCondamnation('fields.valeurEnAr'), value: formaterMontant(condamnation.valeurEnAr) }] : []),
                    ...(condamnation.miseAPrix ? [{ label: tCondamnation('fields.miseAPrix'), value: condamnation.miseAPrix.toLocaleString('fr-FR') }] : []),
                    { label: tCondamnation('fields.motifCondamnation'), value: condamnation.motifCondamnation },
                    ...(condamnation.ficheTechnique
                      ? [{ label: tCondamnation('fields.ficheTechnique'), value: condamnation.ficheTechnique }] : []),
                  ]}
                />

                {(condamnation.prix?.length ?? 0) > 0 && (
                  <GrilleMisePrixTable rangees={grilleMisePrix} prix={prixMisePrix} valeurEstimative={condamnation.valeurEstimee} />
                )}

                <PvCondamnationDialog
                  open={pvCondamnationDialogOpen}
                  onOpenChange={setPvCondamnationDialogOpen}
                  evaluation={condamnation}
                  vehicule={vehicules.find((v) => v.vehiculeId === condamnation.vehiculeId)}
                />
                <MisePrixDialog
                  open={misePrixDialogOpen}
                  onOpenChange={setMisePrixDialogOpen}
                  evaluation={condamnation}
                  vehicule={vehicules.find((v) => v.vehiculeId === condamnation.vehiculeId)}
                />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}

        {isTestChauffeur && (
          <TabsContent value="testChauffeur" className="pt-4">
            {chauffeurTest ? (
              <div className="space-y-4">
                {chauffeurTest.resultat === null ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button onClick={() => setResultatTestChauffeurChoix('APTE')} disabled={updateChauffeurTestResultat.isPending || !livrableAtteint} data-testid="resultat-apte-button">
                              <FileCheck className="mr-1.5 h-4 w-4" />
                              {tTestChauffeur('resultatFavorable')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <span className="inline-flex">
                            <Button variant="outline" onClick={() => setResultatTestChauffeurChoix('NON_APTE')} disabled={updateChauffeurTestResultat.isPending || !livrableAtteint} data-testid="resultat-non-apte-button">
                              <Ban className="mr-1.5 h-4 w-4" />
                              {tTestChauffeur('resultatDefavorable')}
                            </Button>
                          </span>
                        }
                      />
                      {!livrableAtteint && <TooltipContent side="bottom">{messageBlocage}</TooltipContent>}
                    </Tooltip>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <Badge variant={chauffeurTest.resultat === 'NON_APTE' ? 'destructive' : 'default'}>
                      {chauffeurTest.resultat === 'NON_APTE' ? tTestChauffeur('resultatDefavorable') : tTestChauffeur('resultatFavorable')}
                    </Badge>
                    <Button variant="outline" onClick={() => setResultatTestChauffeurDialogOpen(true)} data-testid="revoir-resultat-test-chauffeur-button">
                      <FileText className="mr-1.5 h-4 w-4" />
                      {tTestChauffeur('revoirResultat')}
                    </Button>
                  </div>
                )}

                <SummaryList
                  items={[
                    { label: tTestChauffeur('fields.chauffeur'), value: chauffeurs.find((c) => c.chauffeurId === chauffeurTest.chauffeurId)?.nom },
                    { label: tTestChauffeur('fields.vehicule'), value: vehicules.find((v) => v.vehiculeId === chauffeurTest.vehiculeId)?.vehiculeImmatriculation },
                    { label: tTestChauffeur('fields.dateTest'), value: chauffeurTest.dateTest },
                    { label: tTestChauffeur('fields.examinateurNom'), value: chauffeurTest.examinateurNom },
                    { label: tTestChauffeur('fields.noteTheorique'), value: chauffeurTest.noteTheorique },
                    { label: tTestChauffeur('fields.notePratique'), value: chauffeurTest.notePratique },
                    { label: tTestChauffeur('fields.observations'), value: chauffeurTest.observations },
                  ]}
                />

                <ResultatTestChauffeurDialog
                  open={resultatTestChauffeurDialogOpen}
                  onOpenChange={setResultatTestChauffeurDialogOpen}
                  chauffeurTest={chauffeurTest}
                  chauffeur={chauffeurs.find((c) => c.chauffeurId === chauffeurTest.chauffeurId)}
                  vehicule={vehicules.find((v) => v.vehiculeId === chauffeurTest.vehiculeId)}
                />

                <ConfirmDialog
                  open={resultatTestChauffeurChoix !== null}
                  onOpenChange={(open) => { if (!open) { setResultatTestChauffeurChoix(null); setObservationTestChauffeur(''); } }}
                  title={resultatTestChauffeurChoix === 'NON_APTE' ? tTestChauffeur('resultatDefavorable') : tTestChauffeur('resultatFavorable')}
                  variant={resultatTestChauffeurChoix === 'NON_APTE' ? 'destructive' : 'success'}
                  loading={updateChauffeurTestResultat.isPending}
                  onConfirm={resultatTestChauffeurChoix ? () => donnerResultatTestChauffeur(resultatTestChauffeurChoix) : undefined}
                >
                  <Textarea
                    value={observationTestChauffeur}
                    onChange={(e) => setObservationTestChauffeur(e.target.value)}
                    placeholder={tTestChauffeur('fields.observationPlaceholder')}
                    aria-label={tTestChauffeur('fields.observations')}
                  />
                </ConfirmDialog>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">—</p>
            )}
          </TabsContent>
        )}
      </Tabs>

      <ConfirmDialog
        open={Boolean(genererDocumentReel.previewUrl)}
        onOpenChange={(open) => { if (!open) genererDocumentReel.closePreview(); }}
        title="Document généré"
        size="xl"
        footer={
          <>
            <a href={genererDocumentReel.previewUrl ?? '#'} download="document.pdf">
              <Button variant="outline" type="button">
                <Download className="mr-1.5 h-4 w-4" />
                Télécharger
              </Button>
            </a>
            <Button onClick={genererDocumentReel.closePreview} data-testid="pdf-preview-close-button">
              Fermer
            </Button>
          </>
        }
      >
        {genererDocumentReel.previewUrl && (
          <iframe
            src={genererDocumentReel.previewUrl}
            title="Aperçu du document généré"
            className="h-[75vh] w-full rounded border border-border"
          />
        )}
      </ConfirmDialog>

      <ConfirmDialog
        open={deletingPieceFichierId !== null}
        onOpenChange={(open) => { if (!open) setDeletingPieceFichierId(null); }}
        title={t('pieces.supprimerFichierConfirmTitle')}
        description={t('pieces.supprimerFichierConfirmDescription')}
        destructive
        loading={supprimerPieceFichier.isPending}
        onConfirm={() => {
          if (!deletingPieceFichierId) return;
          supprimerPieceFichier.mutate(deletingPieceFichierId, {
            onSuccess: () => setDeletingPieceFichierId(null),
          });
        }}
        confirmLabel={tCommon('delete')}
      />
    </div>
  );
}

function ConstatationSectionSummary({
  sectionId, sectionCode, sectionLibelle, elements,
}: {
  sectionId: string;
  sectionCode: string;
  sectionLibelle: string;
  elements: ConstatationElement[];
}) {
  const { data: sectionElements = [] } = useElementsConstatation(sectionId);
  const t = useTranslations('processus.constatationTechnique');
  const sectionElementIds = new Set(sectionElements.map((e) => e.elementId));
  const relevant = elements.filter((e) => sectionElementIds.has(e.elementId) && (e.conforme === 'N' || e.pneuPourcentage !== undefined));
  if (relevant.length === 0) return null;

  function elementLibelle(elementId: string) {
    return sectionElements.find((e) => e.elementId === elementId)?.elementLibelle ?? elementId;
  }

  return (
    <div className="mt-3">
      <h4 className="mb-1 text-sm font-semibold text-foreground">{sectionLibelle}</h4>
      <ul className="divide-y divide-border rounded-sm border border-border">
        {relevant.map((e) => (
          <li key={e.constatationElementId} className="px-3 py-2 text-sm">
            {sectionCode === 'PNEUMATIQUE' ? (
              <span>
                {elementLibelle(e.elementId)} — {e.pneuPourcentage}%
                {e.conforme && ` — ${e.conforme === 'C' ? t('conforme') : t('nonConforme')}`}
              </span>
            ) : (
              <span>
                {elementLibelle(e.elementId)}
                {e.observation && ` — ${e.observation}`}
                {e.ordrePriorite !== undefined && ` (priorité ${e.ordrePriorite})`}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
