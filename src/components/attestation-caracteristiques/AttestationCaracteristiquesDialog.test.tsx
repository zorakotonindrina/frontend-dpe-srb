import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { attestationsCaracteristiqueFixtures } from '@/lib/fixtures/attestationCaracteristique.fixtures';
import { AttestationCaracteristiquesDialog } from './AttestationCaracteristiquesDialog';

vi.mock('@/hooks/useReferentiels', () => ({
  useSignataireBudget: () => 'LE CHEF DU SERVICE REGIONAL DU BUDGET',
  useMarques: () => ({ data: [{ marqueId: 'b1f0-marque-uuid', marqueCode: 'b1f0-marque-uuid', libelle: 'TOYOTA' }] }),
}));

const attestation = { ...attestationsCaracteristiqueFixtures[0], marque: 'b1f0-marque-uuid', observation: 'Note interne' };

describe('AttestationCaracteristiquesDialog', () => {
  it('affiche le nom de la marque, pas son identifiant, comme le PDF', () => {
    renderWithProviders(<AttestationCaracteristiquesDialog open onOpenChange={() => {}} attestation={attestation} />);
    expect(screen.getByText(/TOYOTA/)).toBeInTheDocument();
    expect(screen.queryByText(/b1f0-marque-uuid/)).not.toBeInTheDocument();
  });

  it('garde la valeur stockée si la marque est absente du référentiel', () => {
    renderWithProviders(<AttestationCaracteristiquesDialog open onOpenChange={() => {}} attestation={{ ...attestation, marque: 'MERCEDES' }} />);
    expect(screen.getByText(/MERCEDES/)).toBeInTheDocument();
  });

  it('n’imprime jamais l’observation', () => {
    renderWithProviders(<AttestationCaracteristiquesDialog open onOpenChange={() => {}} attestation={attestation} />);
    expect(screen.queryByText(/Note interne/)).not.toBeInTheDocument();
  });
});
