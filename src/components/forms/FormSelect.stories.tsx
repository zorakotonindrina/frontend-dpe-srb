import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormSelect } from './FormSelect';

const GRADE_OPTIONS = [
  { value: 'A', label: 'Grade A' },
  { value: 'B', label: 'Grade B' },
  { value: 'C', label: 'Grade C' },
  { value: 'D', label: 'Grade D' },
];

function WithForm({ children }: { children: React.ReactNode }) {
  const form = useForm({ defaultValues: { grade: '' } });
  return <FormProvider {...form}><div className="w-80">{children}</div></FormProvider>;
}

const meta: Meta<typeof FormSelect> = {
  title:     'Forms/FormSelect',
  component: FormSelect,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FormSelect>;

export const Default: Story = {
  render: () => (
    <WithForm>
      <FormSelect name="grade" label="Grade" options={GRADE_OPTIONS} />
    </WithForm>
  ),
};

export const Required: Story = {
  name: 'Obligatoire',
  render: () => (
    <WithForm>
      <FormSelect name="grade" label="Grade" options={GRADE_OPTIONS} required placeholder="Sélectionner un grade" />
    </WithForm>
  ),
};

export const WithError: Story = {
  name: 'Avec erreur',
  render: () => {
    const schema = z.object({ grade: z.string().min(1, 'Le grade est requis') });
    function Inner() {
      const form = useForm({ resolver: zodResolver(schema), defaultValues: { grade: '' }, mode: 'onChange' });
      form.trigger('grade');
      return (
        <FormProvider {...form}>
          <div className="w-80">
            <FormSelect name="grade" label="Grade" options={GRADE_OPTIONS} required />
          </div>
        </FormProvider>
      );
    }
    return <Inner />;
  },
};
