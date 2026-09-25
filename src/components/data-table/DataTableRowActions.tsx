'use client';

import type { Row } from '@tanstack/react-table';
import type { RowAction } from './data-table.types';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: RowAction<TData>[];
}

/* ------------------------------------------------------------------ */
/* DataTableRowActions — boutons directs par ligne                     */
/* ------------------------------------------------------------------ */

export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
  if (!actions.length) return null;

  return (
    <div className="flex items-center gap-1">
      {actions.map((action, i) => (
        <button
          key={i}
          type="button"
          disabled={action.disabled}
          onClick={(e) => {
            e.stopPropagation();
            action.onClick(row);
          }}
          aria-label={action.label}
          title={action.label}
          data-testid={action.testId}
          style={{ backgroundColor: '#2da9d7' }}
          className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-sm text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 transition-opacity"
        >
          {action.icon && <action.icon className="h-4 w-4" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
