'use client';

import { formatNumber } from '@/lib/chart-utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface ChartTooltipProps {
  active?:         boolean;
  payload?:        Array<{ name?: string; value?: number | string; color?: string }>;
  label?:          string | number;
  /** Formateur de valeur (ex. formatPercent, formatCurrency) */
  formatter?:      (value: number) => string;
  /** Label de l'axe X personnalisé (ex. formatDateTooltip) */
  labelFormatter?: (label: string) => string;
}

/* ------------------------------------------------------------------ */
/* ChartTooltip — tooltip standard AUGURE                              */
/* ------------------------------------------------------------------ */

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
  labelFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const displayLabel = labelFormatter ? labelFormatter(String(label)) : String(label ?? '');

  return (
    <div
      className="rounded-[var(--radius-md)] border border-border bg-popover px-3 py-2 shadow-lg text-sm text-popover-foreground"
      role="tooltip"
    >
      {displayLabel && (
        <p className="mb-1.5 font-medium text-foreground">{displayLabel}</p>
      )}
      <ul className="space-y-1">
        {payload.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-muted-foreground">{item.name}</span>
            <span className="ml-auto pl-4 font-semibold tabular-nums">
              {formatter
                ? formatter(Number(item.value))
                : formatNumber(Number(item.value))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
