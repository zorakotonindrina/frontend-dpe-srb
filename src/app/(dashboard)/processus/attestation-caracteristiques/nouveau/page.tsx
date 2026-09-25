'use client';

import { useEffect } from 'react';
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
import { FormTextarea } from '@/components/forms/FormTextarea';
import { FormSelect } from '@/components/forms/FormSelect';
import { SoaSearchField } from '@/components/forms/SoaSearchField';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { attestationCaracteristiqueSchema, type AttestationCaracteristiqueFormData } from '@/lib/validations/attestationCaracteristique.schema';
import { useCreateAttestationCaracteristique } from '@/hooks/useAttestationCaracteristique';
import { useVehicules } from '@/hooks/useVehicules';
import { useMinisteres } from '@/hooks/useReferentiels';
import { ROUTES } from '@/lib/constants/routes';

export default function NouvelleAttestationCaracteristiquePage() {
  const t = useTranslations('processus.attestationCaracteristiques');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof attestationCaracteristiqueSchema>, unknown, AttestationCaracteristiqueFormData>({
    resolver: zodResolver(attestationCaracteristiqueSchema),
    defaultValues: {
      vehiculeId: '', minCode: '', soaLibelle: '',
      immatriculation: '', marque: '', genre: '', carrosserie: '', typeVeh: '', numeroSerieType: '',
      numeroMoteur: '', nombrePlace: 0, sourceEnergie: '', puissanceAdmin: 0, poidsVide: 0, chargeUtile: 0,
      ptac: 0, anneePremiereMise: 0, motifPerte: '', observation: '',
    },
  });

  const { data: vehicules = [] } = useVehicules();
  const { data: ministeres = [] } = useMinisteres();
  const createAttestation = useCreateAttestationCaracteristique();

  const values = form.watch();
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);

  // Pré-remplissage des caractéristiques techniques depuis le véhicule choisi — figées sur
  // l'attestation dès la création (bscva.attestation_caracteristique), mais librement modifiables
  // ensuite (aucun champ ne bloque la saisie initiale, cf. §3.4 du document de conception).
  useEffect(() => {
    const vehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);
    if (!vehicule) return;
    form.setValue('immatriculation', vehicule.vehiculeImmatriculation);
    form.setValue('marque', vehicule.marqueCode);
    form.setValue('genre', vehicule.genreCode);
    form.setValue('carrosserie', vehicule.carrosserieCode);
    form.setValue('numeroSerieType', vehicule.vin);
    form.setValue('numeroMoteur', vehicule.numeroMoteur);
    form.setValue('nombrePlace', vehicule.pls);
    form.setValue('sourceEnergie', vehicule.sourceEnergie);
    form.setValue('puissanceAdmin', vehicule.puissanceAdministrative);
    form.setValue('poidsVide', vehicule.pv);
    form.setValue('chargeUtile', vehicule.cu);
    form.setValue('ptac', vehicule.pt);
    form.setValue(
      'anneePremiereMise',
      vehicule.datePremierMiseCirculation ? new Date(vehicule.datePremierMiseCirculation).getFullYear() : 0,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.vehiculeId, vehicules]);

  const STEPS: StepConfig[] = [
    {
      id: 'infos', title: t('title'),
      fields: [
        'vehiculeId', 'minCode', 'soaLibelle', 'immatriculation', 'marque', 'genre', 'carrosserie',
        'typeVeh', 'numeroSerieType', 'numeroMoteur', 'nombrePlace', 'sourceEnergie', 'puissanceAdmin',
        'poidsVide', 'chargeUtile', 'ptac', 'anneePremiereMise', 'motifPerte', 'observation',
      ],
    },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  async function onSubmit(data: AttestationCaracteristiqueFormData) {
    await createAttestation.mutateAsync(data);
    router.push(ROUTES.PROCESSUS_ATTESTATION_CARAC);
  }

  return (
    <div data-testid="attestation-caracteristiques-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_ATTESTATION_CARAC)} data-testid="attestation-caracteristiques-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="attestation-caracteristiques-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect name="vehiculeId" label={t('fields.vehicule')} required options={vehicules.map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation }))} />
                  <FormSelect name="minCode" label={t('fields.minCode')} required options={ministeres.map((m) => ({ value: m.minCode, label: m.libelle }))} />
                  <SoaSearchField name="soaLibelle" label={t('fields.soaLibelle')} required valueMode="label" />
                </div>
              </FormSection>

              <FormSection title={t('caracteristiquesTitle')} className="mt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField name="immatriculation" label={t('fields.immatriculation')} required />
                  <FormField name="marque" label={t('fields.marque')} required />
                  <FormField name="genre" label={t('fields.genre')} required />
                  <FormField name="carrosserie" label={t('fields.carrosserie')} required />
                  <FormField name="typeVeh" label={t('fields.type')} required />
                  <FormField name="numeroSerieType" label={t('fields.numeroSerie')} required />
                  <FormField name="numeroMoteur" label={t('fields.numeroMoteur')} required />
                  <FormField name="nombrePlace" label={t('fields.nombrePlace')} type="number" required />
                  <FormField name="sourceEnergie" label={t('fields.sourceEnergie')} required />
                  <FormField name="puissanceAdmin" label={t('fields.puissanceAdministrative')} type="number" required />
                  <FormField name="poidsVide" label={t('fields.poidsVide')} type="number" required />
                  <FormField name="chargeUtile" label={t('fields.chargeUtile')} type="number" required />
                  <FormField name="ptac" label={t('fields.poidsTotal')} type="number" required />
                  <FormField name="anneePremiereMise" label={t('fields.anneeMiseCirculation')} type="number" required />
                </div>
              </FormSection>

              <FormSection title={t('motifTitle')} className="mt-4">
                <FormField name="motifPerte" label={t('fields.motifPerte')} required />
                <FormTextarea name="observation" label={t('fields.observation')} rows={3} className="mt-4" />
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.minCode'), value: ministeres.find((m) => m.minCode === values.minCode)?.libelle ?? values.minCode },
                    { label: t('fields.soaLibelle'), value: values.soaLibelle },
                    { label: t('fields.marque'), value: values.marque },
                    { label: t('fields.genre'), value: values.genre },
                    { label: t('fields.carrosserie'), value: values.carrosserie },
                    { label: t('fields.type'), value: values.typeVeh },
                    { label: t('fields.numeroSerie'), value: values.numeroSerieType },
                    { label: t('fields.numeroMoteur'), value: values.numeroMoteur },
                    { label: t('fields.nombrePlace'), value: values.nombrePlace as number | undefined },
                    { label: t('fields.sourceEnergie'), value: values.sourceEnergie },
                    { label: t('fields.puissanceAdministrative'), value: values.puissanceAdmin as number | undefined },
                    { label: t('fields.poidsVide'), value: values.poidsVide as number | undefined },
                    { label: t('fields.chargeUtile'), value: values.chargeUtile as number | undefined },
                    { label: t('fields.poidsTotal'), value: values.ptac as number | undefined },
                    { label: t('fields.anneeMiseCirculation'), value: values.anneePremiereMise as number | undefined },
                    { label: t('fields.motifPerte'), value: values.motifPerte },
                    { label: t('fields.observation'), value: values.observation },
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
