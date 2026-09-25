'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useElementsEvaluation, useSectionsEvaluation } from '@/hooks/useReferentiels';
import type { FicheEvaluation } from '@/lib/api/evaluationFiche';
import { formaterPourcentage, valeursElement } from '@/lib/utils/fiche-evaluation';

export interface FicheEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fiches: FicheEvaluation[];
}

/**
 * Aperçu imprimable de la fiche d'évaluation — miroir de `ReceptionNeufReports.ficheEvaluation()`
 * (PDF Jasper `FICHE_EVALUATION`) : une page par véhicule, grille Organes / Éléments / Pourcentage
 * (organe affiché sur la première ligne de sa section), cadre Observation, deux signatures.
 */
export function FicheEvaluationDialog({ open, onOpenChange, fiches }: FicheEvaluationDialogProps) {
  const tCommon = useTranslations('common');
  const { data: sections = [] } = useSectionsEvaluation();
  const { data: elements = [] } = useElementsEvaluation();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Fiche d&apos;évaluation du véhicule</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-10 overflow-y-auto text-sm leading-relaxed">
          {fiches.map((fiche, index) => (
            <div key={fiche.ficheId ?? `${fiche.immatriculation}-${index}`} className="break-after-page space-y-4">
              <p className="text-center text-base font-semibold uppercase">Evaluation du véhicule</p>
              <div className="flex justify-between font-medium">
                <span>Immatriculation : {fiche.immatriculation || '—'}</span>
                <span>Kilométrage : {fiche.kilometrage ?? ''}</span>
              </div>

              <table className="w-full border-collapse border border-border text-xs">
                <thead>
                  <tr>
                    <th className="w-[22%] border border-border py-1">Organes</th>
                    <th className="border border-border py-1">Éléments</th>
                    <th className="w-[32%] border border-border py-1">Pourcentage</th>
                  </tr>
                </thead>
                <tbody>
                  {sections.flatMap((s) =>
                    elements.filter((e) => e.sectionEvaluationId === s.sectionEvaluationId).map((e, i) => {
                      const v = valeursElement(fiche, e.elementEvaluationId);
                      return (
                        <tr key={e.elementEvaluationId}>
                          <td className="border border-border px-1 py-0.5 text-center font-medium">{i === 0 ? s.sectionLibelle : ''}</td>
                          <td className="border border-border px-1 py-0.5">{e.elementLibelle}</td>
                          <td className="border border-border px-1 py-0.5 text-center font-medium">
                            {formaterPourcentage(v.valeur1, v.valeur2, e.libelleValeur1, e.libelleValeur2)}
                          </td>
                        </tr>
                      );
                    }))}
                </tbody>
              </table>

              <div className="border border-border">
                <p className="border-b border-border py-1 text-center text-xs font-semibold uppercase">Observation</p>
                <p className="min-h-20 whitespace-pre-line px-2 py-1">{fiche.observation}</p>
              </div>

              <div className="flex justify-between pt-6 text-xs">
                <span>Le responsable ministère</span>
                <span>Le chef d&apos;équipe</span>
              </div>
            </div>
          ))}
          {fiches.length === 0 && <p className="text-muted-foreground">Aucune fiche d&apos;évaluation enregistrée.</p>}
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="fiche-evaluation-print-button" disabled={fiches.length === 0}>
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
