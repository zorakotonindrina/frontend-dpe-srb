'use client';

import type { Table } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTableFacetedFilter } from './DataTableFacetedFilter';
import type { FacetedFilterDef } from './data-table.types';
import { exportToExcel } from './exportToExcel';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  filters?: FacetedFilterDef[];
  pageSizeOptions?: number[];
  onSearchChange?: (value: string) => void;
  exportable?: boolean;
  exportFilename?: string;
}

/* ------------------------------------------------------------------ */
/* DataTableToolbar                                                     */
/* ------------------------------------------------------------------ */

export function DataTableToolbar<TData>({
  table,
  filters,
  pageSizeOptions = [5, 10, 25, 50],
  onSearchChange,
  exportable = true,
  exportFilename,
}: DataTableToolbarProps<TData>) {
  const { pageSize } = table.getState().pagination;
  const globalFilter  = (table.getState().globalFilter as string) ?? '';

  return (
    <div
      className="flex items-center justify-between gap-4"
      data-testid="datatable-toolbar"
    >
      {/* Gauche : sélecteur de lignes/page */}
      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <span>Afficher</span>
        <select
          value={pageSize}
          onChange={(e) => table.setPageSize(Number(e.target.value))}
          className="h-7 rounded border border-input bg-background px-1 text-sm focus:outline-none"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
        <span>ligne(s)</span>
      </div>

      {/* Droite : facettes + recherche toutes colonnes + export */}
      <div className="flex items-center gap-2">
        {filters?.map((filterDef) => (
          <DataTableFacetedFilter
            key={filterDef.columnId}
            column={table.getColumn(filterDef.columnId)}
            filterDef={filterDef}
          />
        ))}

        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>Rechercher</span>
          <Input
            value={globalFilter}
            onChange={(e) => { table.setGlobalFilter(e.target.value); onSearchChange?.(e.target.value); }}
            placeholder="Recherche..."
            className="h-7 w-48"
            data-testid="datatable-search-input"
          />
        </div>

        {exportable && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportToExcel(table, exportFilename)}
            data-testid="datatable-export-button"
            aria-label="Exporter en Excel"
          >
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
            Exporter
          </Button>
        )}
      </div>
    </div>
  );
}
