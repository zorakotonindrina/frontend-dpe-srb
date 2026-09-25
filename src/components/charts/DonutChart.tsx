'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartCard } from './ChartCard';
import { CHART_COLORS, formatNumber } from '@/lib/chart-utils';
import type { ChartPieEntry } from './chart.types';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface DonutChartProps {
  /** Titre du graphique */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Entrées de la répartition */
  data: ChartPieEntry[];
  /** Label central (ex. "Total", "Agents") */
  centerLabel?: string;
  /** Valeur centrale (ex. "1 842") */
  centerValue?: string;
  /** Formateur de valeur pour le tooltip */
  formatter?: (value: number) => string;
  /** Affiche le skeleton de chargement */
  loading?: boolean;
  /** Hauteur du graphique (défaut : 300) */
  height?: number;
  /** Slot action dans l'en-tête */
  action?: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* DonutTooltip                                                         */
/* ------------------------------------------------------------------ */

function DonutTooltip({
  active,
  payload,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
  formatter?: (value: number) => string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-[var(--radius-md)] border border-border bg-popover px-3 py-2 shadow-lg text-sm text-popover-foreground">
      <p className="font-medium">{item.name}</p>
      <p className="tabular-nums font-semibold mt-0.5">
        {formatter ? formatter(item.value) : formatNumber(item.value)}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* CenterLabel — label personnalisé au centre du donut                 */
/* ------------------------------------------------------------------ */

function CenterLabel({
  cx,
  cy,
  label,
  value,
}: {
  cx: number;
  cy: number;
  label?: string;
  value?: string;
}) {
  return (
    <g>
      {value && (
        <text
          x={cx}
          y={cy - (label ? 8 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-foreground"
          style={{ fontSize: 20, fontWeight: 700, fill: 'var(--color-foreground)' }}
        >
          {value}
        </text>
      )}
      {label && (
        <text
          x={cx}
          y={cy + (value ? 18 : 0)}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
        >
          {label}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* DonutChart                                                           */
/* ------------------------------------------------------------------ */

export function DonutChart({
  title,
  subtitle,
  data,
  centerLabel,
  centerValue,
  formatter,
  loading = false,
  height = 300,
  action,
  className,
}: DonutChartProps) {
  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      action={action}
      loading={loading}
      height={height}
      className={className}
      data-testid="chart-grades"
    >
      <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="75%"
          paddingAngle={2}
          strokeWidth={0}
          labelLine={false}
          label={({ cx, cy }) =>
            centerLabel || centerValue ? (
              <CenterLabel
                cx={cx as number}
                cy={cy as number}
                label={centerLabel}
                value={centerValue}
              />
            ) : null
          }
        >
          {data.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={entry.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<DonutTooltip formatter={formatter} />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ChartCard>
  );
}
