import type { ReactNode } from 'react';
import {
  SectionCard,
  SectionCardHeader,
  SectionCardTitle,
  SectionCardContent,
} from './SectionCard';

export interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

/** Enveloppe SectionCard pour les blocs de formulaire (une section = un titre + une grille de champs). */
export function FormSection({ title, children, className }: FormSectionProps) {
  return (
    <SectionCard className={className}>
      <SectionCardHeader>
        <SectionCardTitle>{title}</SectionCardTitle>
      </SectionCardHeader>
      <SectionCardContent className="p-4">{children}</SectionCardContent>
    </SectionCard>
  );
}
