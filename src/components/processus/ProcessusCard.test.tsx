import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { ShieldAlert } from 'lucide-react';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { ProcessusCard } from './ProcessusCard';

describe('ProcessusCard', () => {
  it('renders title, description and link href', () => {
    renderWithProviders(
      <ProcessusCard
        code="VA_EXPERTISE"
        title="Expertise"
        description="Déclarer une expertise après accident"
        href="/processus/expertise/nouveau"
        icon={ShieldAlert}
      />,
    );
    const card = screen.getByTestId('processus-card-VA_EXPERTISE');
    expect(card).toBeInTheDocument();
    expect(card).toHaveAttribute('href', '/processus/expertise/nouveau');
    expect(screen.getByText('Expertise')).toBeInTheDocument();
    expect(screen.getByText('Déclarer une expertise après accident')).toBeInTheDocument();
  });

  it('renders without a description', () => {
    renderWithProviders(
      <ProcessusCard code="VA_TEST_CHAUF" title="Test chauffeur" href="/processus/test-chauffeur/nouveau" icon={ShieldAlert} />,
    );
    expect(screen.getByText('Test chauffeur')).toBeInTheDocument();
  });
});
