'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useChauffeurs } from '@/hooks/useChauffeurs';
import { useChauffeurTests } from '@/hooks/useChauffeurTest';
import { useMinisteres } from '@/hooks/useReferentiels';
import { ROUTES } from '@/lib/constants/routes';

function Field({ label, value }: { label: string; value: string | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">{value ?? '—'}</dd>
    </div>
  );
}

export default function ChauffeurDetailPage() {
  const id = useSearchParams().get('id') ?? '';
  const t = useTranslations('chauffeurs');
  const tTest = useTranslations('processus.testChauffeur');
  const { data: chauffeurs = [], isLoading } = useChauffeurs();
  const { data: allTests = [] } = useChauffeurTests();
  const { data: ministeres = [] } = useMinisteres();

  const chauffeur = chauffeurs.find((c) => c.chauffeurId === id);
  const tests = allTests.filter((test) => test.chauffeurId === id);

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!chauffeur) return <p className="text-sm text-muted-foreground">Chauffeur introuvable.</p>;

  const ministereLibelle = ministeres.find((m) => m.minCode === chauffeur.minCode)?.libelle ?? chauffeur.minCode;

  return (
    <div data-testid="chauffeur-detail-page" className="space-y-6">
      <PageHeader title={chauffeur.nom} description={t('detailTitle')} />

      <Tabs defaultValue="informations">
        <TabsList>
          <TabsTrigger value="informations" data-testid="chauffeur-tab-informations">{t('tabs.informations')}</TabsTrigger>
          <TabsTrigger value="tests" data-testid="chauffeur-tab-tests">{t('tabs.tests')}</TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="space-y-4 pt-4">
          <FormSection title={t('sections.identification')}>
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={t('fields.nom')} value={chauffeur.nom} />
              <Field label={t('fields.matricule')} value={chauffeur.matricule} />
              <Field label={t('fields.cin')} value={chauffeur.cin} />
              <Field label={t('fields.permis')} value={chauffeur.permis} />
              <Field label={t('fields.minCode')} value={ministereLibelle} />
              <Field label={t('fields.soaCode')} value={chauffeur.soaCode} />
            </dl>
          </FormSection>
        </TabsContent>

        <TabsContent value="tests" className="pt-4" data-testid="chauffeur-tests-panel">
          {tests.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('emptyTests')}</p>
          ) : (
            <ul className="space-y-3">
              {tests.map((test) => (
                <li key={test.testId} data-testid={`chauffeur-test-${test.testId}`}>
                  <Link
                    href={ROUTES.DOSSIER_DETAIL(test.referenceActe)}
                    className="block rounded-md border border-border p-3 text-sm hover:bg-muted/50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{test.dateTest}</span>
                      {test.resultat ? (
                        <Badge variant={test.resultat === 'NON_APTE' ? 'destructive' : 'default'}>
                          {test.resultat === 'NON_APTE' ? tTest('resultatDefavorable') : tTest('resultatFavorable')}
                        </Badge>
                      ) : (
                        <Badge variant="outline">{test.statut}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {tTest('fields.examinateurNom')} : {test.examinateurNom}
                    </p>
                    {test.observations && (
                      <p className="mt-1 text-xs text-muted-foreground">{test.observations}</p>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
