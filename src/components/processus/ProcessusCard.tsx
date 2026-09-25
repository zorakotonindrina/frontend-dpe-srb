import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface ProcessusCardProps {
  /** Code du processus (ex. "VA_EXPERTISE") — utilisé pour le data-testid */
  code: string;
  /** Libellé du processus */
  title: string;
  /** Description courte (réutilise processus.<key>.subtitle) */
  description?: string;
  /** Route de création du processus */
  href: string;
  /** Icône illustrative */
  icon: LucideIcon;
  className?: string;
}

export function ProcessusCard({ code, title, description, href, icon: Icon, className }: ProcessusCardProps) {
  return (
    <Link
      href={href}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      data-testid={`processus-card-${code}`}
    >
      <Card className={cn('h-full transition-shadow hover:shadow-md', className)}>
        <CardContent className="flex items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-foreground">{title}</p>
            {description && (
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            aria-hidden="true"
          />
        </CardContent>
      </Card>
    </Link>
  );
}
