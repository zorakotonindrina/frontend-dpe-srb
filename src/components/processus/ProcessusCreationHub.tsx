'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { ROUTES } from '@/lib/constants/routes';
import {
  PROCESSUS_CODE_NAV_LABEL_KEYS,
  PROCESSUS_CODE_NEW_ROUTES,
  PROCESSUS_CODE_ICONS,
} from '@/lib/constants/processus';
import { ProcessusCard } from './ProcessusCard';

export interface ProcessusCreationHubProps {
  /** `creation` (défaut, écran Dossiers) : chaque carte ouvre la création du processus.
   *  `liste` (tableau de bord) : chaque carte ouvre la liste, en consultation seule, des dossiers du processus. */
  mode?: 'creation' | 'liste';
}

/**
 * Hub des 11 processus métier. En mode `creation` (menu Dossiers), masqué pour les rôles sans droit
 * `processus:write` (validation/consultation/contrôle) — ils ne créent pas de dossiers. En mode `liste`
 * (tableau de bord), visible pour tous : la consultation est ouverte à tous les rôles, le traitement
 * reste réservé aux écrans dédiés.
 */
export function ProcessusCreationHub({ mode = 'creation' }: ProcessusCreationHubProps) {
  const liste = mode === 'liste';
  const t = useTranslations('processus');
  const tNav = useTranslations('nav');
  const tDashboard = useTranslations('dashboard');
  const { hasPermission } = useAuth();

  if (!liste && !hasPermission('processus:write')) {
    return (
      <section data-testid="processus-creation-hub" className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{tDashboard('newDossierSectionTitle')}</h2>
          <p className="text-sm text-muted-foreground">{tDashboard('newDossierSectionUnavailable')}</p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="processus-creation-hub" className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {tDashboard(liste ? 'listeDossiersSectionTitle' : 'newDossierSectionTitle')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {tDashboard(liste ? 'listeDossiersSectionSubtitle' : 'newDossierSectionSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Object.entries(PROCESSUS_CODE_NAV_LABEL_KEYS).map(([code, labelKey]) => (
          <ProcessusCard
            key={code}
            code={code}
            title={tNav(labelKey)}
            description={t(`${labelKey}.subtitle`)}
            href={liste ? ROUTES.DOSSIERS_LISTE(code) : PROCESSUS_CODE_NEW_ROUTES[code]}
            icon={PROCESSUS_CODE_ICONS[code]}
          />
        ))}
      </div>
    </section>
  );
}
