'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { z } from 'zod';
import { FormSection } from '@/components/common/FormSection';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import {
  utilisateurSchema, utilisateurCreateSchema,
  type UtilisateurFormData, type UtilisateurCreateFormData,
} from '@/lib/validations/utilisateur.schema';
import { ROLE_LABELS } from '@/types/auth.types';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

interface UtilisateurFormBaseProps {
  onCancel: () => void;
  submitLabel: string;
  submitTestId?: string;
}

export interface UtilisateurCreateFormProps extends UtilisateurFormBaseProps {
  mode: 'create';
  defaultValues: z.input<typeof utilisateurCreateSchema>;
  onSubmit: (data: UtilisateurCreateFormData) => Promise<void> | void;
}

export interface UtilisateurEditFormProps extends UtilisateurFormBaseProps {
  mode: 'edit';
  defaultValues: z.input<typeof utilisateurSchema>;
  onSubmit: (data: UtilisateurFormData) => Promise<void> | void;
}

export type UtilisateurFormProps = UtilisateurCreateFormProps | UtilisateurEditFormProps;

/** Formulaire partagé création/édition — sur le modèle de VehiculeForm.tsx. En mode
 * `create`, un mot de passe est exigé ; en mode `edit`, il n'est pas modifiable ici
 * (pas de réinitialisation de mot de passe dans cet incrément). */
export function UtilisateurForm(props: UtilisateurFormProps) {
  const { mode, defaultValues, onSubmit, onCancel, submitLabel, submitTestId } = props;
  const t = useTranslations('administration.utilisateurs');
  const tCommon = useTranslations('common');

  const schema = mode === 'create' ? utilisateurCreateSchema : utilisateurSchema;
  const form = useForm<z.input<typeof schema>, unknown, UtilisateurCreateFormData | UtilisateurFormData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  return (
    <FormProvider {...form}>
      <form
        data-testid="utilisateur-form"
        onSubmit={form.handleSubmit(onSubmit as (data: UtilisateurCreateFormData | UtilisateurFormData) => Promise<void> | void)}
        noValidate
        className="space-y-6"
      >
        <FormSection title={t('title')}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <FormField name="nom" label={t('fields.nom')} required />
            <FormField name="prenom" label={t('fields.prenom')} required />
            <FormField name="login" label={t('fields.login')} required />
            {mode === 'create' && (
              <FormField name="password" label={t('fields.password')} type="password" required />
            )}
            <FormSelect name="role" label={t('fields.role')} required options={ROLE_OPTIONS} />
            <FormField name="sigle" label={t('fields.sigle')} />
            <FormField name="site" label={t('fields.site')} />
          </div>
        </FormSection>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} data-testid="utilisateur-form-cancel">
            {tCommon('cancel')}
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting} data-testid={submitTestId ?? 'utilisateur-form-submit'}>
            {submitLabel}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
