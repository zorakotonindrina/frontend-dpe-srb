'use client';

import { useEffect, useRef, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTranslations } from 'next-intl';
import { EmptyState } from '@/components/feedback/EmptyState';
import { DataTableToolbar } from './DataTableToolbar';
import { DataTablePagination } from './DataTablePagination';
import type { FacetedFilterDef, RowAction } from './data-table.types';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  /** @deprecated — la recherche est désormais globale (toutes colonnes) */
  searchColumn?: string;
  filters?: FacetedFilterDef[];
  rowActions?: (row: TData) => RowAction<TData>[];
  loading?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onRowClick?: (row: TData) => void;
  className?: string;
  serverSide?: boolean;
  totalRows?: number;
  onPaginationChange?: (pageIndex: number, pageSize: number) => void;
  onSearchChange?: (search: string) => void;
  exportable?: boolean;
  exportFilename?: string;
  paginationResetKey?: string | number;
}

/* ------------------------------------------------------------------ */

const SKELETON_ROW_COUNT = 8;

/* ------------------------------------------------------------------ */
/* DataTable                                                            */
/* ------------------------------------------------------------------ */

export function DataTable<TData, TValue>({
  columns,
  data,
  filters,
  loading = false,
  pageSize = 5,
  pageSizeOptions = [5, 10, 25, 50],
  onRowClick,
  className,
  serverSide = false,
  totalRows = 0,
  onPaginationChange,
  onSearchChange,
  exportable = true,
  exportFilename,
  paginationResetKey,
}: DataTableProps<TData, TValue>) {
  const t = useTranslations('common');
  const [sorting, setSorting]             = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection]   = useState({});
  const [globalFilter, setGlobalFilter]   = useState('');
  const [pagination, setPagination]       = useState<PaginationState>({ pageIndex: 0, pageSize });
  const mountedRef = useRef(false);
  const paginationResetMountedRef = useRef(false);
  const paginationRef = useRef(pagination);
  const onPaginationChangeRef = useRef(onPaginationChange);
  const onSearchChangeRef = useRef(onSearchChange);

  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    onPaginationChangeRef.current = onPaginationChange;
    onSearchChangeRef.current = onSearchChange;
  }, [onPaginationChange, onSearchChange]);

  useEffect(() => {
    if (paginationResetKey === undefined) return;

    if (!paginationResetMountedRef.current) {
      paginationResetMountedRef.current = true;
      return;
    }

    setPagination((currentPagination) => (
      currentPagination.pageIndex === 0
        ? currentPagination
        : { ...currentPagination, pageIndex: 0 }
    ));
  }, [paginationResetKey]);

  useEffect(() => {
    if (!serverSide || !onSearchChangeRef.current) return;

    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const currentPagination = paginationRef.current;
      if (currentPagination.pageIndex !== 0) {
        setPagination({ pageIndex: 0, pageSize: currentPagination.pageSize });
      }
      onPaginationChangeRef.current?.(0, currentPagination.pageSize);
      onSearchChangeRef.current?.(globalFilter);
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [globalFilter, serverSide]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    ...(serverSide && {
      manualPagination: true,
      manualFiltering: true,
      pageCount: Math.max(1, Math.ceil(totalRows / pagination.pageSize)),
    }),
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      if (next.pageIndex === pagination.pageIndex && next.pageSize === pagination.pageSize) return;
      setPagination(next);
      if (serverSide) onPaginationChange?.(next.pageIndex, next.pageSize);
    },
    enableRowSelection: true,
    onSortingChange:          setSorting,
    onColumnFiltersChange:    setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange:     setRowSelection,
    onGlobalFilterChange:     setGlobalFilter,
    getCoreRowModel:       getCoreRowModel(),
    ...(!serverSide && {
      getFilteredRowModel: getFilteredRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    }),
    getSortedRowModel:     getSortedRowModel(),
  });

  const colCount = columns.length;

  return (
    <div className={cn('flex flex-col gap-3', className)}>

      {/* Toolbar : Afficher N ligne(s) + Rechercher (toutes colonnes) */}
      <div className="px-4 pt-3">
        <DataTableToolbar
          table={table}
          filters={filters}
          pageSizeOptions={pageSizeOptions}
          onSearchChange={serverSide ? undefined : onSearchChange}
          exportable={exportable}
          exportFilename={exportFilename}
        />
      </div>

      {/* Table */}
      <div className="border-t border-border overflow-hidden">
        <Table data-testid="agent-table">

          {/* En-tête gris foncé */}
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow
                key={hg.id}
                className="hover:bg-transparent border-none"
                style={{ backgroundColor: '#6c757d' }}
              >
                {hg.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-white font-bold text-xs py-2.5 border-r border-white/20 last:border-r-0"
                    style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          {/* Corps */}
          <TableBody>
            {loading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, rowIdx) => (
                <TableRow key={`skeleton-${rowIdx}`} data-testid="datatable-skeleton-row">
                  {Array.from({ length: colCount }).map((_, colIdx) => (
                    <TableCell key={colIdx}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, idx) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? 'selected' : undefined}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  className={cn(
                    'border-b border-gray-200 text-sm',
                    idx % 2 === 0 ? 'bg-white' : 'bg-gray-50',
                    onRowClick && 'cursor-pointer hover:bg-blue-50',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={colCount} className="h-48 p-0">
                  <div data-testid="datatable-empty-state" className="flex h-full items-center justify-center">
                    <EmptyState
                      title={t('noResults')}
                      description={t('noResultsDescription')}
                    />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

        </Table>
      </div>

      {/* Pagination */}
      {!loading && (
        <div className="px-4 pb-3">
          <DataTablePagination table={table} serverSide={serverSide} totalRows={totalRows} />
        </div>
      )}

    </div>
  );
}
