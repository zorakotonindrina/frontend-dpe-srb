import { cn } from '@/lib/utils';

export interface PageHeadingProps {
  text: string;
  color?: string;
  className?: string;
}

export function PageHeading({ text, color = '#1f2937', className }: PageHeadingProps) {
  return (
    <h1
      className={cn('text-2xl tracking-tight', className)}
      style={{ color }}
      data-testid="page-heading"
    >
      {text}
    </h1>
  );
}
