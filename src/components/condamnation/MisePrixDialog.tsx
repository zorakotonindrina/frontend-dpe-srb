'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import { useElementsMisePrix, useMarques, useSectionsMisePrix, useSoas } from '@/hooks/useReferentiels';
import { appartenanceMisePrix, etatVehicule, titreMisePrix } from '@/lib/utils/evaluation-texte';
import { construireGrille, type PrixParElement } from '@/lib/utils/mise-prix';
import { GrilleMisePrixTable } from '@/components/condamnation/GrilleMisePrixTable';
import type { EvaluationCondamnation } from '@/lib/api/condamnation';
import type { Vehicule } from '@/lib/api/vehicules';

export interface MisePrixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: EvaluationCondamnation;
  vehicule?: Vehicule;
}

/**
 * Aperçu du document « MISE A PRIX D'UN VEHICULE / D'UNE MOTOCYCLETTE A EVALUER » — miroir de
 * `EvaluationReports.misePrix` (PDF Jasper `MISE_A_PRIX`) : titre, structure, état, tableau d'identité
 * (mise à prix « - »), grille de prix par composant (référentiel de la catégorie), valeur estimative et
 * signatures. Textes portés de `EvaluationTexte`.
 */
export function MisePrixDialog({ open, onOpenChange, evaluation, vehicule }: MisePrixDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.condamnation');
  const categorie = evaluation.typeMiseAPrix ?? 'VEHICULE';
  const { data: sections = [] } = useSectionsMisePrix(categorie);
  const { data: elements = [] } = useElementsMisePrix();
  const { data: soas = [] } = useSoas(evaluation.soaCode ?? '');
  const { data: marques = [] } = useMarques();

  const rangees = useMemo(() => construireGrille(sections, elements), [sections, elements]);
  const prix = useMemo<PrixParElement>(
    () => Object.fromEntries((evaluation.prix ?? []).map((p) => [p.elementId, p.prix])),
    [evaluation.prix],
  );
  const structure = soas.find((s) => s.soaCode === evaluation.soaCode)?.libelle;
  const marque = vehicule?.marqueLibelle ?? marques.find((m) => m.marqueCode === vehicule?.marqueCode)?.libelle ?? '';
  const cell = 'border border-black p-1';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('misePrixTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
          {/* En-tête laissé vide (pas de bloc ministère) : espace réservé, comme le PDF. */}
          <div className="h-32" aria-hidden />
          {/* Vide à dessein — numéro apposé à la main après signature, comme le PDF Jasper. */}
          <p className="font-serif text-xs">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="text-center font-serif text-base font-bold underline">{titreMisePrix(categorie)}</p>
          <p className="text-center font-serif font-bold">{appartenanceMisePrix(structure)}</p>
          <p className="font-serif font-bold">{etatVehicule(evaluation.etatActuel)}</p>

          <table className="w-full table-fixed border-collapse text-center text-[10px]">
            <thead>
              <tr className="font-bold">
                <th className={cell}>IMMATRICULATION</th><th className={cell}>MARQUE</th><th className={cell}>TYPE</th>
                <th className={cell}>N° serie</th><th className={cell}>MISE A PRIX (AR)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={cell}>{vehicule?.vehiculeImmatriculation}</td>
                <td className={cell}>{marque}</td>
                <td className={cell}>{evaluation.typeVeh}</td>
                <td className={cell}>{vehicule?.vin}</td>
                <td className={cell}>-</td>
              </tr>
            </tbody>
          </table>

          <GrilleMisePrixTable rangees={rangees} prix={prix} valeurEstimative={evaluation.valeurEstimee} />

          <p className="ml-[50%] text-center font-serif">Antananarivo,le</p>
          <div className="grid grid-cols-2 gap-6 text-center font-serif text-xs font-bold">
            <p>Le Responsable</p>
            <p>le Technicien du Garage Administratif</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="mise-a-prix-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
