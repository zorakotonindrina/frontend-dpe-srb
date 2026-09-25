'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import { dateCompleteEnLettres } from '@/lib/utils/nombre-en-lettres';
import type { ControleAptitude } from '@/lib/api/aptitudeLocation';
import type { Vehicule } from '@/lib/api/vehicules';

export interface AutorisationLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  controle: ControleAptitude;
  vehicule?: Vehicule;
}

/**
 * Livrable "Autorisation de location" — texte fidèle à l'imprimé officiel
 * (D:\ASA\Siigpe\utils\IMPRIMES DIGITALISATION 2026.xlsx, onglet "autorisation Location").
 * N'est généré que si `controle.avisAptitude === 'APTE'` (règle de chaînage, voir appelant).
 */
export function AutorisationLocationDialog({
  open, onOpenChange, controle, vehicule,
}: AutorisationLocationDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.aptitudeLocation');

  const today = dateCompleteEnLettres(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('autorisationTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
          {/* Vide à dessein — numéro apposé à la main après signature, même principe que le PDF
              Jasper (DemoReportBuilder.buildAutorisationLocation). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="text-center font-semibold uppercase">{t('autorisationTitle')}</p>

          <p>
            Au vu de l&rsquo;attestation de contrôle d&rsquo;aptitude et de conformité délivrée par la Division
            Régionale du Patrimoine de l&rsquo;État Analamanga, Bureau du Suivi et de Contrôle des Véhicules
            Administratifs, il est autorisé le recours à la location de la voiture privée ci-après :
          </p>

          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="py-1">N°</th>
                <th className="py-1">{t('fields.immatriculation')}</th>
                <th className="py-1">{t('fields.marque')}</th>
                <th className="py-1">{t('fields.type')}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="py-1">1</td>
                <td className="py-1">{vehicule?.vehiculeImmatriculation ?? '—'}</td>
                <td className="py-1">{vehicule?.marqueCode ?? '—'}</td>
                <td className="py-1">{vehicule?.genreCode ?? '—'}</td>
              </tr>
            </tbody>
          </table>

          <p>
            pour assurer {controle.objetMission}, du {controle.dateDebut} au {controle.dateFin}.
          </p>

          <p className="text-right">Fait à Antananarivo, le {today}</p>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="autorisation-location-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
