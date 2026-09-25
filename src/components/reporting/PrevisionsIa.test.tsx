import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import type { AnomalieCarburant, ModeleIa, PrevisionStructure, PrevisionVehicule } from '@/lib/api/reportingIa';
import { PrevisionsIa } from './PrevisionsIa';

vi.mock('@/components/charts/BarChart', () => ({
  BarChart: ({ title, data }: { title: string; data: unknown[] }) => <div data-testid="bar-chart">{title} ({data.length})</div>,
}));

const structure = (soaCode: string, soaLibelle: string, depensePrevue: number, reel: number): PrevisionStructure => ({
  id: soaCode, soaCode, soaLibelle, anneeCible: 2027, nbVehicules: 5, depensePrevue,
  borneBasse: depensePrevue * 0.8, borneHaute: depensePrevue * 1.3, detail: { carburant: depensePrevue * 0.7, reel_annee_precedente: reel },
});
const vehicule = (immat: string, soaLibelle: string, proba: number): PrevisionVehicule => ({
  id: immat, vehiculeId: immat, vehiculeImmatriculation: immat, marque: 'TOYOTA', categorieVehicule: 'SERVICE',
  soaDepositaire: soaLibelle, soaLibelle, anneeCible: 2027, depensePrevue: 10_000_000, borneBasse: 8_000_000, borneHaute: 13_000_000,
  detail: { reel_annee_precedente: 9_500_000 }, probaGrosseReparation: proba,
});
const anomalie = (id: string, statut: AnomalieCarburant['statut']): AnomalieCarburant => ({
  id, vehiculeId: 'v1', vehiculeImmatriculation: `IMM-${id}`, soaLibelle: 'SSD Ambohidratrimo', mois: '2026-03-01', litres: 250, km: 900,
  consommation100km: 27.8, score: 0.7, motif: '27.8 L/100 km ce mois, soit 2.3 fois la consommation habituelle', statut,
});
const modeles: ModeleIa[] = [
  {
    modeleId: '1', code: 'DEPENSE_VEHICULE', version: '3', algorithme: 'Référence : dépense N+1 = dépense N', dateEntrainement: '2026-09-24 10:00',
    periodeDonnees: '2025 → 2026', nbExemples: 100, commentaire: null,
    metriques: {
      ml_bat_reference: false, meilleur_modele_appris: 'Hybride — Ridge',
      comparaison: { 'Hybride — Ridge': { mae: 3_178_225, ref_mae: 3_050_444 } },
      backtest_structures: { mape_structures: 0.097, ref_mape_structures: 0.097 },
    },
  },
  {
    modeleId: '2', code: 'ANOMALIE_CARBURANT', version: '2', algorithme: 'IsolationForest (300 arbres)', dateEntrainement: '2026-09-24 10:05',
    periodeDonnees: '01/2025 → 12/2026', nbExemples: 2397, commentaire: null,
    metriques: {
      isolation_forest: { f1: 0.835 }, regle_simple: { f1: 0.844 },
      par_type: { KM_GONFLES: { rappel_isolation_forest: 0.565, rappel_regle: 0 } },
    },
  },
];

const suivreMutate = vi.fn();
const exporterMutate = vi.fn();
let anomalies: AnomalieCarburant[] = [];
let structures: PrevisionStructure[] = [];
vi.mock('@/hooks/useReportingIa', () => ({
  usePrevisionStructures: () => ({ data: structures, isLoading: false }),
  usePrevisionVehicules: () => ({
    data: structures.length ? [vehicule('1234 TBA', 'SSD Ambohidratrimo', 0.72), vehicule('5678 TBB', 'CHU Befelatanana', 0.2)] : [],
    isLoading: false,
  }),
  useAnomaliesCarburant: () => ({ data: anomalies, isLoading: false }),
  useDelaisPrevus: () => ({
    data: [{ processusCode: 'VA_CONDAMN', nbDossiersOuverts: 10, delaiPrevuMoyen: 20, borneBasseMoyenne: 8, borneHauteMoyenne: 45, ageMoyenJours: 30, nbEnRetard: 2 }],
    isLoading: false,
  }),
  useModelesIa: () => ({ data: modeles }),
  useSuivreAnomalie: () => ({ mutate: suivreMutate, isPending: false }),
  useExporterPrevisionBudgetaire: () => ({ mutate: exporterMutate, isPending: false }),
}));

describe('PrevisionsIa', () => {
  beforeEach(() => {
    suivreMutate.mockReset();
    exporterMutate.mockReset();
    structures = [structure('00-71-1-000-00001', 'SSD Ambohidratrimo', 60_000_000, 58_000_000), structure('00-51-1-000-00002', 'CHU Befelatanana', 40_000_000, 42_000_000)];
    anomalies = [anomalie('a1', 'NOUVELLE'), anomalie('a2', 'JUSTIFIEE')];
  });

  it('affiche le budget prévu de la dernière année cible, les véhicules à risque et les anomalies à vérifier', () => {
    renderWithProviders(<PrevisionsIa />);
    expect(screen.getByText('Budget prévu 2027')).toBeInTheDocument();
    expect(screen.getByText('100 M Ar')).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
    expect(screen.getByText('Budget prévu 2027 par STRUCTURE (2)')).toBeInTheDocument();
    expect(screen.getByText('1234 TBA')).toBeInTheDocument();
    expect(screen.getByText('72 %')).toBeInTheDocument();
    expect(screen.getByTestId('reporting-ia-avertissement')).toHaveTextContent('jeu de données construit');
  });

  it('permet de marquer une anomalie nouvelle comme vérifiée, pas une anomalie déjà traitée', async () => {
    renderWithProviders(<PrevisionsIa />);
    await userEvent.setup().click(screen.getByTestId('anomalie-verifiee-a1'));
    expect(suivreMutate).toHaveBeenCalledWith({ id: 'a1', statut: 'VERIFIEE' });
    expect(screen.queryByTestId('anomalie-verifiee-a2')).not.toBeInTheDocument();
  });

  it('présente honnêtement la qualité des modèles face à la référence', () => {
    renderWithProviders(<PrevisionsIa />);
    const depense = within(screen.getByTestId('qualite-DEPENSE_VEHICULE'));
    expect(depense.getByText('Ne bat pas la référence')).toBeInTheDocument();
    expect(depense.getByText('Données construites')).toBeInTheDocument();
    const anomaliesCarte = within(screen.getByTestId('qualite-ANOMALIE_CARBURANT'));
    expect(anomaliesCarte.getByText('Rappel « km gonflés »')).toBeInTheDocument();
    expect(anomaliesCarte.getByText('56,5 %')).toBeInTheDocument();
  });

  it('exporte la prévision budgétaire de l’année affichée', async () => {
    renderWithProviders(<PrevisionsIa />);
    await userEvent.setup().click(screen.getByTestId('reporting-ia-export'));
    expect(exporterMutate).toHaveBeenCalledWith(2027);
  });

  it('indique comment produire les prévisions quand aucun modèle n’a tourné', () => {
    structures = [];
    renderWithProviders(<PrevisionsIa />);
    expect(screen.getByTestId('reporting-ia-vide')).toHaveTextContent('entrainer_tout.py');
    expect(screen.getByTestId('reporting-ia-export')).toBeDisabled();
  });
});
