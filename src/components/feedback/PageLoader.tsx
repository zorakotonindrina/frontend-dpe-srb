import { LoadingSpinner } from './LoadingSpinner';

export interface PageLoaderProps {
  label?: string;
}

export function PageLoader({ label = 'Chargement de la page…' }: PageLoaderProps) {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      data-testid="page-loader"
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <LoadingSpinner size="lg" label={label} />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
