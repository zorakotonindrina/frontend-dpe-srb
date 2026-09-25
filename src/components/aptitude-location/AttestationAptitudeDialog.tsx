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
import type { ControleAptitude } from '@/lib/api/aptitudeLocation';
import type { Vehicule } from '@/lib/api/vehicules';

export interface AttestationAptitudeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controle: ControleAptitude;
  vehicule?: Vehicule;
}

/**
 * Livrable "Attestation d'aptitude" — texte fidèle à l'imprimé officiel
 * (D:\ASA\Siigpe\utils\IMPRIMES DIGITALISATION 2026.xlsx, onglet "attestation d'aptitude").
 * Même gabarit que `VisaArretageLivretDialog` (impression navigateur, pas de PDF généré).
 */
export function AttestationAptitudeDialog({
  open, onOpenChange, controle, vehicule,
}: AttestationAptitudeDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.aptitudeLocation');
  const signataireBudget = useSignataireBudget();

  const today = dateCompleteEnLettres(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('attestationTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
          {/* Vide à dessein — numéro apposé à la main après signature, même principe que le PDF
              Jasper (DemoReportBuilder.buildAttestationAptitude). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="text-center font-semibold uppercase">{t('attestationTitle')}</p>

          <p>
            {signataireBudget} soussigné, atteste par la présente que le
            véhicule cité ci-dessous a été contrôlé techniquement et jugé apte à assurer {controle.objetMission},
            du {controle.dateDebut} au {controle.dateFin}
            {controle.itineraire && <> selon l&rsquo;itinéraire {controle.itineraire}</>}.
          </p>

          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1">{t('fields.immatriculation')}</th>
                <th className="py-1">{t('fields.type')}</th>
                <th className="py-1">{t('fields.marque')}</th>
                <th className="py-1">{t('fields.itineraire')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1">{vehicule?.vehiculeImmatriculation ?? '—'}</td>
                <td className="py-1">{vehicule?.genreCode ?? '—'}</td>
                <td className="py-1">{vehicule?.marqueCode ?? '—'}</td>
                <td className="py-1">{controle.itineraire || '—'}</td>
              </tr>
            </tbody>
          </table>

          <p>En foi de quoi, la présente Attestation est délivrée pour servir et valoir ce que de droit.</p>

          <p className="text-right">Antananarivo le, {today}</p>

          <div className="mt-8 grid grid-cols-2 gap-6 pt-4 text-center text-xs font-medium uppercase">
            <p>L&rsquo;Expert Administratif</p>
            <p>{signataireBudget}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="attestation-aptitude-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
