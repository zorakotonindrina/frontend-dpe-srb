'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import { useSignataireBudget } from '@/hooks/useReferentiels';
import type { ArretageLivret, ArretageLivretDetail, ArretageFeuilles } from '@/lib/api/arretageLivret';
import type { TypeLivretCode } from '@/lib/fixtures/arretageLivret.fixtures';
import type { Vehicule } from '@/lib/api/vehicules';
import { dateCompleteEnLettres } from '@/lib/utils/nombre-en-lettres';
import { totauxFeuilles } from '@/lib/utils/consommation-livret';
import {
  phraseCarburants, phraseEntretien, phraseParcours, phrasePneumatiques, phraseReparations,
} from '@/lib/utils/arretage-livret-texte';

export interface VisaArretageLivretDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  arretage: ArretageLivret;
  vehicule?: Vehicule;
  feuilles: ArretageFeuilles;
  /** Ancien détail plat — utilisé seulement pour les dossiers antérieurs au détail par feuille */
  details: ArretageLivretDetail[];
}

const TYPE_LIVRET_ORDER: TypeLivretCode[] = ['SA', 'GSS', 'PARCOURS'];

/**
 * Aperçu du visa d'arrêtage — miroir du PDF `VISA_ARRETAGE_LIVRET` (JasperController + ArretageLivretTexte) :
 * une phrase d'arrêté par feuille de livret, « Antananarivo, le {date en toutes lettres} » puis le signataire.
 * Le livret Parcours n'est imprimé que s'il est renseigné (il n'existe que pour une voiture de service).
 */
export function VisaArretageLivretDialog({
  open, onOpenChange, arretage, vehicule, feuilles, details,
}: VisaArretageLivretDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.arretageLivret');
  const signataireBudget = useSignataireBudget();

  const dateArretage = arretage.dateArretage ? new Date(arretage.dateArretage) : null;
  const dateValide = dateArretage !== null && !Number.isNaN(dateArretage.getTime());
  const annee = dateValide ? dateArretage.getFullYear() : new Date().getFullYear();
  const dateLettres = dateValide ? dateCompleteEnLettres(dateArretage) : arretage.dateArretage;

  const totaux = totauxFeuilles(feuilles);
  const nbLignes = feuilles.carburants.length + feuilles.pneumatiques.length + feuilles.entretiens.length
    + feuilles.reparations.length + feuilles.parcours.length;
  const ancienFormat = nbLignes === 0 && details.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('visaTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
          {/* Vide à dessein — le numéro d'arrêtage est apposé à la main après signature, même
              principe que le PDF Jasper (DemoReportBuilder.buildVisaArretageLivret). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="text-center font-semibold uppercase">{t('visaTitle')}</p>

          <p>
            {t('fields.vehicule')} : {vehicule?.vehiculeImmatriculation ?? '—'} — {t('fields.dateArretage')} : {dateLettres}
          </p>
          {arretage.dernierBc && <p>{t('fields.dernierBc')} : {arretage.dernierBc}</p>}
          {arretage.vehiculeFonction && <p className="italic">{t('fields.vehiculeFonction')}</p>}

          {ancienFormat ? (
            TYPE_LIVRET_ORDER.filter((code) => details.some((d) => d.typeLivretCode === code)).map((code) => (
              <div key={code}>
                <p className="font-medium">{t(`typeLivretOptions.${code}`)}</p>
                <ul className="ml-4 list-disc space-y-1">
                  {details.filter((d) => d.typeLivretCode === code).map((d) => (
                    <li key={d.id}>
                      Arrête le présent livret concernant {d.rubrique.toLowerCase()} à : {d.valeurArretee} durant l&apos;année {annee}.
                      {d.observation && ` (${d.observation})`}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <>
              <div>
                <p className="font-medium">{t('typeLivretOptions.SA')} :</p>
                <ul className="ml-4 space-y-1">
                  <li>- {phraseCarburants(totaux.litres, arretage.typeCarburant ?? '', annee)}</li>
                  <li>- {phrasePneumatiques(totaux.prixPneumatiques, annee)}</li>
                </ul>
              </div>
              <div>
                <p className="font-medium">{t('typeLivretOptions.GSS')} :</p>
                <ul className="ml-4 space-y-1">
                  <li>- {phraseEntretien(totaux.operations, annee)}</li>
                  <li>- {phraseReparations(totaux.prixReparations, annee)}</li>
                </ul>
              </div>
              {feuilles.parcours.length > 0 && (
                <div>
                  <p className="font-medium">{t('typeLivretOptions.PARCOURS')} :</p>
                  <ul className="ml-4 space-y-1">
                    <li>- {phraseParcours(totaux.km, annee)}</li>
                  </ul>
                </div>
              )}
            </>
          )}

          <div className="mt-8 space-y-1 text-center text-xs font-medium">
            <p className="normal-case">Antananarivo, le {dateLettres}</p>
            <p className="uppercase">{signataireBudget}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="visa-arretage-livret-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
