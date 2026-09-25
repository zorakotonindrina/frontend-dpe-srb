/**
 * Types partagés pour les composants charts AUGURE.
 * Basés sur Recharts avec la palette de tokens CSS.
 */

/** Point de données générique pour les séries temporelles */
export interface ChartDataPoint {
  /** Valeur de l'axe X (date ISO, mois, label) */
  x: string;
  /** Valeur numérique */
  y: number;
}

/** Définition d'une ligne pour LineChart et AreaChart */
export interface ChartLine {
  /** Clé de la donnée dans le tableau de données */
  key: string;
  /** Label affiché dans la légende et le tooltip */
  label: string;
  /** Couleur CSS (défaut : auto depuis CHART_COLORS) */
  color?: string;
  /** Type de courbe (défaut : "monotone") */
  curveType?: 'monotone' | 'linear' | 'step';
}

/** Définition d'une barre pour BarChart */
export interface ChartBar {
  /** Clé de la donnée dans le tableau de données */
  key: string;
  /** Label affiché dans la légende et le tooltip */
  label: string;
  /** Couleur CSS (défaut : auto depuis CHART_COLORS) */
  color?: string;
}

/** Entrée de données pour PieChart et DonutChart */
export interface ChartPieEntry {
  /** Label de la tranche */
  name: string;
  /** Valeur numérique */
  value: number;
  /** Couleur CSS (défaut : auto depuis CHART_COLORS) */
  color?: string;
}

/** Payload d'un item de tooltip Recharts */
export interface ChartTooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
  payload: Record<string, unknown>;
}
