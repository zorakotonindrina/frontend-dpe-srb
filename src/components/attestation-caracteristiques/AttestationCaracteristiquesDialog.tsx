'use client';

import { useTranslations } from 'next-intl';
import { Printer } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SIGLE_HIERARCHIQUE } from '@/lib/constants/document';
import { dateCompleteEnLettres } from '@/lib/utils/nombre-en-lettres';
import { useMarques, useSignataireBudget } from '@/hooks/useReferentiels';
import type { AttestationCaracteristique } from '@/lib/api/attestationCaracteristique';

export interface AttestationCaracteristiquesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attestation: AttestationCaracteristique;
}

/**
 * Livrable "Attestation de caractéristiques" — texte fidèle à l'imprimé officiel
 * (D:\ASA\Siigpe\utils\IMPRIMES DIGITALISATION 2026.xlsx, onglet "Attestation de caracteristiqu").
 * Toutes les caractéristiques techniques sont désormais figées sur `AttestationCaracteristique`
 * elle-même (bscva.attestation_caracteristique) — jamais relues en direct depuis `Vehicule`, pour
 * qu'une réimpression ultérieure continue de refléter l'état du véhicule au moment de la délivrance.
 */
export function AttestationCaracteristiquesDialog({
  open, onOpenChange, attestation,
}: AttestationCaracteristiquesDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.attestationCaracteristiques');
  const signataireBudget = useSignataireBudget();
  const { data: marques = [] } = useMarques();

  const today = dateCompleteEnLettres(new Date());
  // `attestation.marque` stocke l'identifiant de tsi_vehicule_marque : on affiche son nom, comme le PDF Jasper (§9.14).
  const marque = marques.find((m) => m.marqueCode === attestation.marque)?.libelle ?? attestation.marque;

  const caracteristiques: Array<[string, string | number | undefined]> = [
    [t('fields.marque'), marque],
    [t('fields.genre'), attestation.genre],
    [t('fields.carrosserie'), attestation.carrosserie],
    [t('fields.type'), attestation.typeVeh],
    [t('fields.numeroSerie'), attestation.numeroSerieType],
    [t('fields.numeroMoteur'), attestation.numeroMoteur],
    [t('fields.nombrePlace'), attestation.nombrePlace],
    [t('fields.sourceEnergie'), attestation.sourceEnergie],
    [t('fields.puissanceAdministrative'), attestation.puissanceAdmin],
    [t('fields.poidsVide'), attestation.poidsVide],
    [t('fields.chargeUtile'), attestation.chargeUtile],
    [t('fields.poidsTotal'), attestation.ptac],
    [t('fields.anneeMiseCirculation'), attestation.anneePremiereMise],
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('attestationTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto pt-6 text-sm leading-relaxed">
          {/* Vide à dessein — numéro apposé à la main après signature, même principe que le PDF
              Jasper (DemoReportBuilder.buildAttestationCaracteristique). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="text-center font-semibold uppercase">{t('attestationTitle')}</p>

          <p>
            L&rsquo;expert administratif soussigné, atteste que le véhicule Administratif, appartenant
            au {attestation.minCode}{attestation.soaLibelle && <>, {attestation.soaLibelle}</>}, immatriculé
            sous numéro {attestation.immatriculation || '—'}{' '}
            répond, d&rsquo;après notre registre aux caractéristiques suivantes :
          </p>

          <ul className="space-y-0.5">
            {caracteristiques.map(([label, value]) => (
              <li key={label}>
                <span className="font-medium uppercase">{label}</span> : {value || '—'}
              </li>
            ))}
          </ul>

          <p>En foi de quoi, la présente attestation est délivrée pour servir et valoir ce que de droit.</p>

          <p className="text-right">Antananarivo le, {today}</p>

          <div className="mt-8 grid grid-cols-2 gap-6 pt-4 text-center text-xs font-medium uppercase">
            <p>L&rsquo;Expert Administratif</p>
            <p>{signataireBudget}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="attestation-caracteristiques-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
