'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NavEntry, NavItem, SubNavItem } from '@/lib/constants/nav-items';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/common/PageTitle';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Constantes                                                          */
/* ------------------------------------------------------------------ */

const SIDEBAR_WIDTH     = 264;
const SIDEBAR_COLLAPSED = 64;
const FLYOUT_WIDTH      = 286;
const FLYOUT_MAX_HEIGHT = 420;

/* Couleur cyan active — identique au screenshot */
const CYAN = '#06b6d4';

/* ------------------------------------------------------------------ */
/* Résolution du segment actif — le plus spécifique l'emporte          */
/* ------------------------------------------------------------------ */

/**
 * Deux routes peuvent partager un préfixe (ex. `dossiers` et `dossiers/traitement`) : sans
 * arbitrage, les deux items de menu correspondants matcheraient `pathname.startsWith(...)`
 * simultanément. On calcule donc UN SEUL segment "gagnant" — le plus long parmi tous ceux
 * enregistrés (items de premier niveau + enfants) qui préfixe le `pathname` courant — et tous
 * les checks d'activation (top-level, groupe, sous-item) comparent à ce même segment par égalité
 * stricte plutôt que par préfixe indépendant.
 */
function flattenSegments(menu: NavEntry[]): string[] {
  const segments: string[] = [];
  for (const entry of menu) {
    if ('type' in entry) continue;
    const item = entry as NavItem;
    if (item.segment !== undefined) segments.push(item.segment);
    for (const child of item.children ?? []) segments.push(child.segment);
  }
  return segments;
}

function computeActiveSegment(pathname: string, segments: string[]): string | undefined {
  const matches = segments.filter((s) => (s === '' ? pathname === '/' : pathname.startsWith(`/${s}`)));
  if (matches.length === 0) return undefined;
  return matches.reduce((best, s) => (s.length > best.length ? s : best));
}

/* ------------------------------------------------------------------ */
/* SectionHeader                                                       */
/* ------------------------------------------------------------------ */

function SectionHeader({ label }: { label: string }) {
  return (
    <li role="presentation" className="px-4 pb-1 pt-5">
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {label}
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* NavLink — item feuille niveau 1                                     */
/* ------------------------------------------------------------------ */

interface NavLinkProps {
  href:      string;
  label:     string;
  icon:      React.ComponentType<{ className?: string }>;
  collapsed: boolean;
  active:    boolean;
  onNavigate?: () => void;
}

function NavLink({ href, label, icon: Icon, collapsed, active, onNavigate }: NavLinkProps) {
  const link = (
    <Link
      href={href}
      onClick={onNavigate}
      data-testid={`sidebar-nav-item-${href}`}
      aria-current={active ? 'page' : undefined}
      style={active ? { backgroundColor: CYAN } : undefined}
      className={cn(
        'group flex w-full cursor-pointer items-center rounded-none py-2.5 text-sm font-medium',
        'transition-[background-color,color,gap,padding] duration-200',
        active
          ? 'text-white'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        collapsed ? 'justify-center gap-0 px-0' : 'gap-3 px-3',
      )}
    >
      <Icon
        className={cn(
          'h-5 w-5 shrink-0',
          active ? 'text-white' : 'text-slate-500 group-hover:text-slate-700',
        )}
      />
      <span
        className={cn(
          'truncate text-left transition-[max-width,opacity,transform] duration-200 ease-out',
          collapsed
            ? 'max-w-0 translate-x-1 opacity-0'
            : 'max-w-[172px] translate-x-0 opacity-100',
        )}
      >
        {label}
      </span>
    </Link>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right" sideOffset={12}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/* SubNavLink — item feuille niveau 2                                  */
/* ------------------------------------------------------------------ */

interface SubNavLinkProps {
  item:        SubNavItem;
  label:       string;
  active:      boolean;
  onNavigate?: () => void;
}

function SubNavLink({ item, label, active, onNavigate }: SubNavLinkProps) {
  return (
    <li>
      <Link
        href={item.href}
        role={onNavigate ? 'menuitem' : undefined}
        data-testid={`sidebar-sub-nav-item-${item.href}`}
        aria-current={active ? 'page' : undefined}
        onClick={onNavigate}
        style={active ? { backgroundColor: CYAN } : undefined}
        className={cn(
          'group flex cursor-pointer items-center gap-2 rounded-none py-2 pl-8 pr-3 text-sm',
          'transition-colors duration-150',
          active
            ? 'font-medium text-white'
            : 'font-normal text-slate-500 hover:bg-slate-100 hover:text-slate-800',
        )}
      >
        <ChevronRight
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            active ? 'text-white' : 'text-slate-400 group-hover:text-slate-600',
          )}
        />
        <span className="truncate">{label}</span>
      </Link>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* NavGroup — parent repliable niveau 1                                */
/* ------------------------------------------------------------------ */

interface NavGroupProps {
  item:      NavItem;
  label:     string;
  subLabels: Record<string, string>;
  collapsed: boolean;
  activeSegment: string | undefined;
  onNavigate?: () => void;
}

function NavGroup({ item, label, subLabels, collapsed, activeSegment, onNavigate }: NavGroupProps) {
  const hasActiveChild = (item.children ?? []).some(
    (c) => c.segment === activeSegment,
  );
  const [open, setOpen] = useState(hasActiveChild);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [flyoutTop, setFlyoutTop] = useState(8);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const flyoutRef = useRef<HTMLDivElement | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Réouvre le groupe quand la navigation (pas un clic local) fait entrer
  // un enfant actif — ajustement pendant le rendu plutôt que dans un effet,
  // pour éviter le rendu en cascade (cf. react.dev/learn/you-might-not-need-an-effect).
  const [prevHasActiveChild, setPrevHasActiveChild] = useState(hasActiveChild);
  if (hasActiveChild !== prevHasActiveChild) {
    setPrevHasActiveChild(hasActiveChild);
    if (hasActiveChild) setOpen(true);
  }

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!flyoutOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFlyoutOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [flyoutOpen]);

  const Icon = item.icon;
  const flyoutId = `sidebar-flyout-${(item.segment ?? item.labelKey).replace(/[^a-zA-Z0-9_-]/g, '-')}`;

  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openFlyout = () => {
    if (!collapsed) return;
    cancelClose();

    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const maxTop = Math.max(8, window.innerHeight - FLYOUT_MAX_HEIGHT - 8);
      setFlyoutTop(Math.min(Math.max(rect.top, 8), maxTop));
    }

    setFlyoutOpen(true);
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimerRef.current = setTimeout(() => setFlyoutOpen(false), 120);
  };

  const handleBlur = () => {
    window.setTimeout(() => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        (triggerRef.current?.contains(activeElement) || flyoutRef.current?.contains(activeElement))
      ) {
        return;
      }

      setFlyoutOpen(false);
    }, 0);
  };

  const trigger = (
    <button
      ref={triggerRef}
      type="button"
      data-testid={`sidebar-nav-group-${item.segment ?? item.labelKey}`}
      aria-haspopup={collapsed ? 'menu' : undefined}
      aria-expanded={collapsed ? flyoutOpen : open}
      aria-controls={collapsed ? flyoutId : undefined}
      onClick={() => !collapsed && setOpen((o) => !o)}
      onFocus={openFlyout}
      onBlur={handleBlur}
      onMouseEnter={openFlyout}
      className={cn(
        'group flex w-full cursor-pointer items-center rounded-none py-2.5 text-sm font-medium',
        'transition-[background-color,color,gap,padding] duration-200',
        collapsed && hasActiveChild
          ? 'text-white'
          : hasActiveChild
          ? 'bg-slate-200 text-slate-900'
          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900',
        collapsed ? 'justify-center gap-0 px-0' : 'gap-3 px-3',
      )}
      style={collapsed && hasActiveChild ? { backgroundColor: CYAN } : undefined}
    >
      <Icon
        className={cn(
          'h-5 w-5 shrink-0',
          collapsed && hasActiveChild
            ? 'text-white'
            : hasActiveChild
            ? 'text-slate-700'
            : 'text-slate-500 group-hover:text-slate-700',
        )}
      />
      <span
        className={cn(
          'flex-1 truncate text-left transition-[max-width,opacity,transform] duration-200 ease-out',
          collapsed
            ? 'max-w-0 translate-x-1 opacity-0'
            : 'max-w-[160px] translate-x-0 opacity-100',
        )}
      >
        {label}
      </span>
      <ChevronDown
        className={cn(
          'h-4 w-4 shrink-0 transition-[max-width,opacity,transform] duration-200 ease-out',
          hasActiveChild ? 'text-slate-600' : 'text-slate-400',
          open ? 'rotate-0' : '-rotate-90',
          collapsed ? 'max-w-0 opacity-0' : 'max-w-4 opacity-100',
        )}
      />
    </button>
  );

  return (
    <li onMouseEnter={openFlyout} onMouseLeave={scheduleClose}>
      {collapsed ? (
        <>
          {trigger}
          {flyoutOpen && typeof document !== 'undefined' && createPortal(
            <div
              ref={flyoutRef}
              id={flyoutId}
              role="menu"
              data-testid={`sidebar-collapsed-flyout-${item.segment ?? item.labelKey}`}
              className={cn(
                'fixed z-[var(--z-dropdown)] overflow-hidden border bg-card text-card-foreground shadow-lg',
                'animate-in fade-in-0 zoom-in-95 duration-100',
              )}
              style={{
                left:      SIDEBAR_COLLAPSED,
                top:       flyoutTop,
                width:     FLYOUT_WIDTH,
                maxHeight: FLYOUT_MAX_HEIGHT,
              }}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
              onBlur={handleBlur}
            >
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 text-sm font-semibold',
                  hasActiveChild ? 'text-white' : 'bg-muted text-foreground',
                )}
                style={hasActiveChild ? { backgroundColor: CYAN } : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{label}</span>
              </div>
              <ul className="max-h-[360px] overflow-y-auto py-1" role="list">
                {item.children?.map((child) => (
                  <SubNavLink
                    key={child.href}
                    item={child}
                    label={subLabels[child.labelKey] ?? child.labelKey}
                    active={child.segment === activeSegment}
                    onNavigate={() => {
                      setFlyoutOpen(false);
                      onNavigate?.();
                    }}
                  />
                ))}
              </ul>
            </div>,
            document.body,
          )}
        </>
      ) : (
        trigger
      )}

      {/* Accordion animé — CSS grid trick */}
      {!collapsed && (
        <div
          style={{
            display:          'grid',
            gridTemplateRows: open ? '1fr' : '0fr',
            transition:       'grid-template-rows 250ms ease',
          }}
        >
          <ul style={{ overflow: 'hidden' }} className="flex flex-col gap-0.5 pb-0.5" role="list">
            {item.children?.map((child) => (
              <SubNavLink
                key={child.href}
                item={child}
                label={subLabels[child.labelKey] ?? child.labelKey}
                active={child.segment === activeSegment}
                onNavigate={onNavigate}
              />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

interface SidebarProps {
  menu:            NavEntry[];
  bottomMenu?:     NavItem[];
  forceCollapsed?: boolean;
  className?:      string;
  onNavigate?:     () => void;
}

export function Sidebar({ menu, bottomMenu = [], forceCollapsed, className, onNavigate }: SidebarProps) {
  const t        = useTranslations('nav');
  const tSidebar = useTranslations('sidebar');

  const [collapsed, setCollapsed] = useLocalStorage('sidebar-collapsed', false);
  const pathname = usePathname();
  const isCollapsed = forceCollapsed ?? collapsed;

  const activeSegment = useMemo(
    () => computeActiveSegment(pathname, flattenSegments(menu)),
    [pathname, menu],
  );

  function isActive(segment: string | undefined): boolean {
    return segment !== undefined && segment === activeSegment;
  }

  function label(key: string): string {
    return t(key as Parameters<typeof t>[0]);
  }

  function subLabels(children: SubNavItem[]): Record<string, string> {
    return Object.fromEntries(children.map((c) => [c.labelKey, label(c.labelKey)]));
  }

  const handleNavigate = () => {
    onNavigate?.();
    // Sur desktop (où forceCollapsed est undefined), on auto-collapse au clic
    if (forceCollapsed === undefined) {
      setCollapsed(true);
    }
  };

  function renderEntry(entry: NavEntry, index: number) {
    if ('type' in entry) {
      return isCollapsed
        ? <li key={`s-${index}`} className="my-2 mx-3 border-t" />
        : <SectionHeader key={`s-${index}`} label={label(entry.labelKey)} />;
    }

    const item = entry as NavItem;

    if (item.children?.length) {
      return (
        <NavGroup
          key={item.labelKey}
          item={item}
          label={label(item.labelKey)}
          subLabels={subLabels(item.children)}
          collapsed={isCollapsed}
          activeSegment={activeSegment}
          onNavigate={handleNavigate}
        />
      );
    }

    return (
      <li key={item.href ?? item.labelKey}>
        <NavLink
          href={item.href!}
          label={label(item.labelKey)}
          icon={item.icon}
          collapsed={isCollapsed}
          active={isActive(item.segment)}
          onNavigate={handleNavigate}
        />
      </li>
    );
  }

  return (
    <aside
      data-testid="sidebar"
      aria-label={t('mainNav')}
      style={{
        width:    forceCollapsed === false ? '100%' : (isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH),
        minWidth: forceCollapsed === false ? '100%' : (isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH),
        maxWidth: forceCollapsed === false ? '100%' : (isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_WIDTH),
      }}
      className={cn(
        'relative flex h-full shrink-0 flex-col',
        'border-r bg-card',
        'transition-[width,min-width,max-width] duration-300 ease-out will-change-[width]',
        className,
      )}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex shrink-0 items-center overflow-hidden border-b transition-[height,padding] duration-300 ease-out',
          isCollapsed ? 'justify-center px-2' : 'px-4',
        )}
        style={{ height: isCollapsed ? 64 : 92 }}
      >
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-200 ease-out',
            isCollapsed
              ? 'scale-100 opacity-100'
              : 'pointer-events-none scale-95 opacity-0',
          )}
          aria-hidden={!isCollapsed}
        >
          <span
            data-testid="sidebar-logo-compact"
            className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--color-brand-900,#1e3461)] text-sm font-bold text-white"
          >
            V
          </span>
        </div>

        <div
          className={cn(
            'flex w-full min-w-[180px] flex-col items-center justify-center transition-[opacity,transform] duration-200 ease-out',
            isCollapsed
              ? 'pointer-events-none -translate-x-2 opacity-0'
              : 'translate-x-0 opacity-100',
          )}
          aria-hidden={isCollapsed}
        >
          <span
            data-testid="sidebar-logo-full"
            className="flex h-10 w-10 items-center justify-center rounded-md bg-[color:var(--color-brand-900,#1e3461)] text-lg font-bold text-white"
          >
            V
          </span>
          <PageTitle className="mt-1 whitespace-nowrap text-[1rem] leading-none" text={t('appSubtitle')} />
        </div>
      </div>

      {/* ── Navigation principale ────────────────────────────── */}
      <nav
        aria-label={t('mainMenu')}
        className={cn(
          'flex-1 overflow-y-auto py-3',
          isCollapsed ? 'px-2' : 'px-2',
        )}
      >
        <ul className="flex flex-col gap-0.5" role="list">
          {menu.map((entry, i) => renderEntry(entry, i))}
        </ul>
      </nav>

      {/* ── Navigation bas ───────────────────────────────────── */}
      {bottomMenu.length > 0 && (
        <div className={cn('border-t py-3', isCollapsed ? 'px-2' : 'px-2')}>
          <ul className="flex flex-col gap-0.5" role="list">
            {bottomMenu.map((item) => (
              <li key={item.href ?? item.labelKey}>
                <NavLink
                  href={item.href!}
                  label={label(item.labelKey)}
                  icon={item.icon}
                  collapsed={isCollapsed}
                  active={isActive(item.segment)}
                  onNavigate={handleNavigate}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Bouton collapse ──────────────────────────────────── */}
      {forceCollapsed === undefined && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'absolute -right-3 top-[72px] z-20 h-7 w-7 cursor-pointer rounded-full border bg-card shadow-sm',
            'hover:bg-accent',
          )}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={isCollapsed ? tSidebar('expand') : tSidebar('collapse')}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed
            ? <ChevronRight className="h-3.5 w-3.5" />
            : <ChevronLeft  className="h-3.5 w-3.5" />
          }
        </Button>
      )}
    </aside>
  );
}
