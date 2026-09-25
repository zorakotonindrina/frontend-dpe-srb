import type { ReactNode } from 'react';
import type { StaticImagePath } from '@/lib/constants/images';

/* ------------------------------------------------------------------ */
/* AuthLayout — layout centré sans sidebar                            */
/* ------------------------------------------------------------------ */

interface AuthLayoutProps {
  children:         ReactNode;
  /** Image de fond optionnelle (depuis IMAGE_BACKGROUNDS) */
  backgroundImage?: StaticImagePath;
}

export function AuthLayout({ children, backgroundImage }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-screen flex-col bg-muted/30 bg-cover bg-center"
      style={backgroundImage ? { backgroundImage: `url(${backgroundImage})` } : undefined}
    >
      {/* En-tête avec logo Marianne RF */}
      <header className="flex h-16 items-center justify-center border-b bg-background px-4 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Bloc Marianne RF stylisé */}
          <div
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary"
            aria-hidden="true"
          >
            <span className="text-xs font-bold leading-tight text-white">
              RF
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              République Française
            </span>
            <span className="text-base font-bold text-primary">AUGURE</span>
          </div>
        </div>
      </header>

      {/* Contenu centré */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center p-4 focus-visible:outline-none"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>

      {/* Pied de page */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Ministère — Application AUGURE
      </footer>
    </div>
  );
}
