'use client';

import { useTranslations } from 'next-intl';
import { calculerConsommation } from '@/lib/utils/consommation-livret';

export interface ConsommationLivretProps {
  litres: number;
  km: number;
  testId?: string;
}

const formater = (n: number): string => n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });

/**
 * Consommation de l'année, **pour information** (non imprimée sur le visa) : total des litres de la feuille
 * Carburants ÷ total des distances du livret Parcours × 100. « Non calculable » si l'un des deux est vide.
 */
export function ConsommationLivret({ litres, km, testId = 'arretage-consommation' }: ConsommationLivretProps) {
  const t = useTranslations('processus.arretageLivret.consommation');
  const c = calculerConsommation(litres, km);

  return (
    <div className="rounded-sm border border-border bg-muted/40 p-3 text-sm" data-testid={testId}>
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t('titre')}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
        <p><span className="text-muted-foreground">{t('totalCarburant')} :</span> {formater(c.litres)} l</p>
        <p><span className="text-muted-foreground">{t('totalKm')} :</span> {formater(c.km)} km</p>
        <p>
          <span className="text-muted-foreground">{t('litresAux100')} :</span>{' '}
          {c.litresAux100km === null ? '—' : `${formater(c.litresAux100km)} L/100 km`}
        </p>
        <p>
          <span className="text-muted-foreground">{t('kmParLitre')} :</span>{' '}
          {c.kmParLitre === null ? '—' : `${formater(c.kmParLitre)} km/L`}
        </p>
      </div>
      {c.litresAux100km === null && <p className="mt-2 text-xs text-muted-foreground">{t('nonCalculable')}</p>}
      <p className="mt-2 text-xs text-muted-foreground">{t('information')}</p>
    </div>
  );
}
