'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Search, FilePlus, FileSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut,
} from '@/components/ui/command';
import { useAuth } from '@/hooks/useAuth';
import { useCommandPaletteShortcut } from '@/hooks/useCommandPaletteShortcut';
import { useDebounce } from '@/hooks/useDebounce';
import { useDossiers } from '@/hooks/useDossiers';
import { ROUTES } from '@/lib/constants/routes';
import { PROCESSUS_CODE_NAV_LABEL_KEYS, PROCESSUS_CODE_NEW_ROUTES } from '@/lib/constants/processus';

export function GlobalCommandPalette() {
  const t = useTranslations('commandPalette');
  const tNav = useTranslations('nav');
  const tNavbar = useTranslations('navbar');
  const router = useRouter();
  const { hasPermission } = useAuth();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  useCommandPaletteShortcut(() => setOpen((o) => !o));

  const { data: dossiers = [] } = useDossiers(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  function goTo(href: string) {
    setOpen(false);
    setSearch('');
    router.push(href);
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="ml-auto gap-2 text-muted-foreground"
        onClick={() => setOpen(true)}
        aria-label={tNavbar('search')}
        data-testid="command-palette-trigger"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">{tNavbar('search')}</span>
        <CommandShortcut className="hidden sm:inline">Ctrl K</CommandShortcut>
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title={t('placeholder')}
        description={t('placeholder')}
      >
        <Command>
          <CommandInput
            placeholder={t('placeholder')}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>{t('empty')}</CommandEmpty>

            {hasPermission('processus:write') && (
              <CommandGroup heading={t('createGroup')}>
                {Object.entries(PROCESSUS_CODE_NAV_LABEL_KEYS).map(([code, labelKey]) => (
                  <CommandItem
                    key={code}
                    value={`creer ${tNav(labelKey)}`}
                    onSelect={() => goTo(PROCESSUS_CODE_NEW_ROUTES[code])}
                  >
                    <FilePlus className="h-4 w-4" />
                    {tNav(labelKey)}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {debouncedSearch && dossiers.length > 0 && (
              <CommandGroup heading={t('searchGroup')}>
                {dossiers.map((d) => (
                  <CommandItem
                    key={d.referenceActe}
                    value={`${d.referenceActe} ${d.dossierMotif}`}
                    onSelect={() => goTo(ROUTES.DOSSIER_DETAIL(d.referenceActe))}
                  >
                    <FileSearch className="h-4 w-4" />
                    <span className="flex flex-col">
                      <span className="font-medium">{d.referenceActe}</span>
                      <span className="text-xs text-muted-foreground">
                        {tNav(PROCESSUS_CODE_NAV_LABEL_KEYS[d.processusCode] ?? d.processusCode)} — {d.dossierMotif}
                      </span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
