'use client';

import type { ReactNode, ReactElement } from 'react';
import { useId } from 'react';
import { ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface ChartCardProps {
  /** Titre du graphique */
  title: string;
  /** Sous-titre / description */
  subtitle?: string;
  /** Slot action (bouton export, sélecteur de période…) */
  action?: ReactNode;
  /** Affiche un skeleton pendant le chargement */
  loading?: boolean;
  /** Hauteur du chart en px (défaut : 300) */
  height?: number;
  children: ReactNode;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* ChartCard                                                            */
/* ------------------------------------------------------------------ */

export function ChartCard({
  title,
  subtitle,
  action,
  loading = false,
  height = 300,
  children,
  className,
}: ChartCardProps) {
  const titleId = useId();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <CardTitle id={titleId} className="text-base font-semibold">{title}</CardTitle>
          {subtitle && (
            <CardDescription className="mt-0.5">{subtitle}</CardDescription>
          )}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
      </CardHeader>

      <CardContent className="pt-0">
        {loading ? (
          <Skeleton
            style={{ height }}
            className="w-full rounded-[var(--radius-md)]"
            aria-busy="true"
            aria-label="Chargement du graphique…"
          />
        ) : (
          <div
            role="img"
            aria-labelledby={titleId}
            style={{ height }}
          >
            <ResponsiveContainer width="100%" height="100%">
              {children as ReactElement}
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
