'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import {
  MOIS, duMoisDe, nombreEnLettres, anneeEnLettres, heureEnLettres, dateSimple,
} from '@/lib/utils/nombre-en-lettres';
import { useMarques, useSignataireBudget } from '@/hooks/useReferentiels';
import type { ReceptionTechnique, ReceptionConstat } from '@/lib/api/receptionTechnique';
import type { Vehicule } from '@/lib/api/vehicules';
import type { VisaBonCommande } from '@/lib/fixtures/visaBc.fixtures';

export interface ReceptionTechniqueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reception: ReceptionTechnique;
  vehicule?: Vehicule;
  constats: ReceptionConstat[];
  /** BC visé lié (reception.visaBcId) — fournisseur/adresse/n°/date cités dans le paragraphe
   *  notarié, mêmes données que le PDF Jasper (JasperController, bloc PV_RECEPTION). */
  visaBc?: VisaBonCommande;
  ministereLibelle?: string;
}

/** Décompose une date ISO pour la formule notariée d'ouverture (même patron que
 *  PvConstatationDialog.tsx : année et jour en toutes lettres, comme le mois). */
function decomposeDateNotariee(iso: string): { annee: string; jour: string; mois: string } | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return { annee: anneeEnLettres(date.getFullYear()), jour: nombreEnLettres(date.getDate()), mois: MOIS[date.getMonth()] };
}

/** "08:00"/"14:30" → heure en toutes lettres. */
function heureReceptionEnLettres(heureReception: string): string {
  const [h, m] = heureReception.split(':').map(Number);
  return heureEnLettres(Number.isNaN(h) ? 0 : h, Number.isNaN(m) ? 0 : m);
}

/**
 * Livrable "Procès-verbal de réception technique" — refonte fidèle au modèle réel (PV signé,
 * photo fournie) : paragraphe notarié (date/heure d'ouverture en toutes lettres, fournisseur et
 * bon de commande du visa BC lié cités en fin de phrase avec une date simple, distincte du format
 * de la date d'ouverture), constats en tirets, deux signataires seulement ("L'Expert
 * Administratif" / signataire configurable référentiel) — plus de mention SERVICE FAIT/NON FAIT
 * ni de troisième signataire "Responsable" (absents du modèle réel).
 */
export function ReceptionTechniqueDialog({
  open, onOpenChange, reception, vehicule, constats, visaBc, ministereLibelle,
}: ReceptionTechniqueDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.receptionTechnique');
  const { data: marques = [] } = useMarques();
  const signataireBudget = useSignataireBudget();

  const marqueLibelle = marques.find((m) => m.marqueCode === vehicule?.marqueCode)?.libelle;
  const dateNotariee = decomposeDateNotariee(reception.dateReception);
  const dateBc = visaBc?.dateBc ? new Date(visaBc.dateBc) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('ficheTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto pt-6 text-sm leading-relaxed">
          {/* Vide à dessein — numéro apposé à la main après signature, même principe que le PDF
              Jasper (DemoReportBuilder.buildPvReception). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="pt-4 text-center font-semibold uppercase">{t('ficheTitle')}</p>

          <p>
            {dateNotariee ? (
              <>L&apos;an {dateNotariee.annee} et le {dateNotariee.jour} {duMoisDe(dateNotariee.mois)} à{' '}</>
            ) : (
              <>Le {reception.dateReception} à{' '}</>
            )}
            {heureReceptionEnLettres(reception.heureReception)}, s&apos;est déroulée dans l&apos;enceinte du
            Service Régional du Budget Analamanga Andraharo, la réception technique de la voiture
            administrative{marqueLibelle && ` de marque ${marqueLibelle}`}, N°{vehicule?.vehiculeImmatriculation ?? '—'}
            {ministereLibelle && ` appartenant au ${ministereLibelle}`}
            {reception.minSoa && `, ${reception.minSoa}`}
            {visaBc?.fournisseur && (
              <>, objet du devis établi par {visaBc.fournisseur}{visaBc.adresseFournisseur && `, ${visaBc.adresseFournisseur}`}</>
            )}
            {visaBc?.numeroBc && (
              <> et suivant le bon de commande n° {visaBc.numeroBc}{dateBc && ` du ${dateSimple(dateBc)}`}</>
            )}.
          </p>

          <div>
            <p className="font-medium">Après vérification et essai sur route, les constats sont les suivants :</p>
            {constats.length > 0 ? (
              <ul className="ml-4 space-y-0.5">
                {constats.sort((a, b) => a.rang - b.rang).map((c) => (
                  <li key={c.id}>- {c.libelle}</li>
                ))}
              </ul>
            ) : (
              <p>—</p>
            )}
          </div>

          <p className="ml-[50%] pt-4 text-center">Fait à Antananarivo, le</p>

          <div className="mt-8 grid grid-cols-2 gap-6 pt-4 text-center text-xs font-medium uppercase">
            <p>L&apos;Expert Administratif</p>
            <p>{signataireBudget}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="reception-technique-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
