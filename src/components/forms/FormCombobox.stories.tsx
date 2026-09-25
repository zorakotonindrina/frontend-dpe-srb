import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm, FormProvider } from 'react-hook-form';
import { FormCombobox } from './FormCombobox';

const AGENTS = [
  { value: 'marie-dupont',    label: 'Marie Dupont' },
  { value: 'jean-martin',     label: 'Jean Martin' },
  { value: 'sophie-bernard',  label: 'Sophie Bernard' },
  { value: 'ahmed-toure',     label: 'Ahmed Touré' },
  { value: 'chloe-lefebvre',  label: 'Chloé Lefebvre' },
  { value: 'pierre-dubois',   label: 'Pierre Dubois' },
  { value: 'isabelle-moreau', label: 'Isabelle Moreau' },
];

function WithForm({ children }: { children: React.ReactNode }) {
  const form = useForm({ defaultValues: { agent: '' } });
  return <FormProvider {...form}><div className="w-80">{children}</div></FormProvider>;
}

const meta: Meta<typeof FormCombobox> = {
  title:     'Forms/FormCombobox',
  component: FormCombobox,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FormCombobox>;

export const Default: Story = {
  render: () => (
    <WithForm>
      <FormCombobox
        name="agent"
        label="Agent responsable"
        options={AGENTS}
        placeholder="Rechercher un agent…"
        emptyMessage="Aucun agent trouvé"
      />
    </WithForm>
  ),
};

export const Required: Story = {
  name: 'Obligatoire',
  render: () => (
    <WithForm>
      <FormCombobox
        name="agent"
        label="Agent responsable"
        options={AGENTS}
        placeholder="Rechercher un agent…"
        emptyMessage="Aucun agent trouvé"
        required
      />
    </WithForm>
  ),
};
