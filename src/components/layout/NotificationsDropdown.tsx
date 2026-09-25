'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROUTES } from '@/lib/constants/routes';
import { PROCESSUS_CODE_NAV_LABEL_KEYS } from '@/lib/constants/processus';
import type { WfProcessusActiviteTache } from '@/types/workflow.types';

const MAX_ITEMS = 5;

export interface NotificationsDropdownProps {
  taches: WfProcessusActiviteTache[];
  isLoading?: boolean;
  defaultOpen?: boolean;
}

export function NotificationsDropdown({
  taches,
  isLoading = false,
  defaultOpen,
}: NotificationsDropdownProps) {
  const t = useTranslations('navbar');
  const tCommon = useTranslations('common');
  const tNav = useTranslations('nav');
  const tEtapes = useTranslations('dossiers.etapes');
  const tWorkflow = useTranslations('workflow');
  const router = useRouter();

  const count = taches.length;
  const visibleTaches = taches.slice(0, MAX_ITEMS);

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger
        data-testid="navbar-notifications-button"
        aria-label={count > 0 ? t('notificationsUnread', { count }) : t('notifications')}
        className="relative flex size-9 cursor-pointer items-center justify-center rounded-full transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Bell className="h-5 w-5" />
        {count > 0 && (
          <span
            aria-hidden="true"
            className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground"
          >
            {count > 9 ? '9+' : count}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent
        data-testid="navbar-notifications-dropdown"
        side="bottom"
        align="end"
        sideOffset={8}
        className="w-[340px] overflow-hidden rounded-sm p-0 sm:w-[380px]"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="bg-[color:var(--color-brand-900)] px-3 py-3 text-center text-xs font-bold uppercase text-white">
            {t('notificationsTitle')}
          </DropdownMenuLabel>

          {isLoading ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              {tCommon('loading')}
            </div>
          ) : count === 0 ? (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground" data-testid="navbar-notifications-empty">
              {t('notificationsEmpty')}
            </div>
          ) : (
            <>
              {visibleTaches.map((tache) => {
                const navLabelKey = PROCESSUS_CODE_NAV_LABEL_KEYS[tache.processusCode];
                return (
                  <DropdownMenuItem
                    key={`${tache.referenceActe}-${tache.rang}`}
                    onClick={() => router.push(ROUTES.DOSSIER_DETAIL(tache.referenceActe))}
                    className="h-auto cursor-pointer flex-col items-start gap-1 rounded-none border-b px-3 py-2.5"
                    data-testid={`navbar-notification-${tache.referenceActe}-${tache.rang}`}
                  >
                    <p className="text-sm font-semibold text-foreground">
                      {tache.referenceActe}
                      {navLabelKey && (
                        <Badge variant="outline" className="ml-2">{tNav(navLabelKey as Parameters<typeof tNav>[0])}</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {tEtapes(tache.tacheAFaire as Parameters<typeof tEtapes>[0])}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tWorkflow('columns.dateDebut')} {tache.dateDebut}
                    </p>
                  </DropdownMenuItem>
                );
              })}

              {count > MAX_ITEMS && (
                <DropdownMenuItem
                  render={<Link href={ROUTES.WORKFLOW_MES_TACHES} />}
                  className="h-10 cursor-pointer justify-center rounded-none px-3 text-sm font-medium"
                  data-testid="navbar-notifications-view-all"
                >
                  {t('notificationsViewAll', { count })}
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
