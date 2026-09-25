'use client';

import {
  AreaChart as ReAreaChart,
  Area,
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

export interface AreaChartProps {
  /** Titre du graphique */
  title: string;
  /** Sous-titre optionnel */
  subtitle?: string;
  /** Données : tableau d'objets (clé xKey + clés des séries) */
  data: Record<string, unknown>[];
  /** Définition des séries (utilise ChartLine pour cohérence) */
  areas: ChartLine[];
  /** Clé de l'axe X dans les données */
  xKey: string;
  /** Empile les aires */
  stacked?: boolean;
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
/* AreaChart                                                            */
/* ------------------------------------------------------------------ */

export function AreaChart({
  title,
  subtitle,
  data,
  areas,
  xKey,
  stacked = false,
  yFormatter = formatNumber,
  loading = false,
  height = 300,
  action,
  className,
}: AreaChartProps) {
  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      action={action}
      loading={loading}
      height={height}
      className={className}
    >
      <ReAreaChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <defs>
          {areas.map((area, i) => {
            const color = area.color ?? CHART_COLORS[i % CHART_COLORS.length];
            return (
              <linearGradient key={area.key} id={`gradient-${area.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>

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

        {areas.map((area, i) => {
          const color = area.color ?? CHART_COLORS[i % CHART_COLORS.length];
          return (
            <Area
              key={area.key}
              type={area.curveType ?? 'monotone'}
              dataKey={area.key}
              name={area.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#gradient-${area.key})`}
              stackId={stacked ? 'stack' : undefined}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          );
        })}
      </ReAreaChart>
    </ChartCard>
  );
}
