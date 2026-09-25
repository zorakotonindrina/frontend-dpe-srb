'use client';

import {
  Contact,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthContext } from '@/providers/AuthProvider';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/components/common/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/constants/routes';
import { getAccountAuthorization } from '@/lib/account-authorization';
import { cn } from '@/lib/utils';

export interface UserBadgeDropdownProps {
  displayName?: string | null;
  userCode?:    string | null;
  image?:       string | null;
  onLogout:     () => void | Promise<void>;
  defaultOpen?: boolean;
  className?:   string;
}

export function UserBadgeDropdown({
  displayName,
  userCode,
  image,
  onLogout,
  defaultOpen,
  className,
}: UserBadgeDropdownProps) {
  const t = useTranslations('navbar');
  const { user } = useAuthContext();
  const authorization = getAccountAuthorization(user?.role);
  const userName = displayName ?? t('userFallback');
  const code = userCode ?? '000000';

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger
        data-testid="navbar-user-menu"
        aria-label={t('userMenu')}
        className={cn(
          'relative flex size-9 cursor-pointer items-center justify-center rounded-full',
          'transition-colors duration-150 hover:bg-accent hover:text-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Avatar
          name={userName}
          src={image ?? undefined}
          size="md"
          className="bg-muted"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        data-testid="navbar-user-dropdown"
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-[288px] overflow-hidden rounded-sm p-0"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="bg-[color:var(--color-brand-900)] px-3 py-3 text-center text-xs font-bold uppercase text-white">
            {userName} ({code})
          </DropdownMenuLabel>

          {authorization.canAdministrate && (
            <DropdownMenuItem
              render={<Link href={ROUTES.ADMINISTRATION_UTILISATEURS} />}
              className="h-10 cursor-pointer rounded-none border-b px-3"
              data-testid="navbar-menu-administration"
            >
              <ShieldCheck />
              <span>{t('administration')}</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuGroup>
          <DropdownMenuLabel className="bg-[color:var(--color-brand-900)] px-3 py-2 text-center text-xs font-bold text-white">
            {t('settings')}
          </DropdownMenuLabel>

          <DropdownMenuItem
            className="h-10 cursor-pointer rounded-none border-b px-3"
            data-testid="navbar-menu-profile"
          >
            <Settings />
            <span>{t('profile')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="h-10 cursor-pointer rounded-none border-b px-3"
            data-testid="navbar-menu-contact"
          >
            <Contact />
            <span>{t('contact')}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => void onLogout()}
            className="h-10 cursor-pointer rounded-none px-3"
            data-testid="navbar-menu-logout"
          >
            <LogOut />
            <span>{t('logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
