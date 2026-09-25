'use client';

import { useEffect, useState } from 'react';
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
import { FormCheckbox } from '@/components/forms/FormCheckbox';
import { SoaSearchField } from '@/components/forms/SoaSearchField';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { receptionTechniqueSchema, type ReceptionTechniqueFormData } from '@/lib/validations/receptionTechnique.schema';
import { useCreateReceptionTechnique } from '@/hooks/useReceptionTechnique';
import { useVehicules } from '@/hooks/useVehicules';
import { useVisasBc } from '@/hooks/useVisaBc';
import { useExperts } from '@/hooks/useReferentiels';
import { useSaveFichesEvaluation, enregistrerFichesApresCreation } from '@/hooks/useEvaluationFiche';
import { FicheEvaluationVehicule } from '@/components/evaluation/FicheEvaluationVehicule';
import type { FicheEvaluation } from '@/lib/api/evaluationFiche';
import { ficheVide } from '@/lib/utils/fiche-evaluation';
import type { ReceptionConstatInput } from '@/lib/api/receptionTechnique';
import { ROUTES } from '@/lib/constants/routes';

export default function NouvelleReceptionTechniquePage() {
  const t = useTranslations('processus.receptionTechnique');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof receptionTechniqueSchema>, unknown, ReceptionTechniqueFormData>({
    resolver: zodResolver(receptionTechniqueSchema),
    defaultValues: {
      vehiculeId: '', visaBcId: '', dateReception: '', heureReception: '', minSoa: '',
      serviceFaitGac: false, expertNom: '', avis: null,
    },
  });

  const { data: vehicules = [] } = useVehicules();
  const { data: visasBc = [] } = useVisasBc();
  const { data: experts = [] } = useExperts();
  const createReceptionTechnique = useCreateReceptionTechnique();
  const saveFiches = useSaveFichesEvaluation();
  const [fiche, setFiche] = useState<FicheEvaluation>(ficheVide());

  const visasBcEligibles = visasBc.filter((v) => v.grandsTravaux && v.decision === 'VISA');

  const [constats, setConstats] = useState<ReceptionConstatInput[]>([]);
  const [libelleConstat, setLibelleConstat] = useState('');

  const values = form.watch();
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);
  const selectedVisaBc = visasBcEligibles.find((v) => v.visaBcId === values.visaBcId);

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'),
      fields: ['vehiculeId', 'visaBcId', 'dateReception', 'heureReception', 'minSoa', 'expertNom', 'serviceFaitGac'] },
    { id: 'constats', title: t('constatsTitle') },
    { id: 'evaluation', title: t('evaluationTitle') },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  useEffect(() => {
    const visaBc = visasBcEligibles.find((v) => v.visaBcId === values.visaBcId);
    if (visaBc && values.vehiculeId !== visaBc.vehiculeId) form.setValue('vehiculeId', visaBc.vehiculeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.visaBcId]);

  function addConstat() {
    if (!libelleConstat.trim()) return;
    setConstats((prev) => [...prev, { libelle: libelleConstat.trim(), rang: prev.length + 1 }]);
    setLibelleConstat('');
  }

  async function onSubmit(data: ReceptionTechniqueFormData) {
    const cree = await createReceptionTechnique.mutateAsync({ input: data, constats });
    // Étape « Évaluation » non bloquante : enregistrée seulement si la fiche est réellement remplie.
    const ficheAEnregistrer = { ...fiche, immatriculation: selectedVehicule?.vehiculeImmatriculation ?? fiche.immatriculation, vehiculeId: selectedVehicule?.vehiculeId };
    const remplie = ficheAEnregistrer.elements.length > 0 || ficheAEnregistrer.observation.trim() !== '' || ficheAEnregistrer.kilometrage !== null;
    await enregistrerFichesApresCreation(saveFiches.mutateAsync, cree.referenceActe, remplie ? [ficheAEnregistrer] : []);
    router.push(ROUTES.PROCESSUS_RECEPTION_TECHNIQUE);
  }

  return (
    <div data-testid="reception-technique-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_RECEPTION_TECHNIQUE)} data-testid="reception-technique-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="reception-technique-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect name="visaBcId" label={t('fields.visaBc')} required options={visasBcEligibles.map((v) => ({ value: v.visaBcId, label: v.numeroBc }))} />
                  <FormSelect name="vehiculeId" label={t('fields.vehicule')} required options={vehicules.map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation }))} />
                  <FormField name="dateReception" label={t('fields.dateReception')} type="date" required />
                  <FormField name="heureReception" label={t('fields.heureReception')} type="time" required />
                  <SoaSearchField name="minSoa" label={t('fields.minSoa')} required />
                  <FormSelect name="expertNom" label={t('fields.expertNom')} required options={experts.map((e) => ({ value: e.expertNom, label: e.expertNom }))} />
                  <FormCheckbox name="serviceFaitGac" label={t('fields.serviceFaitGac')} />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={t('constatsTitle')}>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                    <Input placeholder={t('fields.libelle')} value={libelleConstat} onChange={(e) => setLibelleConstat(e.target.value)} data-testid="reception-constat-input" />
                    <Button type="button" variant="outline" onClick={addConstat} data-testid="reception-add-constat-button">
                      <Plus className="mr-1.5 h-4 w-4" />
                      {t('addConstat')}
                    </Button>
                  </div>
                  {constats.length > 0 && (
                    <ul className="divide-y divide-border rounded-sm border border-border">
                      {constats.map((c, idx) => (
                        <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span>{c.rang}. {c.libelle}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => setConstats((prev) => prev.filter((_, i) => i !== idx).map((c2, i) => ({ ...c2, rang: i + 1 })))}>
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
              <FormSection title={t('evaluationTitle')}>
                <FicheEvaluationVehicule
                  value={{ ...fiche, immatriculation: selectedVehicule?.vehiculeImmatriculation ?? fiche.immatriculation }}
                  immatriculationFigee={Boolean(selectedVehicule)}
                  testIdPrefix="reception-technique-fiche"
                  onChange={setFiche}
                />
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={3}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.visaBc'), value: selectedVisaBc?.numeroBc },
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.dateReception'), value: values.dateReception },
                    { label: t('fields.heureReception'), value: values.heureReception },
                    { label: t('fields.minSoa'), value: values.minSoa },
                    { label: t('fields.expertNom'), value: values.expertNom },
                    { label: t('fields.serviceFaitGac'), value: values.serviceFaitGac ? tCommon('yes') : tCommon('no') },
                  ]}
                />
                {constats.length > 0 && (
                  <ul className="mt-4 divide-y divide-border rounded-sm border border-border">
                    {constats.map((c, idx) => (
                      <li key={idx} className="px-3 py-2 text-sm">{c.rang}. {c.libelle}</li>
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
