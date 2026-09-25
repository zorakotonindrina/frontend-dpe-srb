'use client';

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { AUGURE_MENU, AUGURE_BOTTOM_MENU } from '@/lib/constants/nav-items';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

/* ------------------------------------------------------------------ */
/* DashboardLayout                                                     */
/* ------------------------------------------------------------------ */

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Fermer le menu mobile si on repasse en desktop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)'); // lg breakpoint
    const handleMediaChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleMediaChange);
    return () => mediaQuery.removeEventListener('change', handleMediaChange);
  }, []);

  // Garde d'accès côté client — remplace le middleware serveur, non disponible
  // en export statique. Redirige vers /login si aucune session n'est trouvée.
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, isAuthenticated, pathname, router]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar desktop — masquée sur mobile, et à l'impression */}
      <div className="hidden lg:flex lg:shrink-0 print:hidden">
        <Sidebar menu={AUGURE_MENU} bottomMenu={AUGURE_BOTTOM_MENU} />
      </div>

      {/* Sheet mobile */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          data-testid="mobile-sidebar-sheet"
          className="p-0 sm:max-w-[264px]"
          showCloseButton={false}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <Sidebar
            menu={AUGURE_MENU}
            bottomMenu={AUGURE_BOTTOM_MENU}
            forceCollapsed={false}
            onNavigate={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Colonne principale */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="print:hidden">
          <Navbar onMobileMenuOpen={() => setMobileOpen(true)} />
        </div>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 focus-visible:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
