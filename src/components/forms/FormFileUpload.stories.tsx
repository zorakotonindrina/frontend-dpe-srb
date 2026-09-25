import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useForm, FormProvider } from 'react-hook-form';
import { FormFileUpload } from './FormFileUpload';

function WithForm({ children }: { children: React.ReactNode }) {
  const form = useForm({ defaultValues: { document: undefined } });
  return <FormProvider {...form}><div className="w-96">{children}</div></FormProvider>;
}

const meta: Meta<typeof FormFileUpload> = {
  title:     'Forms/FormFileUpload',
  component: FormFileUpload,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;
type Story = StoryObj<typeof FormFileUpload>;

export const Default: Story = {
  render: () => (
    <WithForm>
      <FormFileUpload name="document" label="Document administratif" />
    </WithForm>
  ),
};

export const RestrictedTypes: Story = {
  name: 'Types restreints (PDF/Word)',
  render: () => (
    <WithForm>
      <FormFileUpload
        name="document"
        label="Arrêté de nomination"
        accept=".pdf,.doc,.docx"
        maxSize={5 * 1024 * 1024}
        required
      />
    </WithForm>
  ),
};
