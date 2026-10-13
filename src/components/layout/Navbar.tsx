'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { UserBadgeDropdown } from './UserBadgeDropdown';
import { LanguageSwitcher } from './LanguageSwitcher';
import { NotificationsDropdown } from './NotificationsDropdown';
import { GlobalCommandPalette } from '@/components/workflow/GlobalCommandPalette';
import { useAuth } from '@/hooks/useAuth';
import { useWorkflowMesTaches } from '@/hooks/useWorkflow';
import { NAV_ITEMS, NAV_BOTTOM_ITEMS, type NavItem } from '@/lib/constants/nav-items';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Breadcrumb dynamique                                                */
/* ------------------------------------------------------------------ */

function useBreadcrumbs() {
  const pathname = usePathname();
  const tNav     = useTranslations('nav');

  // Aplatir toutes les entrées nav en items plats (exclut NavSection, inclut children)
  const flatItems: { labelKey: string; href: string }[] = [];
  for (const entry of [...NAV_ITEMS, ...NAV_BOTTOM_ITEMS]) {
    if ('type' in entry) continue;
    const item = entry as NavItem;
    if (item.href) flatItems.push({ labelKey: item.labelKey, href: item.href });
    for (const child of item.children ?? []) {
      flatItems.push({ labelKey: child.labelKey, href: child.href });
    }
  }

  const segments = pathname.split('/').filter(Boolean);

  const crumbs: { label: string; href: string }[] = [
    { label: tNav('dashboard'), href: '/' },
  ];

  let accumulated = '';
  for (const segment of segments) {
    accumulated += `/${segment}`;
    const match = flatItems.find((item) => item.href === accumulated);
    if (match) {
      crumbs.push({ label: tNav(match.labelKey as Parameters<typeof tNav>[0]), href: accumulated });
    } else if (segment !== '') {
      const label =
        segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      crumbs.push({ label, href: accumulated });
    }
  }

  return crumbs;
}

/* ------------------------------------------------------------------ */
/* Navbar                                                              */
/* ------------------------------------------------------------------ */

interface NavbarProps {
  onMobileMenuOpen?: () => void;
}

export function Navbar({
  onMobileMenuOpen,
}: NavbarProps) {
  const t = useTranslations('navbar');
  const { displayName, user, logout } = useAuth();
  const { data: taches = [], isLoading: tachesLoading } = useWorkflowMesTaches();
  const crumbs = useBreadcrumbs();
  const currentPage = crumbs[crumbs.length - 1]?.label ?? '';
  const userCode = user?.id ?? '000000';

  return (
    <header
      className={cn(
        'flex h-[var(--navbar-height,56px)] shrink-0 items-center gap-3 border-b bg-card px-4',
      )}
    >
      {/* Bouton menu mobile */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMobileMenuOpen}
        data-testid="navbar-mobile-menu-button"
        aria-label={t('openMenu')}
        aria-haspopup="true"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Breadcrumb */}
      <Breadcrumb className="hidden md:flex">
        <BreadcrumbList>
          {crumbs.map((crumb, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <Fragment key={crumb.href}>
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage aria-current="page">
                      {crumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={crumb.href} />}>
                      {crumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator />}
              </Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Titre courant (mobile) */}
      <span className="flex-1 truncate text-sm font-semibold md:hidden">
        {currentPage}
      </span>

      {/* Palette de commande globale (création + recherche de dossier) */}
      <GlobalCommandPalette />

      {/* Langue de l'interface (fr / en / mg) */}
      <LanguageSwitcher />

      {/* Notifications */}
      <NotificationsDropdown taches={taches} isLoading={tachesLoading} />

      <UserBadgeDropdown
        displayName={displayName}
        userCode={userCode}
        onLogout={logout}
      />
    </header>
  );
}
