import type { Metadata, Viewport } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { Providers } from '@/providers';
import { Toaster } from 'sonner';
import { IMAGE_ICONS } from '@/lib/constants/images';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default:  'AUGURE — Gestion des Ressources humaines',
    template: '%s | AUGURE',
  },
  description:
    'Application Unique pour la Gestion des Ressources humaines de l\'État',
  robots: { index: false, follow: false },
  icons:  { icon: IMAGE_ICONS.FAVICON },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale   = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Lien skip-navigation — RGAA obligatoire */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[9999] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Aller au contenu principal
        </a>

        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
            <Toaster position="top-right" richColors closeButton />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
