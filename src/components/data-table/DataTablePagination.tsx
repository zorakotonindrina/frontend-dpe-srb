'use client';

import type { Table } from '@tanstack/react-table';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  serverSide?: boolean;
  totalRows?: number;
  /** Nombre de boutons de page visibles à la fois (défaut : 5) */
  windowSize?: number;
}

/* ------------------------------------------------------------------ */
/* DataTablePagination                                                  */
/* ------------------------------------------------------------------ */

export function DataTablePagination<TData>({
  table,
  serverSide = false,
  totalRows: totalRowsProp,
  windowSize = 5,
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const totalRows = serverSide ? (totalRowsProp ?? 0) : table.getFilteredRowModel().rows.length;
  const start     = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const end       = Math.min((pageIndex + 1) * pageSize, totalRows);
  const pageCount = table.getPageCount() || 1;

  /* Fenêtre glissante de `windowSize` numéros centrée sur la page courante */
  const half      = Math.floor(windowSize / 2);
  const winStart  = Math.max(0, Math.min(pageIndex - half, pageCount - windowSize));
  const winEnd    = Math.min(pageCount, winStart + windowSize);
  const pageWindow = Array.from({ length: winEnd - winStart }, (_, i) => winStart + i);

  const navCls = 'text-sm text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors';

  return (
    <div
      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-1"
      data-testid="datatable-pagination"
    >
      {/* Compteur */}
      <span className="text-sm text-muted-foreground tabular-nums">
        Afficher {start} à {end} sur {totalRows} ligne(s)
      </span>

      {/* Navigation */}
      <div className="flex items-center gap-0.5">
        <button
          type="button"
          className={navCls}
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          Première
        </button>

        <span className="px-1 text-muted-foreground select-none">·</span>

        <button
          type="button"
          className={navCls}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          data-testid="datatable-page-prev"
        >
          Précédente
        </button>

        <span className="px-1 text-muted-foreground select-none">·</span>

        {/* Numéros de page — fenêtre de windowSize */}
        {winStart > 0 && (
          <span className="px-1 text-muted-foreground select-none">…</span>
        )}

        {pageWindow.map((i) => (
          <button
            key={i}
            type="button"
            onClick={() => table.setPageIndex(i)}
            className={cn(
              'h-7 min-w-[1.75rem] px-2 text-sm rounded transition-colors',
              pageIndex === i
                ? 'border border-border bg-background font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {i + 1}
          </button>
        ))}

        {winEnd < pageCount && (
          <span className="px-1 text-muted-foreground select-none">…</span>
        )}

        <span className="px-1 text-muted-foreground select-none">·</span>

        <button
          type="button"
          className={navCls}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          data-testid="datatable-page-next"
        >
          Suivante
        </button>

        <span className="px-1 text-muted-foreground select-none">·</span>

        <button
          type="button"
          className={navCls}
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
        >
          Dernière
        </button>
      </div>
    </div>
  );
}
