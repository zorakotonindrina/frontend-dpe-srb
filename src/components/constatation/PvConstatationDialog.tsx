'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import {
  MOIS, duMoisDe, nombreEnLettres, anneeEnLettres, heureEnLettres,
} from '@/lib/utils/nombre-en-lettres';
import { useMarques, useEnergies, useSignataireBudget } from '@/hooks/useReferentiels';
import type {
  ConstatationTechnique, ConstatationElement, ConstatationPieceRemplacer, ConstatationReparation, ConstatationAccessoire,
} from '@/lib/api/constatation';
import type { Vehicule } from '@/lib/api/vehicules';

export interface PvConstatationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  constatation: ConstatationTechnique;
  vehicule?: Vehicule;
  elements: ConstatationElement[];
  pieces: ConstatationPieceRemplacer[];
  reparations: ConstatationReparation[];
  accessoires: ConstatationAccessoire[];
  ministereLibelle?: string;
}

/**
 * Décompose une date ISO en éléments pour la formule notariée de l'imprimé officiel
 * (« L'an deux mil vingt-six et le vingt-deux du mois d'Avril »), conforme au modèle source
 * (utils/IMPRIMES DIGITALISATION 2026.xlsx, onglet "PV Constatation") — année et jour en toutes
 * lettres, comme le mois.
 */
function decomposeDateNotariee(iso: string): { annee: string; jour: string; mois: string } | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return { annee: anneeEnLettres(date.getFullYear()), jour: nombreEnLettres(date.getDate()), mois: MOIS[date.getMonth()] };
}

/** "08:00"/"14:30" → heure en toutes lettres ("huit heures"/"quatorze heures trente"). */
function heureConstatEnLettres(heureConstat: string): string {
  const [h, m] = heureConstat.split(':').map(Number);
  return heureEnLettres(Number.isNaN(h) ? 0 : h, Number.isNaN(m) ? 0 : m);
}

export function PvConstatationDialog({
  open, onOpenChange, constatation, vehicule, elements, pieces, reparations, accessoires, ministereLibelle,
}: PvConstatationDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.constatationTechnique');
  const { data: marques = [] } = useMarques();
  const { data: energies = [] } = useEnergies();
  const signataireBudget = useSignataireBudget();

  const marqueLibelle = marques.find((m) => m.marqueCode === vehicule?.marqueCode)?.libelle;
  const energieLibelle = energies.find((e) => e.energieCode === vehicule?.sourceEnergie)?.libelle;
  const anneeMiseCirculation = vehicule?.datePremierMiseCirculation
    ? new Date(vehicule.datePremierMiseCirculation).getFullYear()
    : undefined;
  const dateNotariee = decomposeDateNotariee(constatation.dateConstat);

  // Même logique que JasperController (PV_CONSTATATION) : préférer les observations des éléments
  // non conformes de la grille "Éléments contrôlés" au textarea libre `constatation.constats`
  // (généralement vide en pratique), qui reste un filet de sécurité.
  const constatsElements = elements
    .filter((e) => e.conforme === 'N' && e.observation)
    .sort((a, b) => (a.ordrePriorite ?? 0) - (b.ordrePriorite ?? 0))
    .map((e) => e.observation)
    .join(' - ');
  const constatsAffiches = constatsElements || constatation.constats;

  const identite = [
    vehicule && `de marque ${marqueLibelle ?? vehicule.marqueCode}`,
    vehicule && `N° ${vehicule.vehiculeImmatriculation}`,
    vehicule && 'Type : —',
    vehicule?.numeroMoteur && `N° Moteur : ${vehicule.numeroMoteur}`,
    vehicule?.vin && `N° de série : ${vehicule.vin}`,
    anneeMiseCirculation && `année de première mise en circulation : ${anneeMiseCirculation}`,
    energieLibelle && `source d'énergie : ${energieLibelle}`,
  ].filter(Boolean).join(', ');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('pvTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto pt-6 text-sm leading-relaxed">
          {/* Vide à dessein — apposé à la main après signature, même principe que le quitus de
              recensement (voir DemoReportBuilder.buildPvConstatation, staticText "N° :"). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="pt-4 text-center font-semibold uppercase">{t('pvTitle')}</p>

          <p>
            {dateNotariee ? (
              <>L&apos;an {dateNotariee.annee} et le {dateNotariee.jour} {duMoisDe(dateNotariee.mois)} à{' '}</>
            ) : (
              <>Le {constatation.dateConstat} à{' '}</>
            )}
            {heureConstatEnLettres(constatation.heureConstat)}, dans l&apos;enceinte de{' '}
            {constatation.lieu}, {constatation.expertNom}, Expert Administratif, a procédé à la
            constatation technique du véhicule administratif {identite}
            {ministereLibelle && `, appartenant au ${ministereLibelle}`}.
          </p>

          <p>
            <span className="font-medium">Les constats sont les suivants :</span><br />
            {constatsAffiches || '—'}
          </p>

          {pieces.length > 0 && (
            <p>
              <span className="font-medium">{t('piecesRemplacerTitle')} :</span><br />
              {pieces.map((p) => p.libelle).join(' - ')}
            </p>
          )}

          {reparations.length > 0 && (
            <p>
              <span className="font-medium">{t('reparationsTitle')} :</span><br />
              {reparations.map((r) => r.libelle).join(' - ')}
            </p>
          )}

          {accessoires.length > 0 && (
            <p>
              <span className="font-medium">{t('accessoiresTitle')} :</span><br />
              {accessoires.map((a) => a.libelle).join(' - ')}
            </p>
          )}

          <p className="ml-[50%] pt-4 text-center">Fait à Antananarivo, le</p>

          <div className="mt-8 grid grid-cols-2 gap-6 pt-4 text-center text-xs font-medium uppercase">
            <p>L&apos;Expert Administratif</p>
            <p>{signataireBudget}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="pv-constatation-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
