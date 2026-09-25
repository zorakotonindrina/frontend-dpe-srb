import { cn } from '@/lib/utils';

export interface PageTitleProps {
  text: string;
  color?: string;
  className?: string;
}

export function PageTitle({ text, color = '#1e3461', className }: PageTitleProps) {
  return (
    <p
      className={cn('mt-2 text-[2rem] font-bold tracking-tight leading-tight', className)}
      style={{ color }}
      data-testid="page-title"
    >
      {text}
    </p>
  );
}
