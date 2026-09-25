'use client';

import { useFetchProgress } from '@/providers/FetchProgressProvider';

export function GlobalProgressBar() {
  const { isFetching } = useFetchProgress();

  if (!isFetching) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[var(--z-toast)] h-[3px] overflow-hidden pointer-events-none"
      role="progressbar"
      aria-label="Chargement en cours"
      aria-busy="true"
    >
      <div className="fetch-progress-bar absolute top-0 h-full w-[45%] bg-[var(--color-primary)]" />
    </div>
  );
}
