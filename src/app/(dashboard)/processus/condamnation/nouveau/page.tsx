'use client';

import { useState } from 'react';
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
import { FormTextarea } from '@/components/forms/FormTextarea';
import { FormCombobox } from '@/components/forms/FormCombobox';
import { SoaSearchField } from '@/components/forms/SoaSearchField';
import { GrillePrixEditor } from '@/components/condamnation/GrillePrixEditor';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import {
  condamnationSchema, CATEGORIES_MISE_PRIX, ETATS_ACTUELS, type CondamnationFormData,
} from '@/lib/validations/condamnation.schema';
import { useCreateCondamnation } from '@/hooks/useCondamnation';
import { useVehicules } from '@/hooks/useVehicules';
import { useMinisteres } from '@/hooks/useReferentiels';
import { formaterMontant } from '@/lib/utils/evaluation-texte';
import { totalPrix, valeurEnAr, type PrixParElement } from '@/lib/utils/mise-prix';
import { ROUTES } from '@/lib/constants/routes';

export default function NouvelleEvaluationCondamnationPage() {
  const t = useTranslations('processus.condamnation');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof condamnationSchema>, unknown, CondamnationFormData>({
    resolver: zodResolver(condamnationSchema),
    defaultValues: {
      vehiculeId: '', typeMiseAPrix: 'VEHICULE', typeVeh: '', etatActuel: 'BON_ETAT', depreciationPct: 0,
      motifCondamnation: '', soaCode: '', ministereBeneficiaireCode: '', datePv: '', heurePv: '',
      commissionMembresEntite: '', commissionMembresDpe: '',
    },
  });

  const { data: vehicules = [] } = useVehicules();
  const { data: ministeres = [] } = useMinisteres();
  const createCondamnation = useCreateCondamnation();
  // Prix gardés par catégorie : changer de type (Véhicule ↔ Motocyclette) ne mélange pas les deux grilles.
  const [prixParCategorie, setPrixParCategorie] = useState<Record<string, PrixParElement>>({});

  const values = form.watch();
  const categorie = values.typeMiseAPrix === 'MOTOCYCLE' ? 'MOTOCYCLE' : 'VEHICULE';
  const prix = prixParCategorie[categorie] ?? {};
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);
  const valeurEstimee = totalPrix(prix);
  const valeurAr = valeurEnAr(valeurEstimee, Number(values.depreciationPct) || 0);

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'),
      fields: ['vehiculeId', 'typeMiseAPrix', 'typeVeh', 'etatActuel', 'depreciationPct', 'motifCondamnation', 'soaCode',
        'ministereBeneficiaireCode', 'datePv', 'heurePv', 'commissionMembresEntite', 'commissionMembresDpe'] },
    { id: 'miseAPrix', title: t('grille.title') },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  async function onSubmit(data: CondamnationFormData) {
    await createCondamnation.mutateAsync({
      ...data,
      prix: Object.entries(prix)
        .filter((entree): entree is [string, number] => entree[1] !== null && entree[1] !== undefined)
        .map(([elementId, montant]) => ({ elementId, prix: montant })),
    });
    router.push(ROUTES.PROCESSUS_CONDAMNATION);
  }

  return (
    <div data-testid="condamnation-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_CONDAMNATION)} data-testid="condamnation-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="condamnation-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect name="vehiculeId" label={t('fields.vehicule')} required options={vehicules.map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation }))} />
                  <FormSelect name="typeMiseAPrix" label={t('fields.typeMiseAPrix')} required
                    options={CATEGORIES_MISE_PRIX.map((c) => ({ value: c, label: t(`typesMisePrix.${c}`) }))} />
                  <FormField name="typeVeh" label={t('fields.typeVeh')} />
                  <FormSelect name="etatActuel" label={t('fields.etatActuel')} required
                    options={ETATS_ACTUELS.map((e) => ({ value: e, label: t(`etats.${e}`) }))} />
                  <FormField name="depreciationPct" label={t('fields.depreciationPct')} type="number" required />
                  <FormField name="motifCondamnation" label={t('fields.motifCondamnation')} required />
                  <SoaSearchField name="soaCode" label={t('fields.soaCode')} required />
                  <FormCombobox name="ministereBeneficiaireCode" label={t('fields.ministereBeneficiaire')}
                    options={ministeres.map((m) => ({ value: m.minCode, label: m.libelle.replace(/\s+/g, ' ').trim() }))}
                    placeholder={t('fields.ministerePlaceholder')} searchPlaceholder={t('fields.ministereRecherche')} />
                  <FormField name="datePv" label={t('fields.datePv')} type="date" required />
                  <FormField name="heurePv" label={t('fields.heurePv')} type="time" />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormTextarea name="commissionMembresEntite" label={t('fields.commissionMembresEntite')} rows={4}
                    placeholder={t('fields.commissionPlaceholder')} />
                  <FormTextarea name="commissionMembresDpe" label={t('fields.commissionMembresDpe')} rows={4}
                    placeholder={t('fields.commissionPlaceholder')} />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={t('grille.title')}>
                <p className="mb-3 text-sm text-muted-foreground">{t('grille.description')}</p>
                <GrillePrixEditor
                  categorie={categorie}
                  prix={prix}
                  onChange={(p) => setPrixParCategorie((courant) => ({ ...courant, [categorie]: p }))}
                  testIdPrefix="condamnation-grille"
                />
                <div className="mt-4 grid grid-cols-1 gap-3 rounded-md border bg-muted/40 p-3 text-sm md:grid-cols-2" data-testid="condamnation-totaux">
                  <p>{t('fields.valeurEstimee')} : <span className="font-semibold" data-testid="condamnation-valeur-estimee">{formaterMontant(valeurEstimee)} Ar</span></p>
                  <p>{t('fields.valeurEnAr')} : <span className="font-semibold" data-testid="condamnation-valeur-en-ar">{formaterMontant(valeurAr)} Ar</span></p>
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={2}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.typeMiseAPrix'), value: t(`typesMisePrix.${categorie}`) },
                    { label: t('fields.typeVeh'), value: values.typeVeh },
                    { label: t('fields.etatActuel'), value: values.etatActuel ? t(`etats.${values.etatActuel}`) : undefined },
                    { label: t('fields.depreciationPct'), value: `${Number(values.depreciationPct) || 0} %` },
                    { label: t('fields.valeurEstimee'), value: `${formaterMontant(valeurEstimee)} Ar` },
                    { label: t('fields.valeurEnAr'), value: `${formaterMontant(valeurAr)} Ar` },
                    { label: t('fields.motifCondamnation'), value: values.motifCondamnation },
                    { label: t('fields.datePv'), value: values.datePv },
                    { label: t('fields.heurePv'), value: values.heurePv },
                    { label: t('fields.ministereBeneficiaire'), value: ministeres.find((m) => m.minCode === values.ministereBeneficiaireCode)?.libelle },
                    { label: t('fields.commissionMembresEntite'), value: values.commissionMembresEntite },
                    { label: t('fields.commissionMembresDpe'), value: values.commissionMembresDpe },
                  ]}
                />
              </FormSection>
            </StepperStep>

            <StepperNav prevLabel={tCommon('previous')} nextLabel={tCommon('next')} submitLabel={tCommon('save')} />
          </Stepper>
        </form>
      </FormProvider>
    </div>
  );
}
