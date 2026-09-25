'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { Trash2, Pencil } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { SummaryList } from '@/components/common/SummaryList';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { VehiculeQuickAddPanel } from '@/components/forms/VehiculeQuickAddPanel';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { recensementSchema, type RecensementFormData } from '@/lib/validations/recensement.schema';
import { useCreateRecensement } from '@/hooks/useRecensement';
import { useVehicules } from '@/hooks/useVehicules';
import { useCategoriesUtilisationVehicule, useEtatsGeneralConstate, useMinisteres } from '@/hooks/useReferentiels';
import type { RecensementLigneInput } from '@/lib/api/recensement';
import { ROUTES } from '@/lib/constants/routes';

export default function NouveauRecensementPage() {
  const t = useTranslations('processus.recensement');
  const tCommon = useTranslations('common');
  const tVehicules = useTranslations('vehicules');
  const router = useRouter();

  const form = useForm<z.input<typeof recensementSchema>, unknown, RecensementFormData>({
    resolver: zodResolver(recensementSchema),
    defaultValues: { minCode: '', niveauType: undefined, niveauLibelle: '', pointFocalNom: '', pointFocalFonction: '', pointFocalTel: '', pointFocalEmail: '' },
  });

  const { data: vehicules = [] } = useVehicules();
  const { data: categoriesUtilisation = [] } = useCategoriesUtilisationVehicule();
  const { data: etatsGeneral = [] } = useEtatsGeneralConstate();
  const { data: ministeres = [] } = useMinisteres();
  const [lignes, setLignes] = useState<RecensementLigneInput[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const createRecensement = useCreateRecensement();

  const values = form.watch();

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'),
      fields: ['minCode', 'niveauType', 'niveauLibelle', 'pointFocalNom', 'pointFocalFonction', 'pointFocalTel', 'pointFocalEmail'] },
    { id: 'lignes', title: t('lignesTitle') },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  function libelleCategorie(code: string) {
    return categoriesUtilisation.find((c) => c.categorieUtilisationCode === code)?.libelle ?? code;
  }

  function libelleEtat(code: string) {
    return etatsGeneral.find((e) => e.etatGeneralCode === code)?.libelle ?? code;
  }

  /** Une seule action — le panneau a déjà créé/mis à jour le véhicule, ici on ne fait que
   *  placer/remplacer la ligne dans le tableau local du recensement. En ajout (pas édition), une
   *  immatriculation déjà présente dans ce recensement est ignorée silencieusement (même
   *  comportement que l'ancien addLigne()). */
  function handleLigneSaved(ligne: RecensementLigneInput) {
    setLignes((prev) => {
      if (editingIndex !== null) {
        const next = [...prev];
        next[editingIndex] = ligne;
        return next;
      }
      if (prev.some((l) => l.vehiculeId === ligne.vehiculeId)) return prev;
      return [...prev, ligne];
    });
    setEditingIndex(null);
  }

  function removeLigne(vehiculeId: string) {
    setLignes((prev) => prev.filter((l) => l.vehiculeId !== vehiculeId));
    setEditingIndex(null);
  }

  async function onSubmit(data: RecensementFormData) {
    await createRecensement.mutateAsync({ input: data, lignes });
    router.push(ROUTES.PROCESSUS_RECENSEMENT);
  }

  const editingLigne = editingIndex !== null ? lignes[editingIndex] : null;
  const editingVehicule = editingLigne ? vehicules.find((v) => v.vehiculeId === editingLigne.vehiculeId) ?? null : null;
  const editing = editingLigne && editingVehicule ? { ligne: editingLigne, vehicule: editingVehicule } : null;

  return (
    <div data-testid="recensement-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_RECENSEMENT)} data-testid="recensement-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="recensement-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect
                    name="minCode"
                    label={t('fields.ministere')}
                    required
                    options={ministeres.map((m) => ({ value: m.minCode, label: m.libelle }))}
                  />
                  <FormSelect
                    name="niveauType"
                    label={t('fields.niveauType')}
                    required
                    options={[
                      { value: 'CENTRALE', label: t('niveauCentrale') },
                      { value: 'REGIONALE', label: t('niveauRegionale') },
                    ]}
                  />
                  <FormField name="niveauLibelle" label={t('fields.niveauLibelle')} placeholder={t('niveauLibellePlaceholder')} required />
                  <FormField name="pointFocalNom" label={t('fields.pointFocalNom')} required />
                  <FormField name="pointFocalFonction" label={t('fields.pointFocalFonction')} required />
                  <FormField name="pointFocalTel" label={t('fields.pointFocalTel')} required />
                  <FormField name="pointFocalEmail" label={t('fields.pointFocalEmail')} type="email" required />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={t('lignesTitle')}>
                <div className="space-y-4">
                  <VehiculeQuickAddPanel
                    key={editingIndex ?? 'new'}
                    existingVehicules={vehicules}
                    defaultMinCode={values.minCode}
                    editing={editing}
                    onSaved={(ligne) => handleLigneSaved(ligne)}
                    onCancelEdit={() => setEditingIndex(null)}
                  />

                  {lignes.length > 0 && (
                    <ul className="divide-y divide-border rounded-sm border border-border">
                      {lignes.map((l, idx) => {
                        const vehicule = vehicules.find((v) => v.vehiculeId === l.vehiculeId);
                        return (
                          <li key={l.vehiculeId} className="flex items-center justify-between px-3 py-2 text-sm">
                            <span>
                              {vehicule?.vehiculeImmatriculation} — {l.detenteurEffectif} — {l.type} — {libelleEtat(l.etatGeneral)} — {libelleCategorie(l.categorieUtilisation)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label={tVehicules('actions.edit')}
                                onClick={() => setEditingIndex(idx)}
                                data-testid={`recensement-ligne-edit-${idx}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button type="button" variant="ghost" size="icon" onClick={() => removeLigne(l.vehiculeId)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={2}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.ministere'), value: ministeres.find((m) => m.minCode === values.minCode)?.libelle ?? values.minCode },
                    { label: t('fields.niveauType'), value: values.niveauType === 'CENTRALE' ? t('niveauCentrale') : t('niveauRegionale') },
                    { label: t('fields.niveauLibelle'), value: values.niveauLibelle },
                    { label: t('fields.pointFocalNom'), value: values.pointFocalNom },
                    { label: t('fields.pointFocalFonction'), value: values.pointFocalFonction },
                    { label: t('fields.pointFocalTel'), value: values.pointFocalTel },
                    { label: t('fields.pointFocalEmail'), value: values.pointFocalEmail },
                  ]}
                />
                {lignes.length > 0 && (
                  <ul className="mt-4 divide-y divide-border rounded-sm border border-border">
                    {lignes.map((l) => {
                      const vehicule = vehicules.find((v) => v.vehiculeId === l.vehiculeId);
                      return (
                        <li key={l.vehiculeId} className="px-3 py-2 text-sm">
                          {vehicule?.vehiculeImmatriculation} — {l.detenteurEffectif} — {l.type} — {libelleEtat(l.etatGeneral)} — {libelleCategorie(l.categorieUtilisation)}
                        </li>
                      );
                    })}
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
