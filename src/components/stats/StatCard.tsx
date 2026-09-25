import type { ReactNode } from 'react';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/chart-utils';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface StatCardTrend {
  /** Valeur de la variation (ex. 12 pour +12 %) */
  value:     number;
  /** Unité de la variation (ex. "%" ou "agents") */
  unit?:     string;
  /** Période de référence (ex. "vs mois dernier") */
  label?:    string;
}

export interface StatCardProps {
  /** Titre de l'indicateur */
  title:      string;
  /** Valeur numérique principale */
  value:      number;
  /** Unité affichée après la valeur (ex. "agents", "%") */
  unit?:      string;
  /** Icône illustrative */
  icon?:      ReactNode;
  /** Tendance : positif = success, négatif = error */
  trend?:     StatCardTrend;
  /**
   * Si fourni, la carte est cliquable et navigue vers cette URL.
   * Utilise next/link pour la navigation côté client.
   */
  href?:      string;
  /** Identifiant du slug utilisé pour le data-testid ("stat-card-{slug}") */
  slug:       string;
  /** Contenu additionnel (ex. MiniChart) */
  children?:  ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function TrendIndicator({ trend }: { trend: StatCardTrend }) {
  const isPositive = trend.value > 0;
  const isNeutral  = trend.value === 0;

  const Icon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;
  const colorClass = isNeutral
    ? 'text-muted-foreground'
    : isPositive
      ? 'text-[color:var(--color-feedback-success)]'
      : 'text-[color:var(--color-feedback-error)]';

  const sign = isPositive ? '+' : '';

  return (
    <span
      className={cn('inline-flex items-center gap-1 text-xs font-medium', colorClass)}
      aria-label={`Tendance : ${sign}${trend.value}${trend.unit ?? ''} ${trend.label ?? ''}`.trim()}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {sign}{formatNumber(trend.value)}{trend.unit}
      {trend.label && (
        <span className="font-normal text-muted-foreground">{trend.label}</span>
      )}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* StatCard                                                             */
/* ------------------------------------------------------------------ */

export function StatCard({
  title,
  value,
  unit,
  icon,
  trend,
  href,
  slug,
  children,
  className,
}: StatCardProps) {
  const content = (
    <Card
      className={cn(
        'relative overflow-hidden transition-shadow',
        href && 'cursor-pointer hover:shadow-md',
        className,
      )}
      data-testid={`stat-card-${slug}`}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && (
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="text-2xl font-bold text-foreground">
              {formatNumber(value)}
              {unit && (
                <span className="ml-1 text-base font-medium text-muted-foreground">
                  {unit}
                </span>
              )}
            </p>
            {trend && (
              <div className="mt-1">
                <TrendIndicator trend={trend} />
              </div>
            )}
          </div>

          {/* Slot MiniChart ou autre contenu */}
          {children && (
            <div className="shrink-0">{children}</div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}

/* ------------------------------------------------------------------ */
/* StatCardSkeleton                                                     */
/* ------------------------------------------------------------------ */

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <Card
      className={cn('relative overflow-hidden', className)}
      data-testid="stat-card-skeleton"
      aria-busy="true"
      aria-label="Chargement de l'indicateur…"
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-9 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-7 w-20 mb-2" />
        <Skeleton className="h-3.5 w-32" />
      </CardContent>
    </Card>
  );
}
