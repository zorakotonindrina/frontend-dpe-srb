import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/chart-utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface KpiItem {
  /** Libellé de l'indicateur */
  label:    string;
  /** Valeur numérique */
  value:    number;
  /** Unité (optionnel) */
  unit?:    string;
  /** Variation (positif = vert, négatif = rouge) */
  trend?:   number;
  /** Icône décorative */
  icon?:    ReactNode;
  /** Identifiant pour data-testid */
  slug:     string;
}

export interface KpiSummaryProps {
  /** Titre du bloc */
  title?:     string;
  /** Liste des indicateurs */
  items:      KpiItem[];
  loading?:   boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function InlineTrend({ value }: { value: number }) {
  const isPositive = value > 0;
  const isNeutral  = value === 0;
  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isNeutral
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-[color:var(--color-feedback-success)]'
      : 'text-[color:var(--color-feedback-error)]';

  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs', colorClass)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {isPositive ? '+' : ''}{formatNumber(value)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* KpiSummary                                                           */
/* ------------------------------------------------------------------ */

export function KpiSummary({ title, items, loading = false, className }: KpiSummaryProps) {
  return (
    <Card className={cn('', className)}>
      {title && (
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(!title && 'pt-6')}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <dl className="divide-y divide-border">
            {items.map((item) => (
              <div
                key={item.slug}
                className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
                data-testid={`kpi-summary-item-${item.slug}`}
              >
                <dt className="flex items-center gap-2 text-sm text-muted-foreground">
                  {item.icon && (
                    <span className="text-primary" aria-hidden="true">{item.icon}</span>
                  )}
                  {item.label}
                </dt>
                <dd className="flex items-center gap-2">
                  <span className="font-semibold text-foreground">
                    {formatNumber(item.value)}
                    {item.unit && (
                      <span className="ml-0.5 text-xs font-normal text-muted-foreground">
                        {item.unit}
                      </span>
                    )}
                  </span>
                  {item.trend !== undefined && <InlineTrend value={item.trend} />}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
