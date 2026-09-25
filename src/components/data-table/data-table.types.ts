import type { Row } from '@tanstack/react-table';

/* ------------------------------------------------------------------ */
/* FacetedFilterDef — définition d'un filtre par facette               */
/* ------------------------------------------------------------------ */

export interface FacetedFilterOption {
  /** Valeur de filtre (doit correspondre aux valeurs de la colonne) */
  value: string;
  /** Label affiché dans la liste */
  label: string;
  /** Icône optionnelle */
  icon?: React.ComponentType<{ className?: string }>;
}

export interface FacetedFilterDef {
  /** Clé de la colonne TanStack Table à filtrer */
  columnId: string;
  /** Label du filtre affiché dans le bouton */
  title: string;
  /** Options disponibles */
  options: FacetedFilterOption[];
}

/* ------------------------------------------------------------------ */
/* RowAction — action du menu contextuel par ligne                     */
/* ------------------------------------------------------------------ */

export interface RowAction<TData = unknown> {
  /** Label de l'action */
  label: string;
  /** Icône optionnelle (composant Lucide) */
  icon?: React.ComponentType<{ className?: string }>;
  /** Callback appelé avec la ligne */
  onClick: (row: Row<TData>) => void;
  /** Variante destructive (rouge) */
  destructive?: boolean;
  /** Désactive l'action */
  disabled?: boolean;
  /** Séparateur avant cette action */
  separator?: boolean;
  /** Identifiant pour les tests E2E */
  testId?: string;
}
