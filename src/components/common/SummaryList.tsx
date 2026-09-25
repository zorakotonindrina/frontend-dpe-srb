import type { ReactNode } from 'react';

export interface SummaryItem {
  label: string;
  value: ReactNode;
}

export interface SummaryListProps {
  items: SummaryItem[];
}

/** Récapitulatif en lecture seule pour l'étape de confirmation des assistants multi-étapes. */
export function SummaryList({ items }: SummaryListProps) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="summary-list">
      {items.map((item, i) => (
        <div key={i} className="min-w-0">
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd className="truncate text-sm text-foreground">
            {item.value === undefined || item.value === null || item.value === '' ? '—' : item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
