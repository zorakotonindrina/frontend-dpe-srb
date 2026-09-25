import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Users } from 'lucide-react';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { StatCard, StatCardSkeleton } from './StatCard';

/* ================================================================
   StatCard
   ================================================================ */
describe('StatCard', () => {
  it('renders title and formatted value', () => {
    renderWithProviders(
      <StatCard slug="effectifs" title="Effectifs totaux" value={1234} />,
    );
    expect(screen.getByText('Effectifs totaux')).toBeInTheDocument();
    // 1 234 en format FR
    expect(screen.getByText(/1\s?234/)).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-effectifs')).toBeInTheDocument();
  });

  it('renders unit when provided', () => {
    renderWithProviders(
      <StatCard slug="vacants" title="Postes vacants" value={42} unit="postes" />,
    );
    expect(screen.getByText('postes')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    renderWithProviders(
      <StatCard
        slug="agents"
        title="Agents"
        value={100}
        icon={<Users data-testid="users-icon" />}
      />,
    );
    expect(screen.getByTestId('users-icon')).toBeInTheDocument();
  });

  it('renders positive trend with correct aria-label', () => {
    renderWithProviders(
      <StatCard
        slug="recrutements"
        title="Recrutements"
        value={15}
        trend={{ value: 3, unit: '%', label: 'vs mois dernier' }}
      />,
    );
    const trendEl = screen.getByLabelText(/tendance.*\+3%.*vs mois dernier/i);
    expect(trendEl).toBeInTheDocument();
  });

  it('renders negative trend', () => {
    renderWithProviders(
      <StatCard
        slug="departs"
        title="Départs"
        value={5}
        trend={{ value: -2, unit: '%' }}
      />,
    );
    expect(screen.getByLabelText(/tendance.*-2%/i)).toBeInTheDocument();
  });

  it('renders as a link when href is provided', () => {
    renderWithProviders(
      <StatCard slug="postes" title="Postes" value={50} href="/postes" />,
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', '/postes');
  });

  it('does not render a link when href is absent', () => {
    renderWithProviders(
      <StatCard slug="postes" title="Postes" value={50} />,
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders children slot', () => {
    renderWithProviders(
      <StatCard slug="test" title="Test" value={10}>
        <span data-testid="mini-chart-slot">chart</span>
      </StatCard>,
    );
    expect(screen.getByTestId('mini-chart-slot')).toBeInTheDocument();
  });
});

/* ================================================================
   StatCardSkeleton
   ================================================================ */
describe('StatCardSkeleton', () => {
  it('renders with data-testid and aria-busy', () => {
    renderWithProviders(<StatCardSkeleton />);
    const skeleton = screen.getByTestId('stat-card-skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveAttribute('aria-busy', 'true');
  });
});

/* ================================================================
   StatCardGrid — tests de base via StatCard
   ================================================================ */
describe('StatCardGrid loading state', () => {
  it('renders skeleton cards when loading', async () => {
    const { default: React } = await import('react');
    const { StatCardGrid } = await import('./StatCardGrid');
    renderWithProviders(
      <StatCardGrid columns={4} loading>
        <span>should not render</span>
      </StatCardGrid>,
    );
    const skeletons = screen.getAllByTestId('stat-card-skeleton');
    expect(skeletons).toHaveLength(4);
    expect(screen.queryByText('should not render')).not.toBeInTheDocument();
  });

  it('renders children when not loading', async () => {
    const { StatCardGrid } = await import('./StatCardGrid');
    renderWithProviders(
      <StatCardGrid columns={2}>
        <StatCard slug="a" title="A" value={1} />
        <StatCard slug="b" title="B" value={2} />
      </StatCardGrid>,
    );
    expect(screen.getByTestId('stat-card-a')).toBeInTheDocument();
    expect(screen.getByTestId('stat-card-b')).toBeInTheDocument();
  });
});
