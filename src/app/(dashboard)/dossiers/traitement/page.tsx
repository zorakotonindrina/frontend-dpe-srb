'use client';

import { useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslations } from 'next-intl';
import { Plus, Search, SlidersHorizontal, Car, FolderOpen, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { SectionCard, SectionCardHeader, SectionCardTitle, SectionCardContent, SectionCardFooter } from '@/components/common/SectionCard';
import { DataTable } from '@/components/data-table/DataTable';
import { StatCard } from '@/components/stats/StatCard';
import { StatCardGrid } from '@/components/stats/StatCardGrid';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormDatePicker } from '@/components/forms/FormDatePicker';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { useDossier, useDossiers } from '@/hooks/useDossiers';
import { useVehicules } from '@/hooks/useVehicules';
import { useMinisteres } from '@/hooks/useReferentiels';
import { ROUTES } from '@/lib/constants/routes';
import type { DossiersParams, DossierStatut } from '@/lib/api/dossiers';
import { PROCESSUS_CODE_NAV_LABEL_KEYS, PROCESSUS_CODE_NEW_ROUTES } from '@/lib/constants/processus';
import { estDossierEnCours } from '@/lib/constants/workflow-etapes';
import type { FacetedFilterDef } from '@/components/data-table/data-table.types';
import { buildDossierColumns, DOSSIER_STATUTS } from '../columns';

/** Comparaison tolérante aux espaces/casse — un agent peut taper "4521wwb" ou "4521 WWB". */
function normalizePlate(s: string): string {
  return s.replace(/\s+/g, '').toLowerCase();
}

interface SearchFormValues {
  reference:     string;
  processusCode: string;
  statut:        string;
  dateFrom:      Date | null;
  dateTo:        Date | null;
}

const SEARCH_DEFAULTS: SearchFormValues = {
  reference: '', processusCode: '', statut: '', dateFrom: null, dateTo: null,
};

/** Formate une date en ISO yyyy-mm-dd en heure locale (jamais toISOString(), qui décale par fuseau). */
function toIsoDateLocal(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/**
 * Écran "Traitement de dossier" — même présentation qu'AUGURE : recherche rapide par référence
 * (résultat Processus/Activité/Tâche à faire + bouton Traiter) en haut, puis la liste complète +
 * recherche avancée des dossiers (déménagée depuis l'ancienne page `Dossiers`, désormais dédiée
 * à la création — voir `dossiers/page.tsx`) en dessous.
 */
export default function TraitementDossierPage() {
  const t = useTranslations('traitementDossier');
  const tDossiers = useTranslations('dossiers');
  const tStatuts = useTranslations('dossiers.statuts');
  const tNav = useTranslations('nav');
  const tEtapes = useTranslations('dossiers.etapes');
  const tDashboard = useTranslations('dashboard');
  const tVehicules = useTranslations('vehicules');
  const router = useRouter();

  // ── Résumé chiffré (RESUME §2) ───────────────────────────────────────
  const { data: vehicules = [] } = useVehicules();
  const { data: dossiersAll = [] } = useDossiers();
  const dossiersEnCoursCount = dossiersAll.filter((d) => estDossierEnCours(d.statut)).length;
  const dossiersTraitesCount = dossiersAll.filter((d) => d.statut === 'CLOTURE').length;

  // ── Recherche unique véhicule OU dossier (RESUME §1) ─────────────────
  const quickSearchRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');
  const [searchedReference, setSearchedReference] = useState('');

  const matchedVehicule = searchedReference
    ? vehicules.find((v) => normalizePlate(v.vehiculeImmatriculation) === normalizePlate(searchedReference))
    : undefined;
  const dossiersLies = matchedVehicule
    ? dossiersAll.filter((d) => d.vehiculeId === matchedVehicule.vehiculeId)
    : [];

  const { data: dossier, isLoading: isLoadingDossier } = useDossier(matchedVehicule ? '' : searchedReference);

  function onSearch(e: FormEvent) {
    e.preventDefault();
    setSearchedReference(input.trim());
  }

  /** Relance la recherche par référence (même chemin que la saisie manuelle) et remonte au panneau de résultat. */
  function goToTraitement(reference: string) {
    setInput(reference);
    setSearchedReference(reference);
    quickSearchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const navLabelKey = dossier ? PROCESSUS_CODE_NAV_LABEL_KEYS[dossier.processusCode] : undefined;
  const processusLabel = navLabelKey ? tNav(navLabelKey as Parameters<typeof tNav>[0]) : dossier?.processusCode;

  // ── Liste complète + recherche avancée ──────────────────────────────
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchParams, setSearchParams] = useState<DossiersParams>({});
  const searchForm = useForm<SearchFormValues>({ defaultValues: SEARCH_DEFAULTS });
  const dateFromValue = searchForm.watch('dateFrom');
  const dateToValue = searchForm.watch('dateTo');

  const { data: dossiers = [], isLoading: isLoadingList } = useDossiers(searchParams);
  const { data: ministeres = [] } = useMinisteres();
  const columns = useMemo(() => buildDossierColumns(tDossiers, tStatuts, tNav, ministeres), [tDossiers, tStatuts, tNav, ministeres]);

  function onSearchSubmit(values: SearchFormValues) {
    const next: DossiersParams = {};
    if (values.reference.trim()) next.search = values.reference.trim();
    if (values.processusCode) next.processusCode = values.processusCode;
    if (values.statut) next.statut = values.statut as DossierStatut;
    if (values.dateFrom) next.dateFrom = toIsoDateLocal(values.dateFrom);
    if (values.dateTo) next.dateTo = toIsoDateLocal(values.dateTo);
    setSearchParams(next);
  }

  function onSearchReset() {
    searchForm.reset(SEARCH_DEFAULTS);
    setSearchParams({});
  }

  const filters: FacetedFilterDef[] = useMemo(() => [
    {
      columnId: 'processusCode',
      title: tDossiers('columns.processus'),
      options: Object.entries(PROCESSUS_CODE_NAV_LABEL_KEYS).map(([code, labelKey]) => ({
        value: code,
        label: tNav(labelKey),
      })),
    },
    {
      columnId: 'statut',
      title: tDossiers('columns.statut'),
      options: DOSSIER_STATUTS.map((statut) => ({
        value: statut,
        label: tStatuts(statut),
      })),
    },
  ], [tDossiers, tNav, tStatuts]);

  return (
    <div data-testid="traitement-dossier-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setSearchOpen((open) => !open)}
              data-testid="dossiers-search-toggle-button"
              aria-expanded={searchOpen}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {tDossiers('search.toggleButton')}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger render={<Button data-testid="dossiers-new-button" className="h-11 gap-2 px-5 text-base" />}>
                <Plus className="h-5 w-5" />
                {tDossiers('newDossier')}
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(PROCESSUS_CODE_NAV_LABEL_KEYS).map(([code, labelKey]) => (
                  <DropdownMenuItem key={code} render={<Link href={PROCESSUS_CODE_NEW_ROUTES[code]} />}>
                    {tNav(labelKey)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <StatCardGrid columns={3}>
        <StatCard
          slug="vehicules"
          title={tDashboard('kpiVehicules')}
          value={vehicules.length}
          icon={<Car className="h-5 w-5" />}
          href={ROUTES.VEHICULES}
        />
        <StatCard
          slug="dossiers-en-cours"
          title={tDashboard('kpiDossiersEnCours')}
          value={dossiersEnCoursCount}
          icon={<FolderOpen className="h-5 w-5" />}
        />
        <StatCard
          slug="dossiers-traites"
          title={tDashboard('kpiDossiersTraites')}
          value={dossiersTraitesCount}
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </StatCardGrid>

      {/* Recherche rapide véhicule/dossier — même présentation qu'AUGURE "Traitement de dossier" */}
      <SectionCard ref={quickSearchRef}>
        <SectionCardHeader>
          <SectionCardTitle>{t('searchLabel')}</SectionCardTitle>
        </SectionCardHeader>
        <SectionCardContent>
          <form
            onSubmit={onSearch}
            className="flex flex-wrap items-end gap-3"
            data-testid="traitement-dossier-search-form"
          >
            <div className="min-w-[240px] flex-1">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('searchPlaceholder')}
                aria-label={t('searchPlaceholder')}
                data-testid="traitement-dossier-search-input"
              />
            </div>
            <Button type="submit" data-testid="traitement-dossier-search-button">
              <Search className="mr-1.5 h-4 w-4" />
              {t('searchButton')}
            </Button>
          </form>
        </SectionCardContent>
      </SectionCard>

      {searchedReference && (
        <SectionCard>
          <SectionCardHeader>
            <SectionCardTitle>{t('resultsTitle')}</SectionCardTitle>
          </SectionCardHeader>
          <SectionCardContent>
            {matchedVehicule ? (
              <div className="space-y-4" data-testid="traitement-vehicule-result">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{tVehicules('fields.immatriculation')}</p>
                    <p className="text-sm text-foreground">{matchedVehicule.vehiculeImmatriculation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{tVehicules('fields.marque')}</p>
                    <p className="text-sm text-foreground">{matchedVehicule.marqueLibelle ?? matchedVehicule.marqueCode}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{tVehicules('fields.etat')}</p>
                    <p className="text-sm text-foreground">{matchedVehicule.etatVehicule}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">{tVehicules('fields.detenteurEffectif')}</p>
                    <p className="text-sm text-foreground">{matchedVehicule.detenteurEffectif}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{t('dossiersLies')}</p>
                  <Link href={ROUTES.VEHICULE_DETAIL(matchedVehicule.vehiculeId)} className="text-sm text-sky-600 hover:underline" data-testid="traitement-voir-fiche-link">
                    {t('voirFiche')}
                  </Link>
                </div>

                {dossiersLies.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('aucunDossierLie')}</p>
                ) : (
                  <ul className="divide-y divide-border rounded-sm border border-border">
                    {dossiersLies.map((d) => (
                      <li key={d.referenceActe} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span>
                          <Badge className="mr-2">{tNav(PROCESSUS_CODE_NAV_LABEL_KEYS[d.processusCode] ?? d.processusCode)}</Badge>
                          {d.referenceActe} — {d.dossierMotif}
                        </span>
                        <Button size="sm" onClick={() => goToTraitement(d.referenceActe)} data-testid={`traitement-dossier-lie-${d.referenceActe}`}>
                          {t('traiter')}
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : isLoadingDossier ? (
              <p className="text-sm text-muted-foreground">…</p>
            ) : !dossier ? (
              <p className="text-sm text-muted-foreground" data-testid="traitement-dossier-not-found">
                {t('notFound')}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50 text-left">
                      <th className="px-3 py-2 font-semibold">{t('columns.processus')}</th>
                      <th className="px-3 py-2 font-semibold">{t('columns.activite')}</th>
                      <th className="px-3 py-2 font-semibold">{t('columns.tache')}</th>
                      <th className="px-3 py-2 font-semibold">{t('columns.reference')}</th>
                      <th className="px-3 py-2 font-semibold">{t('columns.typeActe')}</th>
                      <th className="px-3 py-2 font-semibold">{t('columns.action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr data-testid="traitement-dossier-result-row" className="border-b border-border last:border-0">
                      <td className="px-3 py-2">
                        <Badge>{processusLabel}</Badge>
                      </td>
                      <td className="px-3 py-2">{t('activiteLabel', { processus: processusLabel ?? '' })}</td>
                      <td className="px-3 py-2">
                        {dossier.etapeCode
                          ? tEtapes(dossier.etapeCode as Parameters<typeof tEtapes>[0])
                          : t('circuitTermine')}
                      </td>
                      <td className="px-3 py-2">{dossier.referenceActe}</td>
                      <td className="px-3 py-2">{dossier.typeActe}</td>
                      <td className="px-3 py-2">
                        {dossier.etapeCode && (
                          <Button
                            size="sm"
                            onClick={() => router.push(ROUTES.DOSSIER_DETAIL(dossier.referenceActe))}
                            data-testid="traitement-dossier-traiter-button"
                          >
                            {t('traiter')}
                          </Button>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </SectionCardContent>
        </SectionCard>
      )}

      {/* Liste complète + recherche avancée — déplacée depuis l'ancienne page Dossiers */}
      {searchOpen && (
        <FormProvider {...searchForm}>
          <form data-testid="dossiers-search-form" onSubmit={searchForm.handleSubmit(onSearchSubmit)} noValidate>
            <SectionCard>
              <SectionCardHeader>
                <SectionCardTitle>{tDossiers('search.title')}</SectionCardTitle>
              </SectionCardHeader>
              <SectionCardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormField name="reference" label={tDossiers('fields.reference')} />
                  <FormSelect
                    name="processusCode"
                    label={tDossiers('fields.processus')}
                    options={Object.entries(PROCESSUS_CODE_NAV_LABEL_KEYS).map(([code, labelKey]) => ({
                      value: code,
                      label: tNav(labelKey),
                    }))}
                  />
                  <FormSelect
                    name="statut"
                    label={tDossiers('columns.statut')}
                    options={DOSSIER_STATUTS.map((statut) => ({ value: statut, label: tStatuts(statut) }))}
                  />
                  <FormDatePicker
                    name="dateFrom"
                    label={tDossiers('search.dateFrom')}
                    toDate={dateToValue ?? undefined}
                  />
                  <FormDatePicker
                    name="dateTo"
                    label={tDossiers('search.dateTo')}
                    fromDate={dateFromValue ?? undefined}
                  />
                </div>
              </SectionCardContent>
              <SectionCardFooter className="justify-end gap-3">
                <Button type="button" variant="outline" onClick={onSearchReset} data-testid="dossiers-search-reset-button">
                  {tDossiers('search.reset')}
                </Button>
                <Button type="submit" data-testid="dossiers-search-submit-button">
                  {tDossiers('search.submit')}
                </Button>
              </SectionCardFooter>
            </SectionCard>
          </form>
        </FormProvider>
      )}

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{t('listTitle')}</h2>
          <p className="text-sm text-muted-foreground">{t('listSubtitle')}</p>
        </div>
        <DataTable
          columns={columns}
          data={dossiers}
          filters={filters}
          loading={isLoadingList}
          onRowClick={(row) => goToTraitement(row.referenceActe)}
          exportFilename="dossiers"
        />
      </div>
    </div>
  );
}
