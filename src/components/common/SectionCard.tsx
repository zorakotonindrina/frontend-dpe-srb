'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

function SectionCard({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & { size?: 'default' | 'sm' }) {
  return (
    <div
      data-slot="section-card"
      data-size={size}
      className={cn(
        'group/section-card overflow-hidden rounded-sm border border-border border-t-2 border-t-orange-400 bg-card shadow-sm',
        className
      )}
      {...props}
    />
  );
}

function SectionCardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="section-card-header"
      className={cn(
        'flex items-center justify-between border-b border-border bg-muted/60 px-4 py-2.5',
        'group-data-[size=sm]/section-card:px-3 group-data-[size=sm]/section-card:py-2',
        className
      )}
      {...props}
    />
  );
}

function SectionCardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="section-card-title"
      className={cn(
        'text-sm font-semibold text-foreground',
        'group-data-[size=sm]/section-card:text-xs',
        className
      )}
      {...props}
    />
  );
}

function SectionCardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="section-card-action"
      className={cn('flex items-center gap-2', className)}
      {...props}
    />
  );
}

function SectionCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="section-card-content"
      className={cn(
        'px-4 py-4',
        'group-data-[size=sm]/section-card:px-3 group-data-[size=sm]/section-card:py-3',
        className
      )}
      {...props}
    />
  );
}

function SectionCardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="section-card-footer"
      className={cn(
        'flex items-center border-t border-border bg-muted/30 px-4 py-3',
        'group-data-[size=sm]/section-card:px-3 group-data-[size=sm]/section-card:py-2',
        className
      )}
      {...props}
    />
  );
}

export {
  SectionCard,
  SectionCardHeader,
  SectionCardTitle,
  SectionCardAction,
  SectionCardContent,
  SectionCardFooter,
};
