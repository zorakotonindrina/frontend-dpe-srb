import { cn } from '@/lib/utils';

export interface SectionLabelProps {
  text: string;
  color?: string;
  className?: string;
}

export function SectionLabel({ text, color = '#6b7280', className }: SectionLabelProps) {
  return (
    <p
      className={cn('mt-1 text-xs', className)}
      style={{ color }}
      data-testid="section-label"
    >
      {text}
    </p>
  );
}
