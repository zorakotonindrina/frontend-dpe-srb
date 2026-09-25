/**
 * Formateurs pour axes et tooltips Recharts.
 * Utiliser ces fonctions comme valeurs de tickFormatter / formatter
 * pour garantir un format cohérent FR sur tous les charts.
 */

/** Formate un nombre entier en notation française : 1 234 567 */
export function formatNumber(value: number): string {
  return value.toLocaleString('fr-FR');
}

/** Formate un pourcentage : 12,5 % */
export function formatPercent(value: number, decimals = 1): string {
  return value.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }) + '\u00a0%';
}

/** Formate un montant en euros : 1 234,56 € */
export function formatCurrency(value: number): string {
  return value.toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  });
}

/**
 * Formate une date ISO (YYYY-MM-DD ou YYYY-MM) pour les axes X.
 * Retourne "jan.", "fév.", etc. si le format est YYYY-MM.
 */
export function formatMonthAxis(value: string): string {
  if (!value) return '';
  const date = new Date(value + (value.length === 7 ? '-01' : ''));
  return date.toLocaleDateString('fr-FR', { month: 'short' });
}

/** Formate une date complète pour les tooltips : "15 jan. 2025" */
export function formatDateTooltip(value: string): string {
  if (!value) return '';
  const date = new Date(value);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Abrège les grands nombres pour les axes Y : 1 200 → "1,2k", 1 500 000 → "1,5M"
 */
export function formatCompactNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return (value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + 'M';
  }
  if (Math.abs(value) >= 1_000) {
    return (value / 1_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + 'k';
  }
  return formatNumber(value);
}

/**
 * Tableau des 7 couleurs AUGURE pour les séries de charts.
 * Correspond à --color-chart-1 … --color-chart-7 dans tokens.css.
 */
export const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
  'var(--color-chart-7)',
] as const;
