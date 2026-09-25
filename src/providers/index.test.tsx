import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Providers } from './index';

const themeProviderSpy = vi.hoisted(() => vi.fn());

vi.mock('./AuthProvider', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./QueryProvider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock('./ThemeProvider', () => ({
  ThemeProvider: ({
    children,
    defaultTheme,
  }: { children: React.ReactNode; defaultTheme?: string }) => {
    themeProviderSpy(defaultTheme);
    return <>{children}</>;
  },
}));

vi.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe('Providers', () => {
  it('starts the app with the light theme by default', () => {
    render(
      <Providers>
        <span>content</span>
      </Providers>,
    );

    expect(screen.getByText('content')).toBeInTheDocument();
    expect(themeProviderSpy).toHaveBeenCalledWith('light');
  });
});
