import type { ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as NextIntl from 'next-intl';
import messages from '../../messages/fr.json';

/**
 * QueryClient dédié aux tests — pas de retry, staleTime 0
 * pour que les tests soient déterministes.
 */
function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry:     false,
        staleTime: 0,
        gcTime:    0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

interface WrapperProps {
  children: React.ReactNode;
}

type IntlProviderProps = {
  children: React.ReactNode;
  locale?:   string;
  messages?: typeof messages;
};

function FallbackIntlProvider({ children }: IntlProviderProps) {
  return <>{children}</>;
}

/**
 * Utilitaire de rendu pour les tests unitaires.
 * Enveloppe le composant à tester avec les mêmes providers
 * que l'application (QueryProvider, etc.).
 *
 * Usage :
 * ```tsx
 * const { getByText } = renderWithProviders(<MonComposant />);
 * ```
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const queryClient = makeTestQueryClient();
  let IntlProvider: React.ComponentType<IntlProviderProps>;
  try {
    IntlProvider = NextIntl.NextIntlClientProvider;
  } catch {
    IntlProvider = FallbackIntlProvider;
  }

  function Wrapper({ children }: WrapperProps) {
    return (
      <IntlProvider locale="fr" messages={messages}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </IntlProvider>
    );
  }

  return {
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}

// Ré-exporte tout de @testing-library/react pour simplifier les imports
export * from '@testing-library/react';
