'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { UtilisateurForm } from '@/components/administration/UtilisateurForm';
import type { UtilisateurCreateFormData } from '@/lib/validations/utilisateur.schema';
import { useCreateUtilisateur, useUtilisateurs } from '@/hooks/useUtilisateurs';
import { computeNextMatricule } from '@/lib/api/utilisateurs';
import { ROUTES } from '@/lib/constants/routes';

const DEFAULT_VALUES = {
  nom: '', prenom: '', login: '', password: '', role: 'AGENT_SAISIE' as const, sigle: '', site: '',
};

export default function NouvelUtilisateurPage() {
  const t = useTranslations('administration.utilisateurs');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const createUtilisateur = useCreateUtilisateur();
  const { data: utilisateurs, isLoading } = useUtilisateurs();

  async function onSubmit(data: UtilisateurCreateFormData) {
    await createUtilisateur.mutateAsync({ ...data, statut: '1' });
    router.push(ROUTES.ADMINISTRATION_UTILISATEURS);
  }

  if (isLoading || !utilisateurs) {
    return (
      <div data-testid="utilisateur-nouveau-page" className="space-y-6">
        <PageHeader title={t('newTitle')} description={t('subtitle')} />
      </div>
    );
  }

  return (
    <div data-testid="utilisateur-nouveau-page" className="space-y-6">
      <PageHeader title={t('newTitle')} description={t('subtitle')} />

      <UtilisateurForm
        mode="create"
        defaultValues={{ ...DEFAULT_VALUES, login: computeNextMatricule(utilisateurs) }}
        onSubmit={onSubmit}
        onCancel={() => router.push(ROUTES.ADMINISTRATION_UTILISATEURS)}
        submitLabel={tCommon('save')}
        submitTestId="utilisateur-form-submit"
      />
    </div>
  );
}
