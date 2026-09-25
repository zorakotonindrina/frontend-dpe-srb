import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '@/tests/renderWithProviders';
import { Sidebar } from './Sidebar';
import { AUGURE_BOTTOM_MENU, AUGURE_MENU } from '@/lib/constants/nav-items';

const mockPathname = vi.hoisted(() => ({ value: '/' }));

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname.value,
}));

vi.mock('next/image', () => ({
  default: ({
    src,
    alt,
    ...props
  }: { src: string; alt: string; [key: string]: unknown }) => (
    <img src={src} alt={alt} {...props} />
  ),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ render }: { render: React.ReactElement }) => render,
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <span>{children}</span>
  ),
}));

function renderSidebar(forceCollapsed?: boolean) {
  return renderWithProviders(
    <Sidebar
      menu={AUGURE_MENU}
      bottomMenu={AUGURE_BOTTOM_MENU}
      forceCollapsed={forceCollapsed}
    />,
  );
}

describe('Sidebar', () => {
  beforeEach(() => {
    mockPathname.value = '/';
    window.localStorage.clear();
  });

  it('renders the compact logo when collapsed', () => {
    renderSidebar(true);

    const compactLogo = screen.getByTestId('sidebar-logo-compact');

    expect(compactLogo).toBeInTheDocument();
    expect(compactLogo).toHaveTextContent('V');
  });

  it('opens clickable submenus on collapsed group hover', async () => {
    mockPathname.value = '/administration/utilisateurs';
    renderSidebar(true);

    await userEvent.hover(screen.getByTestId('sidebar-nav-group-administration'));

    const flyout = await screen.findByTestId('sidebar-collapsed-flyout-administration');
    const subItem = screen.getByTestId('sidebar-sub-nav-item-/administration/utilisateurs');

    expect(flyout).toBeInTheDocument();
    expect(subItem).toHaveAttribute('href', '/administration/utilisateurs');
  });

  it('opens collapsed submenus on keyboard focus and closes on Escape', async () => {
    renderSidebar(true);

    screen.getByTestId('sidebar-nav-group-administration').focus();
    expect(await screen.findByTestId('sidebar-collapsed-flyout-administration')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByTestId('sidebar-collapsed-flyout-administration')).not.toBeInTheDocument();
    });
  });

  it('keeps the expanded accordion behavior when not collapsed', async () => {
    mockPathname.value = '/administration/utilisateurs';
    renderSidebar(false);

    expect(screen.getByTestId('sidebar-logo-full')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-sub-nav-item-/administration/utilisateurs')).toBeInTheDocument();
    expect(screen.queryByTestId('sidebar-collapsed-flyout-administration')).not.toBeInTheDocument();
  });

  it('does not render collapsed flyouts when forceCollapsed is false', async () => {
    renderSidebar(false);

    await userEvent.hover(screen.getByTestId('sidebar-nav-group-administration'));

    expect(screen.queryByTestId('sidebar-collapsed-flyout-administration')).not.toBeInTheDocument();
  });
});
