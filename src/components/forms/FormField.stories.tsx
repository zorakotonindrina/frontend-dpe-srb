import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Mail, Building2 } from 'lucide-react';
import { FormField } from './FormField';
import { AuthFormField } from './AuthFormField';
import { FormAsyncSelectField } from './FormAsyncSelectField';
import type { ComboboxOption } from './FormCombobox';

/* ------------------------------------------------------------------ */
/* Wrappers FormProvider                                               */
/* ------------------------------------------------------------------ */

function WithForm({ children, defaultValues = {} }: {
  children: React.ReactNode;
  defaultValues?: Record<string, unknown>;
}) {
  const form = useForm({ defaultValues, mode: 'onChange' });
  return <FormProvider {...form}><div className="w-80 space-y-4">{children}</div></FormProvider>;
}

/* ------------------------------------------------------------------ */
/* Meta                                                                */
/* ------------------------------------------------------------------ */

const meta: Meta<typeof FormField> = {
  title:     'Forms/FormField',
  component: FormField,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FormField>;

/* ------------------------------------------------------------------ */
/* Stories                                                             */
/* ------------------------------------------------------------------ */

export const Default: Story = {
  render: () => (
    <WithForm>
      <FormField name="nom" label="Nom de famille" />
    </WithForm>
  ),
};

export const Required: Story = {
  name: 'Champ obligatoire',
  render: () => (
    <WithForm>
      <FormField name="nom" label="Nom de famille" required />
    </WithForm>
  ),
};

export const WithPlaceholder: Story = {
  name: 'Avec placeholder',
  render: () => (
    <WithForm>
      <FormField name="nom" label="Nom de famille" placeholder="ex. Dupont" />
    </WithForm>
  ),
};

export const WithError: Story = {
  name: 'Avec erreur de validation',
  render: () => {
    const schema = z.object({ nom: z.string().min(2, 'Le nom doit contenir au moins 2 caractères') });
    function FormWithError() {
      const form = useForm({ resolver: zodResolver(schema), defaultValues: { nom: 'A' }, mode: 'onChange' });
      form.trigger('nom'); // Trigger validation immediately
      return (
        <FormProvider {...form}>
          <div className="w-80">
            <FormField name="nom" label="Nom de famille" required />
          </div>
        </FormProvider>
      );
    }
    return <FormWithError />;
  },
};

export const Disabled: Story = {
  name: 'Désactivé',
  render: () => (
    <WithForm defaultValues={{ email: 'marie.dupont@gouv.fr' }}>
      <FormField name="email" label="Email" type="email" disabled />
    </WithForm>
  ),
};

export const Password: Story = {
  name: 'Mot de passe',
  render: () => (
    <WithForm>
      <FormField name="password" label="Mot de passe" type="password" required />
    </WithForm>
  ),
};

/* ------------------------------------------------------------------ */
/* AuthFormField                                                       */
/* ------------------------------------------------------------------ */

export const AuthEmail: StoryObj<typeof AuthFormField> = {
  name: 'AuthFormField — Email',
  render: () => (
    <WithForm>
      <AuthFormField
        name="email"
        type="email"
        placeholder="Login"
        ariaLabel="Adresse email"
        icon={<User className="h-4 w-4" />}
      />
    </WithForm>
  ),
};

export const AuthPassword: StoryObj<typeof AuthFormField> = {
  name: 'AuthFormField — Mot de passe',
  render: () => (
    <WithForm>
      <AuthFormField
        name="password"
        type="password"
        placeholder="Mot de Passe"
        ariaLabel="Mot de passe"
        icon={<Lock className="h-4 w-4" />}
      />
    </WithForm>
  ),
};

export const AuthWithError: StoryObj<typeof AuthFormField> = {
  name: 'AuthFormField — Erreur de validation',
  render: () => {
    const schema = z.object({ email: z.string().email('Email invalide') });
    function AuthWithErrorForm() {
      const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: 'pas-un-email' },
        mode: 'onChange',
      });
      form.trigger('email');
      return (
        <FormProvider {...form}>
          <div className="w-80">
            <AuthFormField
              name="email"
              type="email"
              placeholder="Login"
              ariaLabel="Adresse email"
              icon={<Mail className="h-4 w-4" />}
            />
          </div>
        </FormProvider>
      );
    }
    return <AuthWithErrorForm />;
  },
};

/* ------------------------------------------------------------------ */
/* FormAsyncSelectField                                                 */
/* ------------------------------------------------------------------ */

const FAKE_AUGM: ComboboxOption[] = [
  { value: 'augm-antananarivo', label: 'AUGM Antananarivo' },
  { value: 'augm-fianarantsoa', label: 'UADM Fianarantsoa' },
  { value: 'augm-toamasina',    label: 'UADM Toamasina' },
  { value: 'augm-mahajanga',    label: 'UADM Mahajanga' },
];

function fakeFetch(delay = 600) {
  return (query: string): Promise<ComboboxOption[]> =>
    new Promise((resolve) =>
      setTimeout(() => {
        resolve(
          FAKE_AUGM.filter((o) =>
            o.label.toLowerCase().includes(query.toLowerCase()),
          ),
        );
      }, delay),
    );
}

export const AsyncDefault: StoryObj<typeof FormAsyncSelectField> = {
  name: 'FormAsyncSelectField — Défaut',
  render: () => (
    <WithForm>
      <FormAsyncSelectField
        name="augm"
        placeholder="Rechercher une AUGM…"
        ariaLabel="AUGM"
        icon={<Building2 className="h-4 w-4" />}
        fetchOptions={fakeFetch()}
      />
    </WithForm>
  ),
};

export const AsyncLoading: StoryObj<typeof FormAsyncSelectField> = {
  name: 'FormAsyncSelectField — Chargement lent',
  render: () => (
    <WithForm>
      <FormAsyncSelectField
        name="augm"
        placeholder="Tapez 3 caractères…"
        ariaLabel="AUGM"
        icon={<Building2 className="h-4 w-4" />}
        fetchOptions={fakeFetch(2000)}
      />
    </WithForm>
  ),
};

export const AsyncWithError: StoryObj<typeof FormAsyncSelectField> = {
  name: 'FormAsyncSelectField — Erreur de validation',
  render: () => {
    const schema = z.object({ augm: z.string().min(1, 'Veuillez sélectionner une AUGM') });
    function AsyncErrorForm() {
      const form = useForm({
        resolver: zodResolver(schema),
        defaultValues: { augm: '' },
        mode: 'onChange',
      });
      form.trigger('augm');
      return (
        <FormProvider {...form}>
          <div className="w-80">
            <FormAsyncSelectField
              name="augm"
              placeholder="Rechercher une AUGM…"
              ariaLabel="AUGM"
              icon={<Building2 className="h-4 w-4" />}
              fetchOptions={fakeFetch()}
            />
          </div>
        </FormProvider>
      );
    }
    return <AsyncErrorForm />;
  },
};

export const AsyncNoResults: StoryObj<typeof FormAsyncSelectField> = {
  name: 'FormAsyncSelectField — Aucun résultat',
  render: () => (
    <WithForm>
      <FormAsyncSelectField
        name="augm"
        placeholder="Tapez 3 caractères…"
        ariaLabel="AUGM"
        icon={<Building2 className="h-4 w-4" />}
        fetchOptions={() => Promise.resolve([])}
        emptyMessage="Aucune AUGM trouvée."
      />
    </WithForm>
  ),
};

export const AuthLoginForm: StoryObj<typeof AuthFormField> = {
  name: 'AuthFormField — Formulaire login complet',
  render: () => (
    <WithForm>
      <div className="space-y-3">
        <AuthFormField
          name="email"
          type="email"
          placeholder="Login"
          ariaLabel="Adresse email"
          icon={<User className="h-4 w-4" />}
        />
        <AuthFormField
          name="password"
          type="password"
          placeholder="Mot de Passe"
          ariaLabel="Mot de passe"
          icon={<Lock className="h-4 w-4" />}
        />
      </div>
    </WithForm>
  ),
};
