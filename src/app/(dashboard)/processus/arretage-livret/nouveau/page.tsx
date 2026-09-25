'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { SummaryList } from '@/components/common/SummaryList';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormCheckbox } from '@/components/forms/FormCheckbox';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { FeuilleLivretEditor } from '@/components/arretage-livret/FeuilleLivretEditor';
import { ConsommationLivret } from '@/components/arretage-livret/ConsommationLivret';
import {
  colonnesFeuilles, LIGNE_CARBURANT_VIDE, LIGNE_ENTRETIEN_VIDE, LIGNE_PARCOURS_VIDE, LIGNE_PNEUMATIQUE_VIDE,
  LIGNE_REPARATION_VIDE,
} from '@/components/arretage-livret/feuilles-config';
import { arretageLivretSchema, type ArretageLivretFormData } from '@/lib/validations/arretageLivret.schema';
import { useCreateArretageLivret } from '@/hooks/useArretageLivret';
import { useVehicules } from '@/hooks/useVehicules';
import { useEnergies } from '@/hooks/useReferentiels';
import { useVisasBc, useVisaBcPieces } from '@/hooks/useVisaBc';
import {
  feuillesVides, type ArretageFeuilles, type ArretagePneumatique, type ArretageReparation,
} from '@/lib/fixtures/arretageLivret.fixtures';
import { totauxFeuilles } from '@/lib/utils/consommation-livret';
import {
  phraseCarburants, phraseEntretien, phraseParcours, phrasePneumatiques, phraseReparations,
} from '@/lib/utils/arretage-livret-texte';
import { ROUTES } from '@/lib/constants/routes';

/** Répartition des pièces du dernier BC par mots-clés sur la désignation (aucune colonne de catégorie
 *  réelle sur tsi_visa_bc_piece) : « entretien »/« réparation »… → feuille Réparations du livret Garage
 *  Station Service ; tout le reste (pneus, accessoires…) → feuille Pneumatiques et accessoires du
 *  livret Service Automobile. */
const MOTS_CLES_REPARATION = ['entretien', 'répar', 'reparation', 'vidange', 'révision', 'revision'];
const estReparation = (designation: string): boolean =>
  MOTS_CLES_REPARATION.some((mot) => designation.toLowerCase().includes(mot));

/** 31 décembre de l'année écoulée — l'arrêtage se fait normalement en tout début d'année pour
 * l'année qui vient de se terminer ; sauf si on est déjà en décembre, où l'année en cours convient. */
function defaultDateArretage(): string {
  const now = new Date();
  const year = now.getMonth() === 11 ? now.getFullYear() : now.getFullYear() - 1;
  return `${year}-12-31`;
}

const nombreOuNull = (valeur: string): number | null => (valeur.trim() === '' ? null : Number(valeur));

export default function NouvelArretageLivretPage() {
  const t = useTranslations('processus.arretageLivret');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof arretageLivretSchema>, unknown, ArretageLivretFormData>({
    resolver: zodResolver(arretageLivretSchema),
    defaultValues: {
      vehiculeId: '', dateArretage: defaultDateArretage(), dernierBc: '', vehiculeFonction: false,
      typeCarburant: '', dotationMensuelle: '', dotationExceptionnelle: '',
    },
  });

  const { data: vehicules = [] } = useVehicules();
  const { data: visasBc = [] } = useVisasBc();
  const { data: energies = [] } = useEnergies();
  const createArretageLivret = useCreateArretageLivret();
  const [feuilles, setFeuilles] = useState<ArretageFeuilles>(feuillesVides);

  const values = form.watch();
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);
  // Année des phrases d'arrêté (« durant l'année … ») = année de la date d'arrêtage
  const anneeArretage = values.dateArretage ? new Date(values.dateArretage).getFullYear() : new Date().getFullYear();
  // Année civile en cours : filtre des BC proposés (comportement d'origine — la date d'arrêtage, par défaut le
  // 31/12 de l'année écoulée, ne doit pas restreindre la liste : les BC du véhicule sont datés de l'année en cours)
  const anneeExercice = new Date().getFullYear();
  const colonnes = useMemo(() => colonnesFeuilles((cle) => t(cle)), [t]);
  const totaux = totauxFeuilles(feuilles);

  // Dernier BC du véhicule (les pièces préremplissent les feuilles Pneumatiques/Réparations)
  const visasBcDuVehiculeExercice = visasBc.filter(
    (v) => v.vehiculeId === values.vehiculeId && new Date(v.dateBc).getFullYear() === anneeExercice);
  const dernierBcSelectionne = visasBcDuVehiculeExercice.find((v) => v.numeroBc === values.dernierBc);
  const dernierBcVisaBcId = dernierBcSelectionne?.visaBcId ?? '';
  const { data: piecesDernierBc = [], isSuccess: piecesDernierBcChargees } = useVisaBcPieces(dernierBcVisaBcId);
  const prefilledForVisaBcId = useRef<string | null>(null);

  useEffect(() => {
    if (!dernierBcVisaBcId || !piecesDernierBcChargees) return;
    if (prefilledForVisaBcId.current === dernierBcVisaBcId) return;
    prefilledForVisaBcId.current = dernierBcVisaBcId;
    const pneumatiques: ArretagePneumatique[] = [];
    const reparations: ArretageReparation[] = [];
    for (const piece of piecesDernierBc) {
      const prix = (piece.quantite ?? 0) * (piece.prixUnitaire ?? 0);
      if (estReparation(piece.designation)) {
        reparations.push({ dateEntree: '', dateSortie: '', nature: piece.designation, prix, fromBc: true });
      } else {
        pneumatiques.push({ dateLivraison: '', nature: piece.designation, prix, fromBc: true });
      }
    }
    setFeuilles((prev) => ({
      ...prev,
      pneumatiques: [...prev.pneumatiques.filter((l) => !l.fromBc), ...pneumatiques],
      reparations: [...prev.reparations.filter((l) => !l.fromBc), ...reparations],
    }));
  }, [dernierBcVisaBcId, piecesDernierBcChargees, piecesDernierBc]);

  // Sélection automatique du dernier BC de l'exercice pour le véhicule choisi
  useEffect(() => {
    const dernierBcVehicule = visasBc
      .filter((v) => v.vehiculeId === values.vehiculeId && new Date(v.dateBc).getFullYear() === anneeExercice)
      .sort((a, b) => b.dateBc.localeCompare(a.dateBc))[0];
    const nextDernierBc = dernierBcVehicule?.numeroBc ?? '';
    if (nextDernierBc !== values.dernierBc) form.setValue('dernierBc', nextDernierBc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.vehiculeId, visasBc]);

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'), fields: ['vehiculeId', 'dateArretage', 'dernierBc', 'vehiculeFonction'] },
    { id: 'details', title: t('detailsTitle') },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  async function onSubmit(data: ArretageLivretFormData) {
    await createArretageLivret.mutateAsync({
      input: {
        vehiculeId: data.vehiculeId, dateArretage: data.dateArretage, dernierBc: data.dernierBc,
        vehiculeFonction: data.vehiculeFonction, typeCarburant: data.typeCarburant,
        dotationMensuelle: nombreOuNull(data.dotationMensuelle), dotationExceptionnelle: nombreOuNull(data.dotationExceptionnelle),
      },
      feuilles,
    });
    router.push(ROUTES.PROCESSUS_ARRETAGE_LIVRET);
  }

  const messageVide = t('feuilles.neant');
  const addLabel = t('addDetail');

  return (
    <div data-testid="arretage-livret-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_ARRETAGE_LIVRET)} data-testid="arretage-livret-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="arretage-livret-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect name="vehiculeId" label={t('fields.vehicule')} required options={vehicules.map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation }))} />
                  <FormField name="dateArretage" label={t('fields.dateArretage')} type="date" required />
                  <FormSelect name="dernierBc" label={t('fields.dernierBc')} disabled={!values.vehiculeId}
                    placeholder={values.vehiculeId ? undefined : t('selectionnerVehiculeDabord')}
                    options={visasBcDuVehiculeExercice.map((v) => ({ value: v.numeroBc, label: `${v.numeroBc} — ${v.dateBc}` }))} />
                  <FormCheckbox name="vehiculeFonction" label={t('fields.vehiculeFonction')} />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <div className="space-y-4">
                <FormSection title={t('typeLivretOptions.SA')}>
                  <div className="space-y-4">
                    <FeuilleLivretEditor
                      titre={t('feuilles.carburants')} colonnes={colonnes.carburants} testId="arretage-feuille-carburants"
                      lignes={feuilles.carburants} onChange={(carburants) => setFeuilles((f) => ({ ...f, carburants }))}
                      ligneVide={LIGNE_CARBURANT_VIDE} messageVide={messageVide} addLabel={addLabel}
                      entete={(
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                          <FormSelect name="typeCarburant" label={t('feuilles.typeCarburant')}
                            options={energies.map((e) => ({ value: e.libelle, label: e.libelle }))} />
                          <FormField name="dotationMensuelle" label={t('feuilles.dotationMensuelle')} type="number" />
                          <FormField name="dotationExceptionnelle" label={t('feuilles.dotationExceptionnelle')} type="number" />
                        </div>
                      )}
                      pied={(
                        <p className="text-right text-sm font-semibold">
                          {t('feuilles.totalLitres')} : {totaux.litres.toLocaleString('fr-FR')} l
                        </p>
                      )}
                    />
                    <FeuilleLivretEditor
                      titre={t('feuilles.pneumatiques')} colonnes={colonnes.pneumatiques} testId="arretage-feuille-pneumatiques"
                      lignes={feuilles.pneumatiques} onChange={(pneumatiques) => setFeuilles((f) => ({ ...f, pneumatiques }))}
                      ligneVide={LIGNE_PNEUMATIQUE_VIDE} messageVide={messageVide} addLabel={addLabel}
                      pied={(
                        <p className="text-right text-sm font-semibold">
                          {t('feuilles.totalPrix')} : {totaux.prixPneumatiques.toLocaleString('fr-FR')} Ar
                        </p>
                      )}
                    />
                  </div>
                </FormSection>

                <FormSection title={t('typeLivretOptions.GSS')}>
                  <div className="space-y-4">
                    <FeuilleLivretEditor
                      titre={t('feuilles.entretien')} colonnes={colonnes.entretiens} testId="arretage-feuille-entretien"
                      lignes={feuilles.entretiens} onChange={(entretiens) => setFeuilles((f) => ({ ...f, entretiens }))}
                      ligneVide={LIGNE_ENTRETIEN_VIDE} messageVide={messageVide} addLabel={addLabel}
                    />
                    <FeuilleLivretEditor
                      titre={t('feuilles.reparations')} colonnes={colonnes.reparations} testId="arretage-feuille-reparations"
                      lignes={feuilles.reparations} onChange={(reparations) => setFeuilles((f) => ({ ...f, reparations }))}
                      ligneVide={LIGNE_REPARATION_VIDE} messageVide={messageVide} addLabel={addLabel}
                      pied={(
                        <p className="text-right text-sm font-semibold">
                          {t('feuilles.totalPrix')} : {totaux.prixReparations.toLocaleString('fr-FR')} Ar
                        </p>
                      )}
                    />
                  </div>
                </FormSection>

                <FormSection title={t('typeLivretOptions.PARCOURS')}>
                  <FeuilleLivretEditor
                    titre={t('feuilles.parcours')} colonnes={colonnes.parcours} testId="arretage-feuille-parcours"
                    lignes={feuilles.parcours} onChange={(parcours) => setFeuilles((f) => ({ ...f, parcours }))}
                    ligneVide={LIGNE_PARCOURS_VIDE} messageVide={messageVide} addLabel={addLabel}
                    pied={(
                      <p className="text-right text-sm font-semibold">
                        {t('feuilles.totalDistance')} : {totaux.km.toLocaleString('fr-FR')} km
                      </p>
                    )}
                  />
                </FormSection>

                <ConsommationLivret litres={totaux.litres} km={totaux.km} />
              </div>
            </StepperStep>

            <StepperStep stepIndex={2}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.dateArretage'), value: values.dateArretage },
                    { label: t('fields.dernierBc'), value: values.dernierBc },
                    { label: t('fields.vehiculeFonction'), value: values.vehiculeFonction ? tCommon('yes') : tCommon('no') },
                    { label: t('feuilles.typeCarburant'), value: values.typeCarburant },
                    { label: t('feuilles.dotationMensuelle'), value: values.dotationMensuelle },
                    { label: t('feuilles.dotationExceptionnelle'), value: values.dotationExceptionnelle },
                  ]}
                />

                <div className="mt-4 space-y-1 rounded-sm border border-border p-3 text-sm" data-testid="arretage-apercu-arretes">
                  <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{t('feuilles.apercuArretes')}</p>
                  <p>{phraseCarburants(totaux.litres, values.typeCarburant ?? '', anneeArretage)}</p>
                  <p>{phrasePneumatiques(totaux.prixPneumatiques, anneeArretage)}</p>
                  <p>{phraseEntretien(totaux.operations, anneeArretage)}</p>
                  <p>{phraseReparations(totaux.prixReparations, anneeArretage)}</p>
                  {feuilles.parcours.length > 0 && <p>{phraseParcours(totaux.km, anneeArretage)}</p>}
                </div>

                <div className="mt-4">
                  <ConsommationLivret litres={totaux.litres} km={totaux.km} testId="arretage-consommation-confirmation" />
                </div>
              </FormSection>
            </StepperStep>

            <StepperNav prevLabel={tCommon('previous')} nextLabel={tCommon('next')} submitLabel={tCommon('save')} />
          </Stepper>
        </form>
      </FormProvider>
    </div>
  );
}
