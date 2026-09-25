import {
  LayoutDashboard,
  Car,
  IdCard,
  FolderOpen,
  Search,
  ListTodo,
  FileStack,
  BarChart3,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface SubNavItem {
  labelKey: string;
  href:     string;
  segment:  string;
}

export interface NavItem {
  labelKey:  string;
  href?:     string;
  icon:      LucideIcon;
  segment?:  string;
  children?: SubNavItem[];
}

export interface NavSection {
  type:     'section';
  labelKey: string;
}

export type NavEntry = NavItem | NavSection;

/* ------------------------------------------------------------------ */
/* Menu principal — Plateforme BSCVA                                   */
/* ------------------------------------------------------------------ */

export const BSCVA_MENU: NavEntry[] = [
  {
    labelKey: 'dashboard',
    href:     ROUTES.DASHBOARD,
    icon:     LayoutDashboard,
    segment:  '',
  },

  {
    labelKey: 'vehicules',
    href:     ROUTES.VEHICULES,
    icon:     Car,
    segment:  'vehicules',
  },

  {
    labelKey: 'chauffeurs',
    href:     ROUTES.CHAUFFEURS,
    icon:     IdCard,
    segment:  'chauffeurs',
  },

  {
    labelKey: 'dossiers',
    href:     ROUTES.DOSSIERS,
    icon:     FolderOpen,
    segment:  'dossiers',
  },
  {
    labelKey: 'traitementDossier',
    href:     ROUTES.DOSSIER_TRAITEMENT,
    icon:     Search,
    segment:  'dossiers/traitement',
  },

  // ── Section : Suivi ─────────────────────────────────────────────────
  { type: 'section', labelKey: 'suivi' },

  {
    labelKey: 'mesTaches',
    href:     ROUTES.WORKFLOW_MES_TACHES,
    icon:     ListTodo,
    segment:  'workflow/mes-taches',
  },
  {
    labelKey: 'documents',
    href:     ROUTES.DOCUMENTS,
    icon:     FileStack,
    segment:  'documents',
  },
  {
    labelKey: 'reporting',
    href:     ROUTES.REPORTING,
    icon:     BarChart3,
    segment:  'reporting',
  },

  // ── Section : Administration ─────────────────────────────────────────
  { type: 'section', labelKey: 'administration' },

  {
    labelKey: 'administration',
    icon:     Settings,
    segment:  'administration',
    children: [
      { labelKey: 'utilisateurs', href: ROUTES.ADMINISTRATION_UTILISATEURS, segment: 'administration/utilisateurs' },
      { labelKey: 'roles',        href: ROUTES.ADMINISTRATION_ROLES,        segment: 'administration/roles' },
      { labelKey: 'referentiels', href: ROUTES.ADMINISTRATION_REFERENTIELS, segment: 'administration/referentiels' },
      { labelKey: 'audit',        href: ROUTES.ADMINISTRATION_AUDIT,        segment: 'administration/audit' },
    ],
  },
];

export const BSCVA_BOTTOM_MENU: NavItem[] = [];

/* ------------------------------------------------------------------ */
/* Exports (compatibilité avec les imports existants du layout)       */
/* ------------------------------------------------------------------ */
export const NAV_ITEMS        = BSCVA_MENU;
export const NAV_BOTTOM_ITEMS = BSCVA_BOTTOM_MENU;
export const AUGURE_MENU        = BSCVA_MENU;
export const AUGURE_BOTTOM_MENU = BSCVA_BOTTOM_MENU;
