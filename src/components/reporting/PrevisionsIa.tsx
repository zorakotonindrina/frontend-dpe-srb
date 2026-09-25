'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Download, FlaskConical, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/components/charts/BarChart';
import { DataTable } from '@/components/data-table/DataTable';
import { DataTableColumnHeader } from '@/components/data-table/DataTableColumnHeader';
import { KpiCard } from '@/components/reporting/KpiCard';
import {
  useAnomaliesCarburant, useDelaisPrevus, useExporterPrevisionBudgetaire, useModelesIa, usePrevisionStructures,
  usePrevisionVehicules, useSuivreAnomalie,
} from '@/hooks/useReportingIa';
import type { AnomalieCarburant, DelaiProcessus, PrevisionVehicule, StatutAnomalie } from '@/lib/api/reportingIa';
import { PROCESSUS_CODE_NAV_LABEL_KEYS } from '@/lib/constants/processus';
import { estMeilleur, formaterIndicateur, qualiteModeles } from '@/lib/utils/qualite-modeles-ia';

/** Probabilité de grosse réparation (> 2 M Ar) à partir de laquelle un véhicule est signalé « à risque ». */
export const SEUIL_RISQUE_GROSSE_REPARATION = 0.5;

const ariary = (v: number) => `${Math.round(v).toLocaleString('fr-FR')} Ar`;
const millions = (v: number) => `${(v / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M Ar`;
const pct = (v: number) => `${Math.round(v * 100)} %`;

const STATUT_VARIANT: Record<StatutAnomalie, 'destructive' | 'secondary' | 'outline'> = {
  NOUVELLE: 'destructive',
  VERIFIEE: 'secondary',
  JUSTIFIEE: 'outline',
};

/**
 * Onglet « Prévisions IA » du Reporting : résultats des modèles entraînés hors ligne par `ia-siigpe` (schéma `ia`) — prévision
 * budgétaire par STRUCTURE et par véhicule, risque de grosse réparation, anomalies de carburant (traitables), délais prévus des dossiers
 * ouverts, et qualité des modèles comparée à la référence naïve.
 */
export function PrevisionsIa() {
  const t = useTranslations('reporting.ia');
  const tNav = useTranslations('nav');
  const { data: structuresToutes = [], isLoading: chargeStructures } = usePrevisionStructures();
  const { data: vehiculesTous = [], isLoading: chargeVehicules } = usePrevisionVehicules();
  const { data: anomalies = [], isLoading: chargeAnomalies } = useAnomaliesCarburant();
  const { data: delais = [], isLoading: chargeDelais } = useDelaisPrevus();
  const { data: modeles = [] } = useModelesIa();
  const suivre = useSuivreAnomalie();
  const exporter = useExporterPrevisionBudgetaire();

  // Plusieurs années cibles peuvent coexister : l'écran montre la plus récente.
  const annee = useMemo(() => Math.max(0, ...structuresToutes.map((s) => s.anneeCible), ...vehiculesTous.map((v) => v.anneeCible)), [structuresToutes, vehiculesTous]);
  const structures = structuresToutes.filter((s) => s.anneeCible === annee);
  const vehicules = vehiculesTous.filter((v) => v.anneeCible === annee);
  const qualite = useMemo(() => qualiteModeles(modeles), [modeles]);

  const budget = structures.reduce((s, x) => s + x.depensePrevue, 0);
  const budgetBas = structures.reduce((s, x) => s + x.borneBasse, 0);
  const budgetHaut = structures.reduce((s, x) => s + x.borneHaute, 0);
  const reelPrecedent = structures.reduce((s, x) => s + (Number(x.detail.reel_annee_precedente) || 0), 0);
  const aRisque = vehicules.filter((v) => (v.probaGrosseReparation ?? 0) >= SEUIL_RISQUE_GROSSE_REPARATION).length;
  const aVerifier = anomalies.filter((a) => a.statut === 'NOUVELLE').length;
  const dossiersOuverts = delais.reduce((s, d) => s + d.nbDossiersOuverts, 0);
  const delaiMoyen = dossiersOuverts ? delais.reduce((s, d) => s + d.delaiPrevuMoyen * d.nbDossiersOuverts, 0) / dossiersOuverts : 0;
  const enRetard = delais.reduce((s, d) => s + d.nbEnRetard, 0);

  const donneesGraphique = structures.map((s) => ({
    structure: s.soaLibelle ?? s.soaCode,
    prevu: s.depensePrevue,
    reel: Number(s.detail.reel_annee_precedente) || 0,
  }));

  const colonnesVehicules = useMemo<ColumnDef<PrevisionVehicule>[]>(() => [
    { accessorKey: 'vehiculeImmatriculation', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.immatriculation')} /> },
    { accessorKey: 'marque', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.marque')} /> },
    {
      id: 'structure', accessorFn: (v) => v.soaLibelle ?? v.soaDepositaire ?? '', filterFn: 'arrIncludesSome',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.structure')} />,
    },
    {
      accessorKey: 'depensePrevue',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.depensePrevue')} />,
      cell: ({ row }) => ariary(row.original.depensePrevue),
    },
    {
      id: 'fourchette', accessorFn: (v) => v.borneHaute,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.fourchette')} />,
      cell: ({ row }) => `${millions(row.original.borneBasse)} – ${millions(row.original.borneHaute)}`,
    },
    {
      id: 'reel', accessorFn: (v) => Number(v.detail.reel_annee_precedente) || 0,
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.reelPrecedent', { annee: annee - 1 })} />,
      cell: ({ getValue }) => ariary(getValue<number>()),
    },
    {
      accessorKey: 'probaGrosseReparation',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.probaGrosseReparation')} />,
      cell: ({ row }) => {
        const p = row.original.probaGrosseReparation;
        if (p === null) return '—';
        return <Badge variant={p >= SEUIL_RISQUE_GROSSE_REPARATION ? 'destructive' : 'outline'}>{pct(p)}</Badge>;
      },
    },
  ], [t, annee]);

  const colonnesAnomalies = useMemo<ColumnDef<AnomalieCarburant>[]>(() => [
    { accessorKey: 'vehiculeImmatriculation', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.immatriculation')} /> },
    { id: 'structure', accessorFn: (a) => a.soaLibelle ?? '', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.structure')} /> },
    { accessorKey: 'mois', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.mois')} />, cell: ({ row }) => row.original.mois.slice(0, 7) },
    { accessorKey: 'motif', header: t('colonnes.motif'), cell: ({ row }) => <span className="text-xs">{row.original.motif ?? '—'}</span> },
    {
      accessorKey: 'statut', filterFn: 'arrIncludesSome',
      header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.statut')} />,
      cell: ({ row }) => <Badge variant={STATUT_VARIANT[row.original.statut]}>{t(`statuts.${row.original.statut}`)}</Badge>,
    },
    {
      id: 'actions', header: '',
      cell: ({ row }) => row.original.statut !== 'NOUVELLE' ? null : (
        <div className="flex gap-1">
          <Button size="sm" variant="outline" disabled={suivre.isPending} data-testid={`anomalie-verifiee-${row.original.id}`}
            onClick={(e) => { e.stopPropagation(); suivre.mutate({ id: row.original.id, statut: 'VERIFIEE' }); }}>
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />{t('actions.verifiee')}
          </Button>
          <Button size="sm" variant="outline" disabled={suivre.isPending} data-testid={`anomalie-justifiee-${row.original.id}`}
            onClick={(e) => { e.stopPropagation(); suivre.mutate({ id: row.original.id, statut: 'JUSTIFIEE' }); }}>
            <CheckCircle2 className="mr-1 h-3.5 w-3.5" />{t('actions.justifiee')}
          </Button>
        </div>
      ),
    },
  ], [t, suivre]);

  const colonnesDelais = useMemo<ColumnDef<DelaiProcessus>[]>(() => [
    {
      accessorKey: 'processusCode', header: t('colonnes.processus'),
      cell: ({ row }) => {
        const cle = PROCESSUS_CODE_NAV_LABEL_KEYS[row.original.processusCode];
        return cle ? tNav(cle) : row.original.processusCode.replaceAll('_', ' ');
      },
    },
    { accessorKey: 'nbDossiersOuverts', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.dossiersOuverts')} /> },
    { accessorKey: 'delaiPrevuMoyen', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.delaiPrevu')} />, cell: ({ row }) => `${row.original.delaiPrevuMoyen} j` },
    { id: 'fourchetteDelai', header: t('colonnes.fourchette'), cell: ({ row }) => `${row.original.borneBasseMoyenne} – ${row.original.borneHauteMoyenne} j` },
    { accessorKey: 'ageMoyenJours', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.ageMoyen')} />, cell: ({ row }) => `${row.original.ageMoyenJours} j` },
    { accessorKey: 'nbEnRetard', header: ({ column }) => <DataTableColumnHeader column={column} title={t('colonnes.enRetard')} /> },
  ], [t, tNav]);

  const optionsStructures = [...new Set(vehicules.map((v) => v.soaLibelle ?? v.soaDepositaire ?? ''))].sort().map((s) => ({ value: s, label: s }));
  const optionsStatuts = (['NOUVELLE', 'VERIFIEE', 'JUSTIFIEE'] as const).map((s) => ({ value: s, label: t(`statuts.${s}`) }));

  const vide = !chargeStructures && !chargeVehicules && structures.length === 0 && vehicules.length === 0;

  return (
    <div data-testid="reporting-ia" className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="flex max-w-3xl items-start gap-2 text-sm text-muted-foreground" data-testid="reporting-ia-avertissement">
          <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" />
          {t('avertissement')}
        </p>
        <Button variant="outline" onClick={() => exporter.mutate(annee || undefined)} disabled={exporter.isPending || vide} data-testid="reporting-ia-export">
          <Download className="mr-1.5 h-4 w-4" />
          {t('exportExcel')}
        </Button>
      </div>

      {vide ? (
        <Card data-testid="reporting-ia-vide">
          <CardContent className="py-8 text-center text-sm text-muted-foreground">{t('vide')}</CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              title={t('kpi.budget', { annee })}
              value={millions(budget)}
              description={t('kpi.budgetDescription', { bas: millions(budgetBas), haut: millions(budgetHaut), reel: millions(reelPrecedent), anneePrecedente: annee - 1 })}
            />
            <KpiCard title={t('kpi.aRisque')} value={`${aRisque} / ${vehicules.length}`} description={t('kpi.aRisqueDescription', { seuil: pct(SEUIL_RISQUE_GROSSE_REPARATION) })} />
            <KpiCard title={t('kpi.anomalies')} value={aVerifier} description={t('kpi.anomaliesDescription', { total: anomalies.length })} />
            <KpiCard
              title={t('kpi.delai')}
              value={`${delaiMoyen.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} j`}
              description={t('kpi.delaiDescription', { ouverts: dossiersOuverts.toLocaleString('fr-FR'), retard: enRetard.toLocaleString('fr-FR') })}
            />
          </div>

          <BarChart
            title={t('graphiqueBudget', { annee })}
            subtitle={t('graphiqueBudgetSousTitre', { anneePrecedente: annee - 1 })}
            data={donneesGraphique}
            bars={[{ key: 'prevu', label: t('prevu', { annee }) }, { key: 'reel', label: t('reel', { annee: annee - 1 }) }]}
            xKey="structure"
            layout="horizontal"
            yFormatter={millions}
          />

          <Card>
            <CardHeader>
              <CardTitle>{t('vehicules.titre', { annee })}</CardTitle>
              <CardDescription>{t('vehicules.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={colonnesVehicules}
                data={vehicules}
                loading={chargeVehicules}
                searchColumn="vehiculeImmatriculation"
                filters={[{ columnId: 'structure', title: t('colonnes.structure'), options: optionsStructures }]}
                pageSize={10}
              />
            </CardContent>
          </Card>
        </>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('anomalies.titre')}</CardTitle>
          <CardDescription>{t('anomalies.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={colonnesAnomalies}
            data={anomalies}
            loading={chargeAnomalies}
            searchColumn="vehiculeImmatriculation"
            filters={[{ columnId: 'statut', title: t('colonnes.statut'), options: optionsStatuts }]}
            pageSize={10}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('delais.titre')}</CardTitle>
          <CardDescription>{t('delais.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable columns={colonnesDelais} data={delais} loading={chargeDelais} pageSize={10} />
        </CardContent>
      </Card>

      <Card data-testid="reporting-ia-qualite">
        <CardHeader>
          <CardTitle>{t('qualite.titre')}</CardTitle>
          <CardDescription>{t('qualite.description')}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          {qualite.map((q) => (
            <div key={q.code} className="space-y-2 rounded-lg border p-4" data-testid={`qualite-${q.code}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{t(`qualite.modeles.${q.code}`)}</p>
                <div className="flex gap-1">
                  <Badge variant={q.donneesConstruites ? 'outline' : 'secondary'}>{t(q.donneesConstruites ? 'qualite.construites' : 'qualite.reelles')}</Badge>
                  <Badge variant={q.batReference ? 'default' : 'destructive'}>{t(q.batReference ? 'qualite.batReference' : 'qualite.neBatPasReference')}</Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {t('qualite.methode', { methode: q.methodeRetenue })} · {t('qualite.donnees', { periode: q.periodeDonnees, n: q.nbExemples.toLocaleString('fr-FR') })} · {t('qualite.entraine', { date: q.dateEntrainement.slice(0, 10) })}
              </p>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="font-normal">{t('qualite.indicateur')}</th>
                    <th className="font-normal">{t('qualite.modele')}</th>
                    <th className="font-normal">{t(`qualite.references.${q.code}`)}</th>
                  </tr>
                </thead>
                <tbody>
                  {q.indicateurs.map((i) => (
                    <tr key={i.cle}>
                      <td>{t(`qualite.indicateurs.${i.cle}`)}</td>
                      <td className={estMeilleur(i) ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>{formaterIndicateur(i.modele, i.format)}</td>
                      <td className={!estMeilleur(i) && i.modele !== i.reference ? 'font-semibold' : ''}>{formaterIndicateur(i.reference, i.format)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="text-xs text-muted-foreground">{t(`qualite.lecture.${q.code}`)}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
