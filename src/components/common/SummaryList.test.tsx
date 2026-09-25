import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SummaryList } from './SummaryList';

describe('SummaryList', () => {
  it('renders label/value pairs', () => {
    render(<SummaryList items={[{ label: 'Nom', value: 'Jean Dupont' }, { label: 'Âge', value: 42 }]} />);
    expect(screen.getByText('Nom')).toBeInTheDocument();
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Âge')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders an em dash for empty values', () => {
    render(<SummaryList items={[{ label: 'Motif', value: '' }, { label: 'Notes', value: undefined }]} />);
    expect(screen.getAllByText('—')).toHaveLength(2);
  });
});
