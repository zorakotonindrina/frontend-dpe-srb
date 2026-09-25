'use client';

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartCard } from './ChartCard';
import { ChartTooltip } from './ChartTooltip';
import { CHART_COLORS, formatNumber } from '@/lib/chart-utils';
import type { ChartBar } from './chart.types';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface BarChartProps {
  /** Titre du graphique */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Données : tableau d'objets */
  data: Record<string, unknown>[];
  /** Définition des barres */
  bars: ChartBar[];
  /** Clé de l'axe X (catégories) */
  xKey: string;
  /**
   * Orientation du graphique.
   * - `'vertical'` (défaut) : barres verticales, catégories en X
   * - `'horizontal'` : barres horizontales, catégories en Y
   */
  layout?: 'vertical' | 'horizontal';
  /** Empile les barres */
  stacked?: boolean;
  /** Formateur des valeurs */
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
/* BarChart                                                             */
/* ------------------------------------------------------------------ */

export function BarChart({
  title,
  subtitle,
  data,
  bars,
  xKey,
  layout = 'vertical',
  stacked = false,
  yFormatter = formatNumber,
  loading = false,
  height = 300,
  action,
  className,
}: BarChartProps) {
  const isHorizontal = layout === 'horizontal';

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      action={action}
      loading={loading}
      height={height}
      className={className}
    >
      <ReBarChart
        data={data}
        layout={isHorizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          horizontal={!isHorizontal}
          vertical={isHorizontal}
        />

        {isHorizontal ? (
          <>
            <XAxis
              type="number"
              tickFormatter={yFormatter}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              width={120}
            />
          </>
        ) : (
          <>
            <XAxis
              type="category"
              dataKey={xKey}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="number"
              tickFormatter={yFormatter}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
          </>
        )}

        <Tooltip
          content={<ChartTooltip formatter={yFormatter} />}
          cursor={{ fill: 'var(--color-muted)', opacity: 0.3 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          iconType="square"
          iconSize={8}
        />

        {bars.map((bar, i) => (
          <Bar
            key={bar.key}
            dataKey={bar.key}
            name={bar.label}
            fill={bar.color ?? CHART_COLORS[i % CHART_COLORS.length]}
            stackId={stacked ? 'stack' : undefined}
            radius={stacked ? 0 : [3, 3, 0, 0]}
            maxBarSize={48}
          />
        ))}
      </ReBarChart>
    </ChartCard>
  );
}
