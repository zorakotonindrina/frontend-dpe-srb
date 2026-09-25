import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { FormField } from './FormField';

/* ------------------------------------------------------------------ */
/* Wrapper : enveloppe FormField dans un FormProvider                  */
/* ------------------------------------------------------------------ */

const schema = z.object({
  nom: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
});

type FormValues = z.infer<typeof schema>;

function TestForm({
  children,
  defaultValues,
}: {
  children: React.ReactNode;
  defaultValues?: Partial<FormValues>;
}) {
  const methods = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nom: '', email: '', ...defaultValues },
    mode: 'onChange',
  });
  return <FormProvider {...methods}><form>{children}</form></FormProvider>;
}

/* ================================================================
   FormField — rendu
   ================================================================ */
describe('FormField', () => {
  it('renders label and input', () => {
    renderWithProviders(
      <TestForm>
        <FormField name="nom" label="Nom" />
      </TestForm>,
    );
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-nom-input')).toBeInTheDocument();
    expect(screen.getByTestId('form-field-nom')).toBeInTheDocument();
  });

  it('renders required indicator when required=true', () => {
    renderWithProviders(
      <TestForm>
        <FormField name="nom" label="Nom" required />
      </TestForm>,
    );
    expect(screen.getByTestId('form-field-required-indicator')).toBeInTheDocument();
  });

  it('does not render required indicator when required=false', () => {
    renderWithProviders(
      <TestForm>
        <FormField name="nom" label="Nom" />
      </TestForm>,
    );
    expect(screen.queryByTestId('form-field-required-indicator')).not.toBeInTheDocument();
  });

  it('renders with correct input type', () => {
    renderWithProviders(
      <TestForm>
        <FormField name="email" label="Email" type="email" />
      </TestForm>,
    );
    const input = screen.getByTestId('form-field-email-input');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('renders placeholder', () => {
    renderWithProviders(
      <TestForm>
        <FormField name="nom" label="Nom" placeholder="Entrez votre nom" />
      </TestForm>,
    );
    expect(screen.getByPlaceholderText('Entrez votre nom')).toBeInTheDocument();
  });

  it('disables input when disabled=true', () => {
    renderWithProviders(
      <TestForm>
        <FormField name="nom" label="Nom" disabled />
      </TestForm>,
    );
    expect(screen.getByTestId('form-field-nom-input')).toBeDisabled();
  });
});

/* ================================================================
   FormField — validation et affichage d'erreur
   ================================================================ */
describe('FormField — validation', () => {
  it('shows error message when validation fails', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <TestForm>
        <FormField name="nom" label="Nom" required />
      </TestForm>,
    );

    const input = screen.getByTestId('form-field-nom-input');
    await user.type(input, 'X');
    await user.clear(input);
    await user.tab();

    // Le message d'erreur doit apparaître
    const errorEl = await screen.findByTestId('form-field-nom-error');
    expect(errorEl).toBeInTheDocument();
    expect(errorEl).toHaveTextContent(/minimum 2 caractères/i);
  });

  it('marks input as aria-invalid when there is an error', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <TestForm>
        <FormField name="nom" label="Nom" required />
      </TestForm>,
    );

    const input = screen.getByTestId('form-field-nom-input');
    await user.type(input, 'X');
    await user.clear(input);
    await user.tab();

    await screen.findByTestId('form-field-nom-error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not show error when value is valid', async () => {
    const user = userEvent.setup();

    renderWithProviders(
      <TestForm>
        <FormField name="nom" label="Nom" required />
      </TestForm>,
    );

    const input = screen.getByTestId('form-field-nom-input');
    await user.type(input, 'Martin');
    await user.tab();

    expect(screen.queryByTestId('form-field-nom-error')).not.toBeInTheDocument();
  });
});
