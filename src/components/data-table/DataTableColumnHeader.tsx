'use client';

import type { Column } from '@tanstack/react-table';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  title: string;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* DataTableColumnHeader — header tri cliquable (asc/desc/none)        */
/* ------------------------------------------------------------------ */

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span className={cn('text-xs font-bold', className)}>{title}</span>;
  }

  const sorted = column.getIsSorted();

  return (
    <button
      type="button"
      className={cn('flex items-center gap-1 text-xs font-bold hover:opacity-80 cursor-pointer', className)}
      onClick={() => column.toggleSorting(sorted === 'asc')}
      aria-label={`Trier par ${title}`}
    >
      <span>{title}</span>
      {sorted === 'asc'  && <ArrowUp   className="h-3 w-3" />}
      {sorted === 'desc' && <ArrowDown className="h-3 w-3" />}
      {!sorted           && <ArrowUp   className="h-3 w-3 opacity-40" />}
    </button>
  );
}
