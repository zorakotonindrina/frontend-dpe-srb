'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import { dateCompleteEnLettres } from '@/lib/utils/nombre-en-lettres';
import { useSignataireBudget } from '@/hooks/useReferentiels';
import type { ExpertiseAccident, ExpertiseDommage } from '@/lib/api/expertise';
import type { Vehicule } from '@/lib/api/vehicules';

export interface RapportExpertiseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expertise: ExpertiseAccident;
  vehicule?: Vehicule;
  dommages: ExpertiseDommage[];
}

/**
 * Livrable "Rapport d'expertise / contre-expertise" — AUCUN imprimé officiel n'existe pour ce
 * processus (ni dans IMPRIMES DIGITALISATION 2026.xlsx, ni dans le Word compagnon ; confirmé avec
 * l'utilisateur). Mise en forme conçue à partir des données déjà modélisées
 * (bscva.expertise_accident/expertise_dommage), sur le même gabarit visuel que les autres livrables
 * (`AttestationCaracteristiquesDialog.tsx`) pour rester cohérente avec le reste de l'application.
 */
export function RapportExpertiseDialog({
  open, onOpenChange, expertise, vehicule, dommages,
}: RapportExpertiseDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.expertise');
  const signataireBudget = useSignataireBudget();

  const today = dateCompleteEnLettres(new Date());
  const isContreExpertise = expertise.typeExpertise === 'CONTRE_EXP';
  const title = isContreExpertise ? t('rapportContreExpertiseTitle') : t('rapportTitle');
  const totalDommages = dommages.reduce((sum, d) => sum + (d.coutEstime || 0), 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
          {/* Vide à dessein — numéro apposé à la main après signature, même principe que le PDF
              Jasper (DemoReportBuilder.buildRapportExpertise). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="text-center font-semibold uppercase">{title}</p>

          <p>
            L&rsquo;expert administratif soussigné s&rsquo;est rendu le {expertise.dateAccident} à {expertise.lieuAccident}
            {' '}afin de constater les circonstances et dommages relatifs au véhicule administratif
            immatriculé {vehicule?.vehiculeImmatriculation ?? '—'}
            {isContreExpertise && expertise.vehiculePriveImmat && (
              <>, en présence du véhicule tiers immatriculé {expertise.vehiculePriveImmat}</>
            )}.
          </p>

          {expertise.rapport && (
            <p className="whitespace-pre-line">{expertise.rapport}</p>
          )}

          {dommages.length > 0 && (
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-1">{t('dommagesTitle')}</th>
                  <th className="py-1 text-right">{t('fields.montantEstime')}</th>
                </tr>
              </thead>
              <tbody>
                {dommages.map((d) => (
                  <tr key={d.id} className="border-b border-border/50">
                    <td className="py-1">{d.libelle}</td>
                    <td className="py-1 text-right">{d.coutEstime.toLocaleString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <p className="text-right font-semibold">
            {t('fields.montantEstime')} : {(expertise.montantEstime || totalDommages).toLocaleString('fr-FR')}
          </p>

          <p>En foi de quoi, le présent rapport est délivré pour servir et valoir ce que de droit.</p>

          <p className="text-right">Antananarivo le, {today}</p>

          <div className="mt-8 grid grid-cols-2 gap-6 pt-4 text-center text-xs font-medium uppercase">
            <p>L&rsquo;Expert Administratif</p>
            <p>{signataireBudget}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="rapport-expertise-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
