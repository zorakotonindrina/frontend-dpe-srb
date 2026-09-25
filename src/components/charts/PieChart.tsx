'use client';

import {
  PieChart as RePieChart,
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

export interface PieChartProps {
  /** Titre du graphique */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Entrées de la répartition */
  data: ChartPieEntry[];
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
/* PieTooltip                                                           */
/* ------------------------------------------------------------------ */

function PieTooltip({
  active,
  payload,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: ChartPieEntry }>;
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
/* PieChart                                                             */
/* ------------------------------------------------------------------ */

export function PieChart({
  title,
  subtitle,
  data,
  formatter,
  loading = false,
  height = 300,
  action,
  className,
}: PieChartProps) {
  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      action={action}
      loading={loading}
      height={height}
      className={className}
    >
      <RePieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius="75%"
          paddingAngle={2}
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell
              key={`cell-${i}`}
              fill={entry.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip content={<PieTooltip formatter={formatter} />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
      </RePieChart>
    </ChartCard>
  );
}
