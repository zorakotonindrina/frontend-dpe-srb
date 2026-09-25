'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import { useMarques, useMinisteres, useSignataireBudget, useSoas } from '@/hooks/useReferentiels';
import { introTransfert, membresPuces } from '@/lib/utils/reception-neuf-texte';
import {
  arretePv, conclusionPv, formaterMontant, libelleEtat, titrePv,
} from '@/lib/utils/evaluation-texte';
import type { EvaluationCondamnation } from '@/lib/api/condamnation';
import type { Vehicule } from '@/lib/api/vehicules';

export interface PvCondamnationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluation: EvaluationCondamnation;
  vehicule?: Vehicule;
}

/**
 * Aperçu du « PV d'évaluation de matériels roulants » — miroir de `EvaluationReports` (PDF Jasper
 * `PV_CONDAMNATION`, 2 pages) : page 1 = bloc ministère, titre, phrase d'ouverture notariée, membres de la
 * commission, conclusion ; page 2 = tableau N° / IMM / MARQUE / TYPE / N° DE SERIE / ETAT ACTUEL /
 * DEPRECIATION / VALEUR EN AR, total, arrêté en lettres et signatures. Textes portés de `EvaluationTexte`.
 * Un dossier antérieur (sans date de PV) garde l'ancien aperçu simplifié côté PDF ; ici l'aperçu affiche
 * ce qui est renseigné.
 */
export function PvCondamnationDialog({
  open, onOpenChange, evaluation, vehicule,
}: PvCondamnationDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.condamnation');
  const signataireBudget = useSignataireBudget();
  const { data: soas = [] } = useSoas(evaluation.soaCode ?? '');
  const { data: ministeres = [] } = useMinisteres();
  const { data: marques = [] } = useMarques();

  const structure = soas.find((s) => s.soaCode === evaluation.soaCode)?.libelle;
  const ministere = ministeres.find((m) => m.minCode === evaluation.ministereCode)?.libelle;
  const marque = vehicule?.marqueLibelle ?? marques.find((m) => m.marqueCode === vehicule?.marqueCode)?.libelle ?? '';
  const valeurEnAr = evaluation.valeurEnAr ?? 0;
  const membres = membresPuces(evaluation.commissionMembresEntite).concat(membresPuces(evaluation.commissionMembresDpe));
  const cell = 'border border-border p-1';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{t('pvTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-6 overflow-y-auto text-sm leading-relaxed">
          {/* Page 1 — miroir de ReceptionNeufReports.transfertPage1() (sans le bloc ministère) */}
          <div className="space-y-4 font-serif">
            {/* En-tête laissé vide (pas de bloc ministère) : espace réservé, comme le PDF. */}
            <div className="h-32" aria-hidden />
            {/* Vide à dessein — numéro apposé à la main après signature, comme le PDF Jasper. */}
            <p className="text-xs">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>
            <p className="text-center font-bold underline">{titrePv(structure)}</p>
            <p className="indent-8 text-justify leading-relaxed">{introTransfert(evaluation.datePv ?? '', evaluation.heurePv ?? '')}</p>
            <ul className="space-y-2">
              {membres.map((m, i) => (
                <li key={i} className="grid grid-cols-[1.25rem_1fr] pl-7 text-justify leading-relaxed">
                  <span>-</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
            <p className="indent-8 text-justify">{conclusionPv(1, structure, ministere)}</p>
            <p>L&apos;évaluation est présentée comme suit :</p>
          </div>

          {/* Page 2 — miroir de EvaluationReports.pvEvaluationPage2() */}
          <div className="space-y-4">
            <table className="w-full border-collapse text-center text-[10px]">
              <thead>
                <tr className="font-bold">
                  <th className={cell}>N°</th><th className={cell}>N° IMM</th><th className={cell}>MARQUE</th>
                  <th className={cell}>TYPE</th><th className={cell}>N° DE SERIE</th><th className={cell}>ETAT ACTUEL</th>
                  <th className={cell}>DEPRECIATION</th><th className={cell}>VALEUR EN AR</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={cell}>01</td>
                  <td className={cell}>{vehicule?.vehiculeImmatriculation}</td>
                  <td className={cell}>{marque}</td>
                  <td className={cell}>{evaluation.typeVeh}</td>
                  <td className={cell}>{vehicule?.vin}</td>
                  <td className={cell}>{libelleEtat(evaluation.etatActuel)}</td>
                  <td className={cell}>{evaluation.depreciationPct !== null && evaluation.depreciationPct !== undefined ? `${evaluation.depreciationPct} %` : ''}</td>
                  <td className={`${cell} font-semibold`}>{formaterMontant(evaluation.valeurEnAr)}</td>
                </tr>
                <tr className="font-bold">
                  <td className={cell} colSpan={7}>TOTAL</td>
                  <td className={cell}>{formaterMontant(evaluation.valeurEnAr)}</td>
                </tr>
              </tbody>
            </table>

            <p className="font-semibold">{arretePv(1, valeurEnAr)}</p>
            <p className="ml-[50%] text-center">Antananarivo, le</p>
            <p className="text-center font-semibold">Les membres de la commission</p>

            <div className="mt-6 grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
              <p>Président</p><p>Membre</p><p>Membre</p><p>Dépositaire Comptable</p>
            </div>
            <div className="mt-10 grid grid-cols-4 gap-2 text-center text-[10px] font-semibold">
              <p>L&apos;Expert</p>
              <p>Le Chef de Bureau du Suivi et Contrôle des véhicules Administratifs</p>
              <p>Le Chef de Division Régionale du Patrimoine de l&apos;Etat Analamanga</p>
              <p>{signataireBudget}</p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="pv-condamnation-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
