import type { ReactNode } from 'react';

/**
 * Layout du groupe (auth) — rendu direct sans wrapper.
 * Chaque page (login, register) gère son propre layout visuel
 * pour permettre des designs page-par-page.
 */
export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
