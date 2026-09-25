'use client';

import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/chart-utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface MiniChartDataPoint {
  /** Label de l'axe X (ex. mois "jan.", "fév.") — affiché dans le tooltip */
  label: string;
  /** Valeur numérique */
  value: number;
}

export interface MiniChartProps {
  data:        MiniChartDataPoint[];
  /** Couleur de la ligne (défaut : var(--color-chart-1)) */
  color?:      string;
  /** Hauteur du sparkline en px (défaut : 48) */
  height?:     number;
  /** Largeur du sparkline en px (défaut : 96) */
  width?:      number;
  /** Unité affichée dans le tooltip */
  unit?:       string;
  className?:  string;
  /** Accessibilité : description du graphique */
  ariaLabel?:  string;
}

/* ------------------------------------------------------------------ */
/* Tooltip minimaliste                                                  */
/* ------------------------------------------------------------------ */

interface MiniTooltipInternalProps {
  active?: boolean;
  payload?: Array<{ value?: number | string; payload?: { label?: string } }>;
  unit?: string;
}

function MiniTooltip({ active, payload, unit }: MiniTooltipInternalProps) {
  if (!active || !payload?.length) return null;
  const point = payload[0];
  return (
    <div className="rounded border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md">
      <span className="font-medium">
        {formatNumber(Number(point?.value))}{unit}
      </span>
      {point?.payload?.label && (
        <span className="ml-1 text-muted-foreground">{point.payload.label}</span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MiniChart                                                            */
/* ------------------------------------------------------------------ */

export function MiniChart({
  data,
  color   = 'var(--color-chart-1)',
  height  = 48,
  width   = 96,
  unit,
  className,
  ariaLabel = 'Graphique sparkline',
}: MiniChartProps) {
  return (
    <div
      className={cn('', className)}
      role="img"
      aria-label={ariaLabel}
      style={{ width, height }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Tooltip
            content={(props) => <MiniTooltip {...(props as unknown as MiniTooltipInternalProps)} unit={unit} />}
            cursor={false}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
