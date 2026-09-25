'use client';

import { useState } from 'react';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FicheEvaluationVehicule } from '@/components/evaluation/FicheEvaluationVehicule';
import { FicheEvaluationDialog } from '@/components/evaluation/FicheEvaluationDialog';
import { useFichesEvaluation, useSaveFichesEvaluation } from '@/hooks/useEvaluationFiche';
import type { FicheEvaluation } from '@/lib/api/evaluationFiche';
import { ficheVide } from '@/lib/utils/fiche-evaluation';

export interface FicheEvaluationSectionProps {
  referenceActe: string;
  /** Véhicules connus du dossier — pré-remplissent les fiches à créer. */
  vehiculesParDefaut?: { immatriculation: string; vehiculeId?: string | null; kilometrage?: number | null }[];
  livrableAtteint: boolean;
  /** Consultation seule (dossier ouvert depuis « Liste des dossiers ») : pas de saisie/modification de la fiche. */
  lectureSeule?: boolean;
  onGenerer: () => void;
  generationEnCours: boolean;
}

/**
 * Section « Fiche d'évaluation » des onglets de dossier (Réception neuve, Réception technique,
 * Évaluation/Condamnation) : consultation, (re)saisie, aperçu imprimable et génération du PDF
 * officiel `FICHE_EVALUATION`. Sert aussi de rattrapage si l'enregistrement en fin de wizard a échoué.
 */
export function FicheEvaluationSection({
  referenceActe, vehiculesParDefaut = [], livrableAtteint, lectureSeule = false, onGenerer, generationEnCours,
}: FicheEvaluationSectionProps) {
  const { data: fiches = [] } = useFichesEvaluation(referenceActe);
  const save = useSaveFichesEvaluation();
  const [edition, setEdition] = useState<FicheEvaluation[] | null>(null);
  const [apercuOuvert, setApercuOuvert] = useState(false);

  function demarrerEdition() {
    if (fiches.length > 0) return setEdition(fiches);
    const initiales = vehiculesParDefaut.length > 0
      ? vehiculesParDefaut.map((v) => ({ ...ficheVide(v.immatriculation, v.kilometrage ?? null), vehiculeId: v.vehiculeId ?? null }))
      : [ficheVide()];
    setEdition(initiales);
  }

  async function enregistrer() {
    if (!edition) return;
    try {
      await save.mutateAsync({ referenceActe, fiches: edition });
      toast.success("Fiche d'évaluation enregistrée");
      setEdition(null);
    } catch {
      toast.error("Échec de l'enregistrement de la fiche d'évaluation");
    }
  }

  if (edition) {
    return (
      <div className="space-y-4 rounded-sm border border-border p-3" data-testid="fiche-evaluation-edition">
        {edition.map((fiche, index) => (
          <div key={fiche.ficheId ?? index} className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Véhicule {index + 1}</p>
              {edition.length > 1 && (
                <Button type="button" variant="ghost" size="icon" onClick={() => setEdition(edition.filter((_, i) => i !== index))}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <FicheEvaluationVehicule
              value={fiche} testIdPrefix={`fiche-evaluation-${index}`}
              onChange={(f) => setEdition(edition.map((x, i) => (i === index ? f : x)))}
            />
          </div>
        ))}
        <div className="flex flex-wrap justify-between gap-2">
          <Button type="button" variant="outline" onClick={() => setEdition([...edition, ficheVide()])}>
            <Plus className="mr-1.5 h-4 w-4" />
            Ajouter un véhicule
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setEdition(null)}>Annuler</Button>
            <Button type="button" onClick={enregistrer} disabled={save.isPending} data-testid="fiche-evaluation-save-button">Enregistrer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-sm border border-border p-3" data-testid="fiche-evaluation-section">
      <div className="flex items-center gap-2 text-sm">
        <ClipboardList className="h-4 w-4 text-muted-foreground" />
        <span>
          Fiche d&apos;évaluation :{' '}
          {fiches.length === 0 ? 'non renseignée' : `${fiches.length} véhicule${fiches.length > 1 ? 's' : ''} évalué${fiches.length > 1 ? 's' : ''}`}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {!lectureSeule && (
          <Button type="button" variant="outline" onClick={demarrerEdition} data-testid="fiche-evaluation-edit-button">
            {fiches.length === 0 ? 'Saisir la fiche' : 'Modifier la fiche'}
          </Button>
        )}
        <Button type="button" variant="outline" onClick={() => setApercuOuvert(true)} disabled={fiches.length === 0}>
          Aperçu
        </Button>
        <Button
          type="button" onClick={onGenerer}
          disabled={fiches.length === 0 || !livrableAtteint || generationEnCours}
          data-testid="generer-fiche-evaluation-button"
        >
          Générer la fiche
        </Button>
      </div>
      <FicheEvaluationDialog open={apercuOuvert} onOpenChange={setApercuOuvert} fiches={fiches} />
    </div>
  );
}
