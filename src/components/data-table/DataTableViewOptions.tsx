'use client';

import type { Table } from '@tanstack/react-table';
import { Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
}

/* ------------------------------------------------------------------ */
/* DataTableViewOptions — sélecteur de colonnes visibles               */
/* ------------------------------------------------------------------ */

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  const hideable = table
    .getAllColumns()
    .filter((col) => typeof col.accessorFn !== 'undefined' && col.getCanHide());

  if (!hideable.length) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="ml-auto h-8 gap-1.5">
            <Settings2 className="h-4 w-4" />
            Colonnes
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuLabel>Colonnes visibles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideable.map((col) => (
          <DropdownMenuCheckboxItem
            key={col.id}
            checked={col.getIsVisible()}
            onCheckedChange={(checked) => col.toggleVisibility(!!checked)}
          >
            {typeof col.columnDef.header === 'string'
              ? col.columnDef.header
              : col.id}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
