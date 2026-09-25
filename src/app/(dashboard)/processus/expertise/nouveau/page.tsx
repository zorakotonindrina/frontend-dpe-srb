'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { SummaryList } from '@/components/common/SummaryList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { expertiseSchema, type ExpertiseFormData } from '@/lib/validations/expertise.schema';
import { useCreateExpertise } from '@/hooks/useExpertise';
import { useVehicules } from '@/hooks/useVehicules';
import type { DommageInput } from '@/lib/api/expertise';
import { ROUTES } from '@/lib/constants/routes';

const TYPE_EXPERTISE_OPTIONS = [
  { value: 'EXP', label: 'Expertise' },
  { value: 'CONTRE_EXP', label: 'Contre-expertise' },
];

export default function NouvelleExpertisePage() {
  const t = useTranslations('processus.expertise');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof expertiseSchema>, unknown, ExpertiseFormData>({
    resolver: zodResolver(expertiseSchema),
    defaultValues: {
      vehiculeId: '', typeExpertise: 'EXP', dateAccident: '', lieuAccident: '',
      vehiculePriveImmat: '', rapport: '', montantEstime: 0,
    },
  });

  const { data: vehicules = [] } = useVehicules();
  const createExpertise = useCreateExpertise();
  const [dommages, setDommages] = useState<DommageInput[]>([]);
  const [libelle, setLibelle] = useState('');
  const [cout, setCout] = useState('0');

  const values = form.watch();
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);
  const selectedType = TYPE_EXPERTISE_OPTIONS.find((o) => o.value === values.typeExpertise);

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'),
      fields: ['vehiculeId', 'typeExpertise', 'dateAccident', 'lieuAccident', 'vehiculePriveImmat', 'montantEstime', 'rapport'] },
    { id: 'dommages', title: t('dommagesTitle') },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  function addDommage() {
    if (!libelle.trim()) return;
    setDommages((prev) => [...prev, { libelle: libelle.trim(), coutEstime: Number(cout) || 0 }]);
    setLibelle(''); setCout('0');
  }

  async function onSubmit(data: ExpertiseFormData) {
    await createExpertise.mutateAsync({ input: data, dommages });
    router.push(ROUTES.PROCESSUS_EXPERTISE);
  }

  return (
    <div data-testid="expertise-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_EXPERTISE)} data-testid="expertise-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="expertise-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect name="vehiculeId" label={t('fields.vehicule')} required options={vehicules.map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation }))} />
                  <FormSelect name="typeExpertise" label={t('fields.typeExpertise')} required options={TYPE_EXPERTISE_OPTIONS} />
                  <FormField name="dateAccident" label={t('fields.dateAccident')} type="date" required />
                  <FormField name="lieuAccident" label={t('fields.lieuAccident')} required />
                  <FormField name="vehiculePriveImmat" label={t('fields.vehiculePriveImmat')} />
                  <FormField name="montantEstime" label={t('fields.montantEstime')} type="number" required />
                </div>
                <div className="mt-4">
                  <FormTextarea name="rapport" label={t('fields.rapport')} />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={t('dommagesTitle')}>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <Input placeholder="Libellé" value={libelle} onChange={(e) => setLibelle(e.target.value)} />
                    <Input placeholder="Coût estimé" type="number" value={cout} onChange={(e) => setCout(e.target.value)} />
                    <Button type="button" variant="outline" onClick={addDommage} data-testid="expertise-add-dommage-button">
                      <Plus className="mr-1.5 h-4 w-4" />
                      {t('addDommage')}
                    </Button>
                  </div>
                  {dommages.length > 0 && (
                    <ul className="divide-y divide-border rounded-sm border border-border">
                      {dommages.map((d, idx) => (
                        <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span>{d.libelle} — {d.coutEstime}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setDommages((prev) => prev.filter((_, i) => i !== idx))}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={2}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.typeExpertise'), value: selectedType?.label },
                    { label: t('fields.dateAccident'), value: values.dateAccident },
                    { label: t('fields.lieuAccident'), value: values.lieuAccident },
                    { label: t('fields.vehiculePriveImmat'), value: values.vehiculePriveImmat },
                    { label: t('fields.montantEstime'), value: values.montantEstime as number | undefined },
                    { label: t('fields.rapport'), value: values.rapport },
                  ]}
                />
                {dommages.length > 0 && (
                  <ul className="mt-4 divide-y divide-border rounded-sm border border-border">
                    {dommages.map((d, idx) => (
                      <li key={idx} className="px-3 py-2 text-sm">{d.libelle} — {d.coutEstime}</li>
                    ))}
                  </ul>
                )}
              </FormSection>
            </StepperStep>

            <StepperNav prevLabel={tCommon('previous')} nextLabel={tCommon('next')} submitLabel={tCommon('save')} />
          </Stepper>
        </form>
      </FormProvider>
    </div>
  );
}
