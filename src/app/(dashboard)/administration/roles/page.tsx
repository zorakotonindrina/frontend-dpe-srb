'use client';

import { useTranslations } from 'next-intl';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/common/Card';
import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, ROLE_PERMISSIONS, type UserRole } from '@/types/auth.types';
import { ETAPE_ROLE_MAP } from '@/lib/constants/etape-roles';
import { WORKFLOW_ETAPES, type EtapeCode } from '@/lib/constants/workflow-etapes';

/** ADMIN garde un accès universel (vérifié séparément dans EtapeActionPanel.tsx),
 * il n'apparaît dans aucune entrée de ETAPE_ROLE_MAP. */
function etapesDuRole(code: UserRole): EtapeCode[] {
  if (code === 'ADMIN') return [...WORKFLOW_ETAPES];
  return WORKFLOW_ETAPES.filter((etape) => ETAPE_ROLE_MAP[etape].includes(code));
}

export default function AdministrationRolesPage() {
  const t = useTranslations('administration.roles');
  const tEtapes = useTranslations('dossiers.etapes');
  const roles = Object.entries(ROLE_LABELS) as [UserRole, string][];

  return (
    <div data-testid="administration-roles-page" className="space-y-6">
      <PageHeader title={t('title')} description={t('subtitle')} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {roles.map(([code, libelle]) => (
          <Card key={code}>
            <CardContent className="space-y-3 p-4">
              <div>
                <Badge variant="outline" className="mb-2">{code}</Badge>
                <p className="text-sm text-foreground">{libelle}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">{t('permissionsTitle')}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {ROLE_PERMISSIONS[code].map((permission) => (
                    <Badge key={permission} variant="secondary" className="font-mono text-[10px]">{permission}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground">{t('etapesAutoriseesTitle')}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {etapesDuRole(code).map((etape) => (
                    <Badge key={etape} variant="outline" className="text-[10px]">{tEtapes(etape)}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
