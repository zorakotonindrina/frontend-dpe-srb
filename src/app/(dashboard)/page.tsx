'use client';

import { Car, FolderOpen, ListTodo, FileStack } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { ProcessusCreationHub } from '@/components/processus/ProcessusCreationHub';
import { StatCard } from '@/components/stats/StatCard';
import { StatCardGrid } from '@/components/stats/StatCardGrid';
import { DonutChart } from '@/components/charts/DonutChart';
import { BarChart } from '@/components/charts/BarChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';
import { ROUTES } from '@/lib/constants/routes';
import { useVehicules } from '@/hooks/useVehicules';
import { useDossiers } from '@/hooks/useDossiers';
import { useWorkflowMesTaches } from '@/hooks/useWorkflow';
import { useDocuments } from '@/hooks/useDocuments';
import { PROCESSUS_CODE_NAV_LABEL_KEYS } from '@/lib/constants/processus';

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const tWorkflow = useTranslations('workflow');
  const tNav = useTranslations('nav');
  const tEtapes = useTranslations('dossiers.etapes');

  const { data: vehicules = [] } = useVehicules();
  const { data: dossiers = [] } = useDossiers();
  const { data: taches = [] } = useWorkflowMesTaches();
  const { data: documents = [] } = useDocuments();

  const dossiersEnCours = dossiers.filter((d) => d.statut !== 'CLOTURE' && d.statut !== 'REFUSE');

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
  ).map(([processus, count]) => ({ processus, [t('chartDossiersParProcessus')]: count }));

  return (
    <div data-testid="dashboard-page" className="space-y-8">
      <PageHeader title={t('title')} description={t('subtitle')} />

      <ProcessusCreationHub mode="liste" />

      <StatCardGrid columns={4}>
        <StatCard
          slug="vehicules"
          title={t('kpiVehicules')}
          value={vehicules.length}
          icon={<Car className="h-5 w-5" />}
          href={ROUTES.VEHICULES}
        />
        <StatCard
          slug="dossiers-en-cours"
          title={t('kpiDossiersEnCours')}
          value={dossiersEnCours.length}
          icon={<FolderOpen className="h-5 w-5" />}
          href={ROUTES.DOSSIERS}
        />
        <StatCard
          slug="taches-en-attente"
          title={t('kpiTachesEnAttente')}
          value={taches.length}
          icon={<ListTodo className="h-5 w-5" />}
          href={ROUTES.WORKFLOW_MES_TACHES}
        />
        <StatCard
          slug="documents-generes"
          title={t('kpiDocumentsGeneres')}
          value={documents.length}
          icon={<FileStack className="h-5 w-5" />}
          href={ROUTES.DOCUMENTS}
        />
      </StatCardGrid>

      <div className="grid gap-6 lg:grid-cols-2">
        <BarChart
          title={t('chartDossiersParProcessus')}
          data={dossiersParProcessus}
          bars={[{ key: t('chartDossiersParProcessus'), label: t('chartDossiersParProcessus') }]}
          xKey="processus"
        />
        <DonutChart
          title={t('chartDossiersParStatut')}
          data={vehiculesParEtat}
          centerLabel={t('kpiVehicules')}
          centerValue={String(vehicules.length)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">{t('tachesRecentesTitle')}</CardTitle>
        </CardHeader>
        <CardContent data-testid="dashboard-recent-tasks" className="max-h-[360px] overflow-y-auto">
          {taches.length === 0 ? (
            <p className="text-sm text-muted-foreground">{tWorkflow('empty')}</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-5">
              {taches.slice(0, 6).map((tache) => {
                const navLabelKey = PROCESSUS_CODE_NAV_LABEL_KEYS[tache.processusCode];
                return (
                  <li key={`${tache.referenceActe}-${tache.rang}`} className="text-sm">
                    <p className="font-medium text-foreground">
                      {tache.referenceActe}
                      {navLabelKey && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          {tNav(navLabelKey as Parameters<typeof tNav>[0])}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">{tEtapes(tache.tacheAFaire as Parameters<typeof tEtapes>[0])}</p>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
