import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import ReportingPage from './page';

vi.mock('@/components/charts/BarChart', () => ({ BarChart: ({ title }: { title: string }) => <div>{title}</div> }));
vi.mock('@/components/charts/DonutChart', () => ({ DonutChart: ({ title }: { title: string }) => <div>{title}</div> }));
vi.mock('@/components/reporting/PrevisionsIa', () => ({ PrevisionsIa: () => <div data-testid="previsions-ia-mock" /> }));
vi.mock('@/hooks/useVehicules', () => ({ useVehicules: () => ({ data: [] }) }));
vi.mock('@/hooks/useDossiers', () => ({ useDossiers: () => ({ data: [] }) }));
vi.mock('@/hooks/useVisaBc', () => ({ useVisasBc: () => ({ data: [] }) }));
vi.mock('@/hooks/useReferentiels', () => ({ useMinisteres: () => ({ data: [] }) }));
vi.mock('@/hooks/useExpertise', () => ({ useExpertises: () => ({ data: [] }) }));

describe('ReportingPage', () => {
  it('ouvre sur les indicateurs et bascule sur les prévisions IA (sans les exports des indicateurs)', async () => {
    renderWithProviders(<ReportingPage />);
    expect(screen.getByTestId('reporting-export-excel')).toBeInTheDocument();
    expect(screen.queryByTestId('previsions-ia-mock')).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByTestId('reporting-tab-ia'));
    expect(screen.getByTestId('previsions-ia-mock')).toBeInTheDocument();
    expect(screen.queryByTestId('reporting-export-excel')).not.toBeInTheDocument();
  });
});
