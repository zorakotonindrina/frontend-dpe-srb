import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { StatCardSkeleton } from './StatCard';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface StatCardGridProps {
  children:   ReactNode;
  /** Nombre de colonnes maximum (défaut : 4) */
  columns?:   2 | 3 | 4;
  /** Affiche des skeletons à la place du contenu */
  loading?:   boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Mapping colonnes → classes Tailwind                                  */
/* ------------------------------------------------------------------ */

const GRID_COLS: Record<2 | 3 | 4, string> = {
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
};

/* ------------------------------------------------------------------ */
/* StatCardGrid                                                         */
/* ------------------------------------------------------------------ */

export function StatCardGrid({
  children,
  columns = 4,
  loading = false,
  className,
}: StatCardGridProps) {
  if (loading) {
    return (
      <div
        className={cn('grid gap-4', GRID_COLS[columns], className)}
        aria-busy="true"
      >
        {Array.from({ length: columns }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-4', GRID_COLS[columns], className)}>
      {children}
    </div>
  );
}
