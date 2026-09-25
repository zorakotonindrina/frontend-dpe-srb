'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Download, Printer } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { KpiCard } from '@/components/reporting/KpiCard';
import { PrevisionsIa } from '@/components/reporting/PrevisionsIa';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVehicules } from '@/hooks/useVehicules';
import { useDossiers } from '@/hooks/useDossiers';
import { useVisasBc } from '@/hooks/useVisaBc';
import { useMinisteres } from '@/hooks/useReferentiels';
import { useExpertises } from '@/hooks/useExpertise';
import { exportReportingToExcel, type ReportingSheet } from '@/lib/utils/export-reporting-excel';

function formatAriary(value: number): string {
  return `${value.toLocaleString('fr-FR')} Ar`;
}

export default function ReportingPage() {
  const t = useTranslations('reporting');
  const [onglet, setOnglet] = useState('indicateurs');
  const { data: vehicules = [] } = useVehicules();
  const { data: dossiers = [] } = useDossiers();
  const { data: visasBc = [] } = useVisasBc();
  const { data: ministeres = [] } = useMinisteres();
  const { data: expertises = [] } = useExpertises();

  const vehiculesParCategorie = Object.entries(
    vehicules.reduce<Record<string, number>>((acc, v) => {
      acc[v.categorieVehicule] = (acc[v.categorieVehicule] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const vehiculesParEtat = Object.entries(
    vehicules.reduce<Record<string, number>>((acc, v) => {
      acc[v.etatVehicule] = (acc[v.etatVehicule] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([name, value]) => ({ name, value }));

  const dossiersParProcessus = Object.entries(
    dossiers.reduce<Record<string, number>>((acc, d) => {
      acc[d.typeActe] = (acc[d.typeActe] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([processus, count]) => ({ processus, [t('dossiersParProcessus')]: count }));

  const depensesTotales = visasBc.reduce((sum, v) => sum + v.montant, 0);
  const vehiculesACondamner = vehicules.filter((v) => v.statut === 'CONDAMNE');

  const depensesParVehiculeMap = new Map<string, number>();
  const frequenceParVehiculeMap = new Map<string, number>();
  for (const bc of visasBc) {
    depensesParVehiculeMap.set(bc.vehiculeId, (depensesParVehiculeMap.get(bc.vehiculeId) ?? 0) + bc.montant);
    frequenceParVehiculeMap.set(bc.vehiculeId, (frequenceParVehiculeMap.get(bc.vehiculeId) ?? 0) + 1);
  }
  function immatriculationOf(vehiculeId: string): string {
    return vehicules.find((v) => v.vehiculeId === vehiculeId)?.vehiculeImmatriculation ?? vehiculeId;
  }
  const depensesParVehicule = [...depensesParVehiculeMap.entries()]
    .map(([vehiculeId, montant]) => ({ vehicule: immatriculationOf(vehiculeId), montant }))
    .sort((a, b) => b.montant - a.montant);
  const frequenceReparations = [...frequenceParVehiculeMap.entries()]
    .map(([vehiculeId, count]) => ({ vehicule: immatriculationOf(vehiculeId), count }))
    .sort((a, b) => b.count - a.count);

  const depensesParMinistereMap = new Map<string, number>();
  const depensesParSoaMap = new Map<string, number>();
  for (const bc of visasBc) {
    const vehicule = vehicules.find((v) => v.vehiculeId === bc.vehiculeId);
    if (!vehicule) continue;
    depensesParMinistereMap.set(vehicule.minCode, (depensesParMinistereMap.get(vehicule.minCode) ?? 0) + bc.montant);
    depensesParSoaMap.set(vehicule.soaDepositaire, (depensesParSoaMap.get(vehicule.soaDepositaire) ?? 0) + bc.montant);
  }
  const depensesParMinistere = [...depensesParMinistereMap.entries()].map(([minCode, montant]) => ({
    ministere: ministeres.find((m) => m.minCode === minCode)?.libelle ?? minCode,
    montant,
  }));
  const depensesParSoa = [...depensesParSoaMap.entries()].map(([soa, montant]) => ({ soa, montant }));

  function handleExportExcel() {
    const sheets: ReportingSheet[] = [
      { name: t('vehiculesParCategorie'), headers: [t('vehiculesParCategorie'), t('columns.total')], rows: vehiculesParCategorie.map((r) => [r.name, r.value]) },
      { name: t('vehiculesParEtat'), headers: [t('vehiculesParEtat'), t('columns.total')], rows: vehiculesParEtat.map((r) => [r.name, r.value]) },
      { name: t('dossiersParProcessus'), headers: [t('dossiersParProcessus'), t('columns.total')], rows: dossiersParProcessus.map((r) => [r.processus, r[t('dossiersParProcessus')] as number]) },
      { name: t('depensesParVehicule'), headers: [t('columns.vehicule'), t('columns.montant')], rows: depensesParVehicule.map((r) => [r.vehicule, r.montant]) },
      { name: t('depensesParMinistere'), headers: [t('columns.ministere'), t('columns.montant')], rows: depensesParMinistere.map((r) => [r.ministere, r.montant]) },
      { name: t('depensesParSoa'), headers: [t('columns.soa'), t('columns.montant')], rows: depensesParSoa.map((r) => [r.soa, r.montant]) },
      { name: t('frequenceReparations'), headers: [t('columns.vehicule'), t('columns.total')], rows: frequenceReparations.map((r) => [r.vehicule, r.count]) },
      { name: t('vehiculesACondamner'), headers: [t('columns.vehicule')], rows: vehiculesACondamner.map((v) => [v.vehiculeImmatriculation]) },
    ];
    exportReportingToExcel(sheets);
  }

  return (
    <div data-testid="reporting-page" className="space-y-6">
      <PageHeader
        title={t('title')}
        description={t('subtitle')}
        actions={onglet !== 'indicateurs' ? undefined : (
          <div className="flex gap-2 print:hidden">
            <Button variant="outline" onClick={handleExportExcel} data-testid="reporting-export-excel">
              <Download className="mr-1.5 h-4 w-4" />
              {t('exportExcel')}
            </Button>
            <Button variant="outline" onClick={() => window.print()} data-testid="reporting-export-pdf">
              <Printer className="mr-1.5 h-4 w-4" />
              {t('exportPdf')}
            </Button>
          </div>
        )}
      />

      <Tabs value={onglet} onValueChange={setOnglet}>
        <TabsList className="print:hidden">
          <TabsTrigger value="indicateurs" data-testid="reporting-tab-indicateurs">{t('onglets.indicateurs')}</TabsTrigger>
          <TabsTrigger value="ia" data-testid="reporting-tab-ia">{t('onglets.ia')}</TabsTrigger>
        </TabsList>

        <TabsContent value="indicateurs" className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard title={t('depensesTotales')} value={formatAriary(depensesTotales)} />
            <KpiCard title={t('vehiculesAccidentes')} value={expertises.length} />
            <KpiCard title={t('vehiculesACondamner')} value={vehiculesACondamner.length} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <DonutChart title={t('vehiculesParCategorie')} data={vehiculesParCategorie} />
            <DonutChart title={t('vehiculesParEtat')} data={vehiculesParEtat} />
          </div>

          <BarChart
            title={t('dossiersParProcessus')}
            data={dossiersParProcessus}
            bars={[{ key: t('dossiersParProcessus'), label: t('dossiersParProcessus') }]}
            xKey="processus"
          />

          <BarChart
            title={t('depensesParVehicule')}
            data={depensesParVehicule}
            bars={[{ key: 'montant', label: t('depensesParVehicule') }]}
            xKey="vehicule"
            layout="horizontal"
            yFormatter={formatAriary}
          />

          <BarChart
            title={t('frequenceReparations')}
            data={frequenceReparations}
            bars={[{ key: 'count', label: t('frequenceReparations') }]}
            xKey="vehicule"
            layout="horizontal"
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <BarChart
              title={t('depensesParMinistere')}
              data={depensesParMinistere}
              bars={[{ key: 'montant', label: t('depensesParMinistere') }]}
              xKey="ministere"
              yFormatter={formatAriary}
            />
            <BarChart
              title={t('depensesParSoa')}
              data={depensesParSoa}
              bars={[{ key: 'montant', label: t('depensesParSoa') }]}
              xKey="soa"
              yFormatter={formatAriary}
            />
          </div>
        </TabsContent>

        <TabsContent value="ia">
          <PrevisionsIa />
        </TabsContent>
      </Tabs>
    </div>
  );
}
