'use client';

import { useState } from 'react';
import type { Column } from '@tanstack/react-table';
import { Check, PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { FacetedFilterDef } from './data-table.types';

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

interface DataTableFacetedFilterProps<TData, TValue> {
  column: Column<TData, TValue> | undefined;
  filterDef: FacetedFilterDef;
}

/* ------------------------------------------------------------------ */
/* DataTableFacetedFilter — filtre multi-valeurs (popover + items)     */
/* ------------------------------------------------------------------ */

export function DataTableFacetedFilter<TData, TValue>({
  column,
  filterDef,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const [open, setOpen] = useState(false);

  const selectedValues = new Set(column?.getFilterValue() as string[] | undefined);

  function toggle(value: string) {
    const next = new Set(selectedValues);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    column?.setFilterValue(next.size ? Array.from(next) : undefined);
  }

  function clearFilters() {
    column?.setFilterValue(undefined);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 border-dashed gap-1.5">
            <PlusCircle className="h-4 w-4" />
            {filterDef.title}
            {selectedValues.size > 0 && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal lg:hidden"
                >
                  {selectedValues.size}
                </Badge>
                <div className="hidden gap-1 lg:flex">
                  {selectedValues.size > 2 ? (
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {selectedValues.size} sélectionnés
                    </Badge>
                  ) : (
                    filterDef.options
                      .filter((opt) => selectedValues.has(opt.value))
                      .map((opt) => (
                        <Badge
                          key={opt.value}
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {opt.label}
                        </Badge>
                      ))
                  )}
                </div>
              </>
            )}
          </Button>
        }
      />
      <PopoverContent className="w-52 p-0" align="start">
        <Command>
          <CommandInput placeholder={`Filtrer ${filterDef.title.toLowerCase()}…`} />
          <CommandList>
            <CommandEmpty>Aucun résultat.</CommandEmpty>
            <CommandGroup>
              {filterDef.options.map((opt) => {
                const isSelected = selectedValues.has(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => toggle(opt.value)}
                    data-checked={isSelected}
                  >
                    <div
                      className={cn(
                        'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'opacity-50 [&_svg]:invisible',
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </div>
                    {opt.icon && (
                      <opt.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{opt.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={clearFilters}
                    className="justify-center text-center text-xs text-muted-foreground"
                  >
                    Réinitialiser les filtres
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
