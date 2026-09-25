import {
  ClipboardList, FileSearch, FileCheck2, PackageCheck, PackagePlus,
  NotebookPen, KeyRound, FileBadge, ShieldAlert, Gavel, UserCheck,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';

/**
 * Fait correspondre chaque `processusCode` (workflow.wf_processus, conception_finale_complete.md §6)
 * à la clé de traduction déjà existante dans le namespace `nav` (messages/*.json), pour éviter de
 * dupliquer les libellés des 11 processus métier.
 */
export const PROCESSUS_CODE_NAV_LABEL_KEYS: Record<string, string> = {
  VA_RECENS: 'recensement',
  VA_CONSTAT: 'constatationTechnique',
  VA_VISA_BC: 'visaBonCommande',
  VA_RECEPT: 'receptionTechnique',
  VA_RECEPT_NEUF: 'receptionVaNeuf',
  VA_ARRET_LIV: 'arretageLivret',
  VA_LOCATION: 'aptitudeLocation',
  VA_ATT_CARAC: 'attestationCaracteristiques',
  VA_EXPERTISE: 'expertise',
  VA_CONDAMN: 'condamnation',
  VA_TEST_CHAUF: 'testChauffeur',
};

/** Fait correspondre chaque `processusCode` à la route de création du processus correspondant. */
export const PROCESSUS_CODE_NEW_ROUTES: Record<string, string> = {
  VA_RECENS: ROUTES.PROCESSUS_RECENSEMENT_NEW,
  VA_CONSTAT: ROUTES.PROCESSUS_CONSTATATION_NEW,
  VA_VISA_BC: ROUTES.PROCESSUS_VISA_BC_NEW,
  VA_RECEPT: ROUTES.PROCESSUS_RECEPTION_TECHNIQUE_NEW,
  VA_RECEPT_NEUF: ROUTES.PROCESSUS_RECEPTION_NEUF_NEW,
  VA_ARRET_LIV: ROUTES.PROCESSUS_ARRETAGE_LIVRET_NEW,
  VA_LOCATION: ROUTES.PROCESSUS_APTITUDE_LOCATION_NEW,
  VA_ATT_CARAC: ROUTES.PROCESSUS_ATTESTATION_CARAC_NEW,
  VA_EXPERTISE: ROUTES.PROCESSUS_EXPERTISE_NEW,
  VA_CONDAMN: ROUTES.PROCESSUS_CONDAMNATION_NEW,
  VA_TEST_CHAUF: ROUTES.PROCESSUS_TEST_CHAUFFEUR_NEW,
};

/** Icône illustrative par `processusCode`, utilisée par le hub de création du dashboard. */
export const PROCESSUS_CODE_ICONS: Record<string, LucideIcon> = {
  VA_RECENS: ClipboardList,
  VA_CONSTAT: FileSearch,
  VA_VISA_BC: FileCheck2,
  VA_RECEPT: PackageCheck,
  VA_RECEPT_NEUF: PackagePlus,
  VA_ARRET_LIV: NotebookPen,
  VA_LOCATION: KeyRound,
  VA_ATT_CARAC: FileBadge,
  VA_EXPERTISE: ShieldAlert,
  VA_CONDAMN: Gavel,
  VA_TEST_CHAUF: UserCheck,
};
