'use client';

import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { SummaryList } from '@/components/common/SummaryList';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { SoaSearchField } from '@/components/forms/SoaSearchField';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { chauffeurSchema, type ChauffeurFormData } from '@/lib/validations/chauffeur.schema';
import { useCreateChauffeur } from '@/hooks/useChauffeurs';
import { useMinisteres } from '@/hooks/useReferentiels';
import { ROUTES } from '@/lib/constants/routes';

export default function NouveauChauffeurPage() {
  const t = useTranslations('chauffeurs');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<ChauffeurFormData>({
    resolver: zodResolver(chauffeurSchema),
    defaultValues: { nom: '', matricule: '', cin: '', permis: '', minCode: '', soaCode: '' },
  });

  const createChauffeur = useCreateChauffeur();
  const { data: ministeres = [] } = useMinisteres();
  const values = form.watch();

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'), fields: ['nom', 'matricule', 'cin', 'permis', 'minCode', 'soaCode'] },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  async function onSubmit(data: ChauffeurFormData) {
    await createChauffeur.mutateAsync(data);
    router.push(ROUTES.CHAUFFEURS);
  }

  return (
    <div data-testid="chauffeurs-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.CHAUFFEURS)} data-testid="chauffeurs-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="chauffeurs-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField name="nom" label={t('fields.nom')} required />
                  <FormField name="matricule" label={t('fields.matricule')} required />
                  <FormField name="cin" label={t('fields.cin')} required />
                  <FormField name="permis" label={t('fields.permis')} required />
                  <FormSelect name="minCode" label={t('fields.minCode')} required options={ministeres.map((m) => ({ value: m.minCode, label: m.libelle }))} />
                  <SoaSearchField name="soaCode" label={t('fields.soaCode')} required />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.nom'), value: values.nom },
                    { label: t('fields.matricule'), value: values.matricule },
                    { label: t('fields.cin'), value: values.cin },
                    { label: t('fields.permis'), value: values.permis },
                    { label: t('fields.minCode'), value: ministeres.find((m) => m.minCode === values.minCode)?.libelle ?? values.minCode },
                    { label: t('fields.soaCode'), value: values.soaCode },
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
