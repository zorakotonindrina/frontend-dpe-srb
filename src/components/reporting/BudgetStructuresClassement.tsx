'use client';

import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CHART_COLORS } from '@/lib/chart-utils';

export interface LigneBudgetStructure {
  soaCode: string;
  libelle: string;
  prevu: number;
  reel: number;
}

interface Props {
  annee: number;
  lignes: LigneBudgetStructure[];
  formater: (montant: number) => string;
}

const COULEUR_PREVU = CHART_COLORS[0];
const COULEUR_REEL = CHART_COLORS[1];

/**
 * Classement des STRUCTURES par budget prévu, comparé au réel de l'année précédente. Remplace un graphique à barres dont les libellés
 * (longs, jusqu'à 20 STRUCTURES) se chevauchaient : ici chaque libellé est affiché en entier, avec les montants en clair.
 */
export function BudgetStructuresClassement({ annee, lignes, formater }: Props) {
  const t = useTranslations('reporting.ia');
  const triees = [...lignes].sort((a, b) => b.prevu - a.prevu);
  const maximum = Math.max(1, ...triees.map((l) => Math.max(l.prevu, l.reel)));
  const largeur = (v: number) => `${Math.max(0.5, (v / maximum) * 100)}%`;

  return (
    <Card data-testid="budget-structures">
      <CardHeader>
        <CardTitle>{t('graphiqueBudget', { annee })}</CardTitle>
        <CardDescription>{t('graphiqueBudgetSousTitre', { anneePrecedente: annee - 1 })}</CardDescription>
        <div className="flex flex-wrap gap-4 pt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COULEUR_PREVU }} />
            {t('prevu', { annee })}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: COULEUR_REEL }} />
            {t('reel', { annee: annee - 1 })}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="divide-y">
          {triees.map((l, i) => {
            const ecart = l.reel ? (l.prevu - l.reel) / l.reel : null;
            const ecartArrondi = ecart === null ? null : Math.round(ecart * 1000) / 10;
            return (
              <li
                key={l.soaCode}
                data-testid={`budget-structure-${l.soaCode}`}
                className="grid grid-cols-[2rem_1fr] gap-x-3 gap-y-2 py-3 md:grid-cols-[2rem_minmax(0,22rem)_1fr_9rem] md:items-center"
              >
                <span className="text-sm font-semibold text-muted-foreground" aria-label={t('classement.rang', { rang: i + 1 })}>
                  {i + 1}
                </span>
                <div className="min-w-0" title={l.libelle}>
                  <p className="text-sm font-medium leading-snug">{l.libelle}</p>
                  <p className="text-xs text-muted-foreground">{l.soaCode}</p>
                </div>
                <div className="col-start-2 space-y-1 md:col-start-auto" aria-hidden>
                  <div className="h-2.5 rounded-sm" style={{ width: largeur(l.prevu), backgroundColor: COULEUR_PREVU }} />
                  <div className="h-2.5 rounded-sm" style={{ width: largeur(l.reel), backgroundColor: COULEUR_REEL }} />
                </div>
                <div className="col-start-2 flex items-center justify-between gap-2 text-xs md:col-start-auto md:flex-col md:items-end md:gap-0.5">
                  <span className="font-semibold tabular-nums" style={{ color: COULEUR_PREVU }}>{formater(l.prevu)}</span>
                  <span className="tabular-nums text-muted-foreground">{formater(l.reel)}</span>
                  {ecartArrondi !== null && (
                    <Badge variant="outline" className="tabular-nums">
                      {ecartArrondi === 0
                        ? t('classement.identique')
                        : t('classement.ecart', { ecart: `${ecartArrondi > 0 ? '+' : ''}${ecartArrondi.toLocaleString('fr-FR')} %` })}
                    </Badge>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
