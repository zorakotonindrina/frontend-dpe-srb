'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import { useSignataireBudget } from '@/hooks/useReferentiels';
import type { VisaBonCommande, VisaBcPiece } from '@/lib/api/visaBc';
import type { Vehicule } from '@/lib/api/vehicules';

export interface BonCommandeViseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visaBc: VisaBonCommande;
  vehicule?: Vehicule;
  pieces: VisaBcPiece[];
}

export function BonCommandeViseDialog({ open, onOpenChange, visaBc, vehicule, pieces }: BonCommandeViseDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.visaBonCommande');
  const signataireBudget = useSignataireBudget();

  const montantTotal = pieces.reduce((sum, p) => sum + p.prixUnitaire * p.quantite, 0);

  const mention = visaBc.decision === 'REFUS'
    ? { label: 'REFUSÉ', className: 'text-destructive' }
    : visaBc.grandsTravaux
      ? { label: 'VISÉ SOUS RÉSERVE DE RÉCEPTION TECHNIQUE', className: 'text-[color:var(--color-warning)]' }
      : { label: 'VISÉ', className: 'text-[color:var(--color-success)]' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('bcTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
          {/* Vide à dessein — le numéro de BC visé est apposé à la main après signature, même
              principe que le PDF Jasper (DemoReportBuilder.buildBonCommande). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <div className="text-center">
            <p className="font-semibold uppercase">{t('bcTitle')}</p>
          </div>

          <p>
            Commande adressée à <span className="font-medium">{visaBc.fournisseur}</span>
            {' '}(NIF : {visaBc.nif}, STAT : {visaBc.stat}), en date du {visaBc.dateBc}.
          </p>
          {visaBc.adresseFournisseur && <p>Adresse : {visaBc.adresseFournisseur}</p>}
          <p>Véhicule concerné : {vehicule?.vehiculeImmatriculation ?? '—'}</p>

          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1">Désignation des prestations</th>
                <th className="py-1 text-right">{t('fields.quantite')}</th>
                <th className="py-1 text-right">{t('fields.prixUnitaire')}</th>
                <th className="py-1 text-right">{t('fields.montant')}</th>
              </tr>
            </thead>
            <tbody>
              {pieces.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="py-1">{p.designation}</td>
                  <td className="py-1 text-right">{p.quantite}</td>
                  <td className="py-1 text-right">{p.prixUnitaire.toLocaleString('fr-FR')}</td>
                  <td className="py-1 text-right">{(p.quantite * p.prixUnitaire).toLocaleString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-right font-semibold">
            {t('fields.montant')} : {montantTotal.toLocaleString('fr-FR')}
          </p>

          <p className="text-xs text-muted-foreground">
            NOTA : la commande et la facture (3 exemplaires) correspondant à la fourniture doivent
            être adressées à la DRFP Analamanga.
          </p>

          <div className="mt-6 space-y-1 text-center">
            <p className={`text-base font-bold uppercase ${mention.className}`}>{mention.label}</p>
            {visaBc.decision === 'REFUS' ? (
              <p className="text-sm">{t('motifRefusLabel')} : {visaBc.motifRefus}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                {visaBc.numeroVisa} — {visaBc.dateVisa}
              </p>
            )}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-6 pt-4 text-center text-xs font-medium uppercase">
            <p>Le Fournisseur</p>
            <p>{signataireBudget}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="bon-commande-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
