'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import { nombreEnLettres } from '@/lib/utils/nombre-en-lettres';
import { useSignataireBudget } from '@/hooks/useReferentiels';
import type { Recensement, RecensementLigne } from '@/lib/api/recensement';
import type { Vehicule } from '@/lib/api/vehicules';
import type { Ministere, MarqueVehicule, Soa } from '@/lib/fixtures/referentiels.fixtures';

export interface QuitusRecensementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recensement: Recensement;
  lignes: RecensementLigne[];
  vehicules: Vehicule[];
  ministeres: Ministere[];
  marques: MarqueVehicule[];
  soas: Soa[];
}

/**
 * Livrable "Quitus de recensement" — aperçu HTML imprimable, distinct du PDF Jasper réel
 * (api-financiere DemoReportBuilder.buildQuitusRecensement) mais tenu volontairement synchronisé
 * avec lui : numéro et date retirés (apposés à la main après signature papier — voir
 * wf_dossier.reference_sortie/date_sortie, capturés à la clôture ARCHIVAGE), SOA affiché en
 * libellé (résolu via `soas`, porté par la première ligne — un dossier n'a en pratique qu'un SOA)
 * et catégorie de recensement (niveauLibelle) ajoutée à la phrase d'intro.
 */
export function QuitusRecensementDialog({
  open, onOpenChange, recensement, lignes, vehicules, ministeres, marques, soas,
}: QuitusRecensementDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.recensement');
  const signataireBudget = useSignataireBudget();

  const annee = recensement.dateSaisie ? new Date(recensement.dateSaisie).getFullYear() : new Date().getFullYear();
  const nombre = lignes.length;
  const ministereLibelle = ministeres.find((m) => m.minCode === recensement.minCode)?.libelle ?? recensement.minCode;
  const soaLibelle = soas.find((s) => s.soaCode === lignes[0]?.soaCode)?.libelle ?? lignes[0]?.soaCode ?? '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('quitusTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto pt-6 text-sm leading-relaxed">
          {/* Vide à dessein — apposé à la main après signature (voir wf_dossier.reference_sortie),
              même principe que le PDF Jasper (DemoReportBuilder.buildTitleBand). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="pt-4 text-center font-semibold uppercase">{t('quitusTitle')}</p>

          <p>
            {signataireBudget} atteste par le présent que le {ministereLibelle}
            {' '}({soaLibelle}), {recensement.niveauLibelle}, a déposé le dossier de recensement des véhicules
            administratifs mis à sa disposition, pour l&rsquo;année {annee}.
          </p>

          <p>Les véhicules administratifs déclarés ci-dessous :</p>

          <ul className="space-y-1">
            {lignes.map((l) => {
              const vehicule = vehicules.find((v) => v.vehiculeId === l.vehiculeId);
              const marqueLibelle = marques.find((m) => m.marqueCode === vehicule?.marqueCode)?.libelle ?? vehicule?.marqueCode ?? '—';
              return (
                <li key={l.recensementLigneId} className="grid grid-cols-[1fr_auto_auto] gap-x-4">
                  <span>-  Véhicule N° {vehicule?.vehiculeImmatriculation ?? '—'},</span>
                  <span>Type : {l.type || '—'},</span>
                  <span>Marque : {marqueLibelle};</span>
                </li>
              );
            })}
          </ul>

          <p>
            Sont arrêtés au nombre de {nombreEnLettres(nombre)} ({String(nombre).padStart(2, '0')}).
          </p>

          <p className="ml-[50%] pt-4 text-center">Fait à Antananarivo, le</p>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="quitus-recensement-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
