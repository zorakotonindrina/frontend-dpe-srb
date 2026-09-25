'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { UtilisateurForm } from '@/components/administration/UtilisateurForm';
import type { UtilisateurFormData } from '@/lib/validations/utilisateur.schema';
import { useUtilisateur, useUpdateUtilisateur } from '@/hooks/useUtilisateurs';
import { ROUTES } from '@/lib/constants/routes';

export default function ModifierUtilisateurPage() {
  const matricule = useSearchParams().get('matricule') ?? '';
  const t = useTranslations('administration.utilisateurs');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { data: utilisateur, isLoading } = useUtilisateur(matricule);
  const updateUtilisateur = useUpdateUtilisateur();

  async function onSubmit(data: UtilisateurFormData) {
    await updateUtilisateur.mutateAsync({ matricule, patch: data });
    router.push(ROUTES.ADMINISTRATION_UTILISATEURS);
  }

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!utilisateur) return <p className="text-sm text-muted-foreground">Utilisateur introuvable.</p>;

  return (
    <div data-testid="utilisateur-modifier-page" className="space-y-6">
      <PageHeader title={t('editTitle')} description={`${utilisateur.nom} ${utilisateur.prenom}`} />

      <UtilisateurForm
        mode="edit"
        defaultValues={{
          nom: utilisateur.nom,
          prenom: utilisateur.prenom,
          login: utilisateur.login,
          role: utilisateur.role,
          sigle: utilisateur.sigle,
          site: utilisateur.site,
        }}
        onSubmit={onSubmit}
        onCancel={() => router.push(ROUTES.ADMINISTRATION_UTILISATEURS)}
        submitLabel={tCommon('save')}
        submitTestId="utilisateur-form-submit"
      />
    </div>
  );
}
