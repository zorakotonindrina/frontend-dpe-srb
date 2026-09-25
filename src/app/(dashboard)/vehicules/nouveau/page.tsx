'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { VehiculeForm } from '@/components/vehicules/VehiculeForm';
import type { VehiculeFormData } from '@/lib/validations/vehicule.schema';
import { useCreateVehicule } from '@/hooks/useVehicules';
import { ROUTES } from '@/lib/constants/routes';

const DEFAULT_VALUES = {
  vehiculeImmatriculation: '', minCode: '', soaDepositaire: '', marqueCode: '', genreCode: '',
  carrosserieCode: '', categorieVehicule: '', sourceEnergie: '', etatVehicule: '',
  numeroMoteur: '', vin: '', puissanceAdministrative: 0, pls: 0, pv: 0, cu: 0, pt: 0, valeurEstimative: 0,
  datePremierMiseCirculation: new Date(),
  carteGrise: false, livretsDisponibles: false, detenteurEffectif: '',
  regionCode: '', districtCode: '', communeCode: '', statut: 'ACTIF' as const,
};

export default function NouveauVehiculePage() {
  const t = useTranslations('vehicules');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const createVehicule = useCreateVehicule();

  async function onSubmit(data: VehiculeFormData) {
    await createVehicule.mutateAsync({
      ...data,
      datePremierMiseCirculation: data.datePremierMiseCirculation.toISOString().slice(0, 10),
    });
    router.push(ROUTES.VEHICULES);
  }

  return (
    <div data-testid="vehicule-nouveau-page" className="space-y-6">
      <PageHeader title={t('newTitle')} description={t('subtitle')} />

      <VehiculeForm
        defaultValues={DEFAULT_VALUES}
        onSubmit={onSubmit}
        onCancel={() => router.push(ROUTES.VEHICULES)}
        submitLabel={useTranslations('common')('save')}
        submitTestId="vehicule-form-submit"
      />
    </div>
  );
}
