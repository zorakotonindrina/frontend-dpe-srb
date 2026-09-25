'use client';

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
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { aptitudeLocationSchema, type AptitudeLocationFormData } from '@/lib/validations/aptitudeLocation.schema';
import { useCreateAptitudeLocation } from '@/hooks/useAptitudeLocation';
import { useVehicules } from '@/hooks/useVehicules';
import { ROUTES } from '@/lib/constants/routes';

export default function NouveauControleAptitudePage() {
  const t = useTranslations('processus.aptitudeLocation');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof aptitudeLocationSchema>, unknown, AptitudeLocationFormData>({
    resolver: zodResolver(aptitudeLocationSchema),
    defaultValues: {
      vehiculeId: '', objetMission: '', itineraire: '', dateDebut: '', dateFin: '',
      contratLocation: '', fournisseurNifStat: '', avisAptitude: null,
    },
  });

  const { data: vehicules = [] } = useVehicules();
  const createAptitudeLocation = useCreateAptitudeLocation();

  const values = form.watch();
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'),
      fields: ['vehiculeId', 'objetMission', 'itineraire', 'dateDebut', 'dateFin', 'fournisseurNifStat', 'contratLocation'] },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  async function onSubmit(data: AptitudeLocationFormData) {
    await createAptitudeLocation.mutateAsync(data);
    router.push(ROUTES.PROCESSUS_APTITUDE_LOCATION);
  }

  return (
    <div data-testid="aptitude-location-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_APTITUDE_LOCATION)} data-testid="aptitude-location-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="aptitude-location-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect name="vehiculeId" label={t('fields.vehicule')} required options={vehicules.map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation }))} />
                  <FormField name="objetMission" label={t('fields.objetMission')} required />
                  <FormField name="itineraire" label={t('fields.itineraire')} />
                  <FormField name="dateDebut" label={t('fields.dateDebut')} type="date" required />
                  <FormField name="dateFin" label={t('fields.dateFin')} type="date" required />
                  <FormField name="fournisseurNifStat" label={t('fields.fournisseurNifStat')} />
                  <FormField name="contratLocation" label={t('fields.contratLocation')} placeholder="Ex. CTR-2026-0012" required />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.objetMission'), value: values.objetMission },
                    { label: t('fields.itineraire'), value: values.itineraire },
                    { label: t('fields.dateDebut'), value: values.dateDebut },
                    { label: t('fields.dateFin'), value: values.dateFin },
                    { label: t('fields.fournisseurNifStat'), value: values.fournisseurNifStat },
                    { label: t('fields.contratLocation'), value: values.contratLocation },
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
