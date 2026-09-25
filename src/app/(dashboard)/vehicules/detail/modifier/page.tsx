'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { VehiculeForm } from '@/components/vehicules/VehiculeForm';
import type { VehiculeFormData } from '@/lib/validations/vehicule.schema';
import { useVehicule, useUpdateVehicule } from '@/hooks/useVehicules';
import { ROUTES } from '@/lib/constants/routes';

export default function ModifierVehiculePage() {
  const id = useSearchParams().get('id') ?? '';
  const t = useTranslations('vehicules');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { data: vehicule, isLoading } = useVehicule(id);
  const updateVehicule = useUpdateVehicule();

  async function onSubmit(data: VehiculeFormData) {
    await updateVehicule.mutateAsync({
      id,
      patch: {
        ...data,
        datePremierMiseCirculation: data.datePremierMiseCirculation.toISOString().slice(0, 10),
      },
    });
    router.push(ROUTES.VEHICULE_DETAIL(id));
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!vehicule) return <p className="text-sm text-muted-foreground">Véhicule introuvable.</p>;

  return (
    <div data-testid="vehicule-modifier-page" className="space-y-6">
      <PageHeader title={t('editTitle')} description={vehicule.vehiculeImmatriculation} />

      <VehiculeForm
        defaultValues={{
          vehiculeImmatriculation: vehicule.vehiculeImmatriculation,
          minCode: vehicule.minCode,
          soaDepositaire: vehicule.soaDepositaire,
          marqueCode: vehicule.marqueCode,
          genreCode: vehicule.genreCode,
          carrosserieCode: vehicule.carrosserieCode,
          categorieVehicule: vehicule.categorieVehicule,
          sourceEnergie: vehicule.sourceEnergie,
          etatVehicule: vehicule.etatVehicule,
          numeroMoteur: vehicule.numeroMoteur,
          vin: vehicule.vin,
          puissanceAdministrative: vehicule.puissanceAdministrative,
          pls: vehicule.pls,
          pv: vehicule.pv,
          cu: vehicule.cu,
          pt: vehicule.pt,
          valeurEstimative: vehicule.valeurEstimative,
          datePremierMiseCirculation: new Date(vehicule.datePremierMiseCirculation),
          carteGrise: vehicule.carteGrise,
          livretsDisponibles: vehicule.livretsDisponibles,
          detenteurEffectif: vehicule.detenteurEffectif,
          regionCode: vehicule.regionCode,
          districtCode: vehicule.districtCode,
          communeCode: vehicule.communeCode,
          statut: vehicule.statut,
        }}
        onSubmit={onSubmit}
        onCancel={() => router.push(ROUTES.VEHICULE_DETAIL(id))}
        submitLabel={tCommon('save')}
        submitTestId="vehicule-form-submit"
      />
    </div>
  );
}
