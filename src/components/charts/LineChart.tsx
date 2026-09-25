'use client';

import {
  LineChart as ReLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartCard } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { CHART_COLORS, formatNumber } from '@/lib/chart-utils';
import type { ChartLine } from './chart.types';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface LineChartProps {
  /** Titre du graphique (affiché dans ChartCard) */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Données : tableau d'objets (clé xKey + clés des lignes) */
  data: Record<string, unknown>[];
  /** Définition des lignes à tracer */
  lines: ChartLine[];
  /** Clé de l'axe X dans les données */
  xKey: string;
  /** Formateur des valeurs Y (axes + tooltip) */
  yFormatter?: (value: number) => string;
  /** Affiche le skeleton de chargement */
  loading?: boolean;
  /** Hauteur du graphique (défaut : 300) */
  height?: number;
  /** Slot action dans l'en-tête */
  action?: React.ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* LineChart                                                            */
/* ------------------------------------------------------------------ */

export function LineChart({
  title,
  subtitle,
  data,
  lines,
  xKey,
  yFormatter = formatNumber,
  loading = false,
  height = 300,
  action,
  className,
}: LineChartProps) {
  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      action={action}
      loading={loading}
      height={height}
      className={className}
      data-testid="chart-effectifs"
    >
      <ReLineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={yFormatter}
          tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          content={<ChartTooltip formatter={yFormatter} />}
          cursor={{ stroke: 'var(--color-border)', strokeWidth: 1 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="circle"
          iconSize={8}
        />
        {lines.map((line, i) => (
          <Line
            key={line.key}
            type={line.curveType ?? 'monotone'}
            dataKey={line.key}
            name={line.label}
            stroke={line.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </ReLineChart>
    </ChartCard>
  );
}
