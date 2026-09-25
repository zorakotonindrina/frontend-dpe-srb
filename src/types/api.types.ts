/**
 * Types génériques pour la communication API.
 */

/** Réponse paginée standard du backend Java */
export interface PaginatedResponse<T> {
  content:       T[];
  totalElements: number;
  totalPages:    number;
  number:        number;   // page courante (0-based)
  size:          number;
  first:         boolean;
  last:          boolean;
  empty:         boolean;
}

/** Erreur API normalisée */
export interface ApiErrorResponse {
  status:    number;
  message:   string;
  timestamp: string;
  path?:     string;
  errors?:   Record<string, string>;  // erreurs de validation par champ
}

/** Paramètres de pagination communs */
export interface PaginationParams {
  page?: number;
  size?: number;
}

/** Paramètres de tri communs */
export interface SortParams {
  sort?:      string;   // ex: "nom,asc"
  direction?: 'asc' | 'desc';
}

/** État générique d'une ressource asynchrone */
export type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };
