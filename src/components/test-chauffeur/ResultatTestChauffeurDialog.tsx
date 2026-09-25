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
import type { ChauffeurTest } from '@/lib/api/chauffeurTest';
import type { Chauffeur } from '@/lib/api/chauffeurs';
import type { Vehicule } from '@/lib/api/vehicules';

export interface ResultatTestChauffeurDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chauffeurTest: ChauffeurTest;
  chauffeur?: Chauffeur;
  vehicule?: Vehicule;
}

/**
 * Livrable "Résultat de test chauffeur" — comme pour Expertise/Condamnation, AUCUN imprimé
 * officiel n'existe pour ce processus (ni dans IMPRIMES DIGITALISATION 2026.xlsx, ni dans le
 * Word compagnon — confirmé). Mise en forme conçue à partir des données déjà modélisées
 * (bscva.chauffeur + bscva.chauffeur_test proposé), sur le même gabarit visuel que les autres
 * livrables.
 */
export function ResultatTestChauffeurDialog({
  open, onOpenChange, chauffeurTest, chauffeur, vehicule,
}: ResultatTestChauffeurDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('processus.testChauffeur');
  const signataireBudget = useSignataireBudget();

  const today = dateCompleteEnLettres(new Date());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t('resultatTitle')}</DialogTitle>
        </DialogHeader>

        <div className="printable-pv max-h-[60vh] space-y-4 overflow-y-auto text-sm leading-relaxed">
          {/* Vide à dessein — numéro apposé à la main après signature, même principe que le PDF
              Jasper (DemoReportBuilder.buildResultatTestChauffeur). */}
          <p className="text-xs text-muted-foreground">N° : <span className="inline-block w-40" /> {SIGLE_HIERARCHIQUE}</p>

          <p className="text-center font-semibold uppercase">{t('resultatTitle')}</p>

          <p>
            {signataireBudget} soussigné atteste que le chauffeur{' '}
            {chauffeur?.nom ?? '—'} (matricule {chauffeur?.matricule ?? '—'}, permis{' '}
            {chauffeur?.permis ?? '—'}) a été soumis à un test de conduite le{' '}
            {chauffeurTest.dateTest ? new Date(chauffeurTest.dateTest).toLocaleDateString('fr-FR') : '—'}
            {vehicule?.vehiculeImmatriculation && (
              <> sur le véhicule immatriculé {vehicule.vehiculeImmatriculation}</>
            )}
            , sous le contrôle de {chauffeurTest.examinateurNom || '—'}.
          </p>

          <p>
            <span className="font-medium uppercase">{t('fields.resultat')}</span> :{' '}
            {chauffeurTest.resultat === 'NON_APTE' ? t('resultatDefavorable') : t('resultatFavorable')}
          </p>

          <p>
            {t('fields.noteTheorique')} : {chauffeurTest.noteTheorique} — {t('fields.notePratique')} : {chauffeurTest.notePratique}
          </p>

          {chauffeurTest.observations && (
            <p className="whitespace-pre-line">{chauffeurTest.observations}</p>
          )}

          <p>En foi de quoi, le présent résultat est délivré pour servir et valoir ce que de droit.</p>

          <p className="text-right">Antananarivo le, {today}</p>

          <div className="mt-8 grid grid-cols-2 gap-6 pt-4 text-center text-xs font-medium uppercase">
            <p>L&rsquo;Examinateur</p>
            <p>{signataireBudget}</p>
          </div>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
          <Button onClick={() => window.print()} data-testid="resultat-test-chauffeur-print-button">
            <Printer className="mr-1.5 h-4 w-4" />
            {tCommon('print')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
