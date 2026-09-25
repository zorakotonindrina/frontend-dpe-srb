'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { FormSection } from '@/components/common/FormSection';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormCheckbox } from '@/components/forms/FormCheckbox';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { SoaSearchField } from '@/components/forms/SoaSearchField';
import { z } from 'zod';
import { vehiculeSchema, type VehiculeFormData } from '@/lib/validations/vehicule.schema';
import {
  useMarques, useGenres, useCarrosseries, useCategoriesVehicule, useEnergies,
  useEtatsVehicule, useRegions, useDistricts, useCommunes, useMinisteres,
} from '@/hooks/useReferentiels';

export interface VehiculeFormProps {
  defaultValues: z.input<typeof vehiculeSchema>;
  onSubmit: (data: VehiculeFormData) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  submitTestId?: string;
}

export function VehiculeForm({ defaultValues, onSubmit, onCancel, submitLabel, submitTestId }: VehiculeFormProps) {
  const t = useTranslations('vehicules');
  const tCommon = useTranslations('common');

  const form = useForm<z.input<typeof vehiculeSchema>, unknown, VehiculeFormData>({
    resolver: zodResolver(vehiculeSchema),
    defaultValues,
  });

  const regionCode = form.watch('regionCode');
  const districtCode = form.watch('districtCode');

  const { data: marques = [] } = useMarques();
  const { data: genres = [] } = useGenres();
  const { data: carrosseries = [] } = useCarrosseries();
  const { data: categories = [] } = useCategoriesVehicule();
  const { data: energies = [] } = useEnergies();
  const { data: etats = [] } = useEtatsVehicule();
  const { data: regions = [] } = useRegions();
  const { data: districts = [] } = useDistricts(regionCode);
  const { data: communes = [] } = useCommunes(districtCode);
  const { data: ministeres = [] } = useMinisteres();

  return (
    <FormProvider {...form}>
      <form
        data-testid="vehicule-form"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
        className="space-y-6"
      >
        <FormSection title={t('sections.identification')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField name="vehiculeImmatriculation" label={t('fields.immatriculation')} required data-testid="vehicule-immatriculation-input" />
            <FormSelect name="marqueCode" label={t('fields.marque')} required options={marques.map((m) => ({ value: m.marqueCode, label: m.libelle }))} />
            <FormSelect name="genreCode" label={t('fields.genre')} required options={genres.map((g) => ({ value: g.genreCode, label: g.libelle }))} />
            <FormSelect name="carrosserieCode" label={t('fields.carrosserie')} required options={carrosseries.map((c) => ({ value: c.carrosserieCode, label: c.libelle }))} />
            <FormSelect name="categorieVehicule" label={t('fields.categorie')} required options={categories.map((c) => ({ value: c.categorieCode, label: c.categorieLibelle }))} />
            <FormSelect name="sourceEnergie" label={t('fields.energie')} required options={energies.map((e) => ({ value: e.energieCode, label: e.libelle }))} />
            <FormSelect name="etatVehicule" label={t('fields.etat')} required options={etats.map((e) => ({ value: e.etatVehicule, label: e.libelle }))} />
          </div>
        </FormSection>

        <FormSection title={t('sections.caracteristiques')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField name="numeroMoteur" label={t('fields.numeroMoteur')} required />
            <FormField name="vin" label={t('fields.vin')} required />
            <FormField name="puissanceAdministrative" label={t('fields.puissanceAdministrative')} type="number" required />
            <FormField name="pls" label={t('fields.pls')} type="number" required />
            <FormField name="pv" label={t('fields.pv')} type="number" required />
            <FormField name="cu" label={t('fields.cu')} type="number" required />
            <FormField name="pt" label={t('fields.pt')} type="number" required />
            <FormField name="valeurEstimative" label={t('fields.valeurEstimative')} type="number" />
            <FormDatePicker name="datePremierMiseCirculation" label={t('fields.datePremierMiseCirculation')} required />
            <FormCheckbox name="carteGrise" label={t('fields.carteGrise')} />
            <FormCheckbox name="livretsDisponibles" label={t('fields.livretsDisponibles')} />
          </div>
        </FormSection>

        <FormSection title={t('sections.localisation')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormSelect name="minCode" label={t('fields.ministere')} required options={ministeres.map((m) => ({ value: m.minCode, label: m.libelle }))} />
            <SoaSearchField name="soaDepositaire" label={t('fields.soaDepositaire')} required />
            <FormField name="detenteurEffectif" label={t('fields.detenteurEffectif')} required />
            <FormSelect name="regionCode" label={t('fields.region')} required options={regions.map((r) => ({ value: r.regCode, label: r.regionLibelle }))} />
            <FormSelect name="districtCode" label={t('fields.district')} required options={districts.map((d) => ({ value: d.districtCode, label: d.districtLibelle }))} disabled={!regionCode} />
            <FormSelect name="communeCode" label={t('fields.commune')} required options={communes.map((c) => ({ value: c.communeCode, label: c.communeLibelle }))} disabled={!districtCode} />
          </div>
        </FormSection>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="vehicule-form-cancel">
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} data-testid={submitTestId ?? 'vehicule-form-submit'}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
