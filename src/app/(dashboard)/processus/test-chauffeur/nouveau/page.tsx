'use client';

import Link from 'next/link';
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
import { chauffeurTestSchema, type ChauffeurTestFormData } from '@/lib/validations/chauffeurTest.schema';
import { useCreateChauffeurTest } from '@/hooks/useChauffeurTest';
import { useChauffeurs } from '@/hooks/useChauffeurs';
import { useVehicules } from '@/hooks/useVehicules';
import { ROUTES } from '@/lib/constants/routes';

export default function NouveauTestChauffeurPage() {
  const t = useTranslations('processus.testChauffeur');
  const tChauffeurs = useTranslations('chauffeurs');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof chauffeurTestSchema>, unknown, ChauffeurTestFormData>({
    resolver: zodResolver(chauffeurTestSchema),
    defaultValues: {
      chauffeurId: '', vehiculeId: '', dateTest: '', examinateurNom: '',
      noteTheorique: 0, notePratique: 0, resultat: null,
    },
  });

  const { data: chauffeurs = [] } = useChauffeurs();
  const { data: vehicules = [] } = useVehicules();
  const createChauffeurTest = useCreateChauffeurTest();

  const values = form.watch();
  const selectedChauffeur = chauffeurs.find((c) => c.chauffeurId === values.chauffeurId);
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'), fields: ['chauffeurId', 'vehiculeId', 'dateTest', 'examinateurNom', 'noteTheorique', 'notePratique'] },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  async function onSubmit(data: ChauffeurTestFormData) {
    await createChauffeurTest.mutateAsync(data);
    router.push(ROUTES.PROCESSUS_TEST_CHAUFFEUR);
  }

  return (
    <div data-testid="test-chauffeur-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_TEST_CHAUFFEUR)} data-testid="test-chauffeur-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="test-chauffeur-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <FormSelect name="chauffeurId" label={t('fields.chauffeur')} required options={chauffeurs.map((c) => ({ value: c.chauffeurId, label: c.nom }))} />
                    <Link href={ROUTES.CHAUFFEUR_NEW} className="text-xs text-primary hover:underline">
                      + {tChauffeurs('newTitle')}
                    </Link>
                  </div>
                  <FormSelect name="vehiculeId" label={t('fields.vehicule')} options={vehicules.map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation }))} />
                  <FormField name="dateTest" label={t('fields.dateTest')} type="date" required />
                  <FormField name="examinateurNom" label={t('fields.examinateurNom')} required />
                  <FormField name="noteTheorique" label={t('fields.noteTheorique')} type="number" required />
                  <FormField name="notePratique" label={t('fields.notePratique')} type="number" required />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.chauffeur'), value: selectedChauffeur?.nom },
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.dateTest'), value: values.dateTest },
                    { label: t('fields.examinateurNom'), value: values.examinateurNom },
                    { label: t('fields.noteTheorique'), value: String(values.noteTheorique) },
                    { label: t('fields.notePratique'), value: String(values.notePratique) },
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
