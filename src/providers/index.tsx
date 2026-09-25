'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FetchProgressProvider } from './FetchProgressProvider';
import { GlobalProgressBar } from '@/components/layout/GlobalProgressBar';

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <FetchProgressProvider>
      <GlobalProgressBar />
      <AuthProvider>
        <QueryProvider>
          <ThemeProvider defaultTheme="light">
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </ThemeProvider>
        </QueryProvider>
      </AuthProvider>
    </FetchProgressProvider>
  );
}
