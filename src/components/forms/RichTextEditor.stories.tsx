import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useEffect } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RichTextEditor } from './RichTextEditor';

interface StoryFormValues {
  contenu: string;
}

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function ValuePreview({ name }: { name: keyof StoryFormValues }) {
  const value = useWatch<StoryFormValues>({ name });

  return (
    <div className="rounded-sm border border-border bg-muted/30 p-3">
      <p className="mb-2 text-xs font-medium text-muted-foreground">Valeur RHF</p>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-words text-xs">
        {value || '(vide)'}
      </pre>
      <p className="mt-3 text-xs text-muted-foreground">
        Texte extrait: {stripHtml(value || '') || '(vide)'}
      </p>
    </div>
  );
}

function WithForm({
  children,
  defaultValues = { contenu: '' },
  resolver,
  triggerValidation = false,
}: {
  children: React.ReactNode;
  defaultValues?: StoryFormValues;
  resolver?: Resolver<StoryFormValues>;
  triggerValidation?: boolean;
}) {
  const form = useForm<StoryFormValues>({
    defaultValues,
    resolver,
    mode: 'onChange',
  });

  useEffect(() => {
    if (triggerValidation) {
      void form.trigger('contenu');
    }
  }, [form, triggerValidation]);

  return (
    <FormProvider {...form}>
      <div className="flex w-full max-w-4xl flex-col gap-4">
        {children}
        <ValuePreview name="contenu" />
      </div>
    </FormProvider>
  );
}

const meta: Meta<typeof RichTextEditor> = {
  title: 'Forms/RichTextEditor',
  component: RichTextEditor,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};

export default meta;
type Story = StoryObj<typeof RichTextEditor>;

export const Default: Story = {
  name: 'Defaut',
  render: () => (
    <WithForm>
      <RichTextEditor
        name="contenu"
        label="Contenu"
        placeholder="Commencer a ecrire..."
        description="Editeur TinyMCE self-hosted sous licence GPL."
      />
    </WithForm>
  ),
};

export const WithInitialValue: Story = {
  name: 'Avec valeur initiale',
  render: () => (
    <WithForm
      defaultValues={{
        contenu:
          '<h2>Projet de decision</h2><p>Le dossier est transmis pour validation apres verification des pieces justificatives.</p>',
      }}
    >
      <RichTextEditor name="contenu" label="Contenu" />
    </WithForm>
  ),
};

export const RequiredValidation: Story = {
  name: 'Validation obligatoire',
  render: () => {
    const schema = z.object({
      contenu: z.string().min(1, 'Le contenu est obligatoire'),
    });
    const resolver = zodResolver(schema) as Resolver<StoryFormValues>;

    return (
      <WithForm resolver={resolver} triggerValidation>
        <RichTextEditor name="contenu" label="Contenu" required />
      </WithForm>
    );
  },
};

export const Disabled: Story = {
  name: 'Desactive',
  render: () => (
    <WithForm
      defaultValues={{
        contenu:
          '<p>Ce contenu est verrouille car le dossier est deja transmis.</p>',
      }}
    >
      <RichTextEditor name="contenu" label="Contenu" disabled />
    </WithForm>
  ),
};

export const Considerant: Story = {
  name: 'Considerant administratif',
  render: () => (
    <WithForm
      defaultValues={{
        contenu:
          '<p>Vu la Constitution;</p><p>Vu la loi portant statut general des fonctionnaires;</p><p>Considerant les necessites de service;</p>',
      }}
    >
      <RichTextEditor
        name="contenu"
        label="Considerant"
        required
        placeholder="Saisir le considerant..."
        height={420}
      />
    </WithForm>
  ),
};
