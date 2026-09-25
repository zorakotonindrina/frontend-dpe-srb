'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWorkflowMesTaches } from '@/hooks/useWorkflow';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants/routes';
import { PROCESSUS_CODE_NAV_LABEL_KEYS } from '@/lib/constants/processus';

export default function MesTachesPage() {
  const t = useTranslations('workflow');
  const tNav = useTranslations('nav');
  const tEtapes = useTranslations('dossiers.etapes');
  const router = useRouter();
  const { role } = useAuth();
  const { data: taches = [], isLoading } = useWorkflowMesTaches(role ? { roleCode: role } : undefined);

  return (
    <div data-testid="workflow-mes-taches-page" className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : taches.length === 0 ? (
        <p className="text-sm text-muted-foreground" data-testid="workflow-mes-taches-empty">{t('empty')}</p>
      ) : (
        <div className="space-y-3">
          {taches.map((tache) => {
            const navLabelKey = PROCESSUS_CODE_NAV_LABEL_KEYS[tache.processusCode];
            return (
              <Card key={`${tache.referenceActe}-${tache.rang}`}>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {tache.referenceActe}
                      {navLabelKey && (
                        <Badge variant="outline" className="ml-2">{tNav(navLabelKey as Parameters<typeof tNav>[0])}</Badge>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{tEtapes(tache.tacheAFaire as Parameters<typeof tEtapes>[0])}</p>
                    <p className="text-xs text-muted-foreground">{t('columns.dateDebut')} {tache.dateDebut}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => router.push(ROUTES.DOSSIER_DETAIL(tache.referenceActe))}
                      data-testid={`workflow-traiter-${tache.referenceActe}-${tache.rang}`}
                    >
                      {t('actions.traiter')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
