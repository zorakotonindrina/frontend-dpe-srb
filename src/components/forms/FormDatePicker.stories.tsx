import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormDatePicker } from './FormDatePicker';

function WithForm({ children }: { children: React.ReactNode }) {
  const form = useForm({ defaultValues: { dateNaissance: undefined } });
  return <FormProvider {...form}><div className="w-80">{children}</div></FormProvider>;
}

const meta: Meta<typeof FormDatePicker> = {
  title:     'Forms/FormDatePicker',
  component: FormDatePicker,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FormDatePicker>;

export const Default: Story = {
  render: () => (
    <WithForm>
      <FormDatePicker name="dateNaissance" label="Date de naissance" />
    </WithForm>
  ),
};

export const Required: Story = {
  name: 'Obligatoire',
  render: () => (
    <WithForm>
      <FormDatePicker name="dateNaissance" label="Date de prise de poste" required />
    </WithForm>
  ),
};

export const WithError: Story = {
  name: 'Avec erreur',
  render: () => {
    const schema = z.object({ dateNaissance: z.date({ error: 'La date est requise' }) });
    function Inner() {
      const form = useForm({ resolver: zodResolver(schema), defaultValues: { dateNaissance: undefined }, mode: 'onChange' });
      form.trigger('dateNaissance');
      return (
        <FormProvider {...form}>
          <div className="w-80">
            <FormDatePicker name="dateNaissance" label="Date de naissance" required />
          </div>
        </FormProvider>
      );
    }
    return <Inner />;
  },
};
