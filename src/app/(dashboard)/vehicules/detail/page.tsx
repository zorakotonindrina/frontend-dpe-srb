'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useVehicule, useDeleteVehicule, useVehiculeHistorique } from '@/hooks/useVehicules';
import { useDossiers } from '@/hooks/useDossiers';
import { useEtatsGeneralConstate, useEtatsVehicule, useMinisteres } from '@/hooks/useReferentiels';
import { ROUTES } from '@/lib/constants/routes';
import type { MouvementVehicule } from '@/lib/api/vehiculeMouvements';
import type { Ministere } from '@/lib/fixtures/referentiels.fixtures';
import Link from 'next/link';

function Field({ label, value }: { label: string; value: string | number | boolean | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground">
        {typeof value === 'boolean' ? (value ? 'Oui' : 'Non') : (value ?? '—')}
      </dd>
    </div>
  );
}

/** Libellé ministère si connu, sinon le code brut — même repli que dossiers/detail/page.tsx. */
function ministereLibelle(minCode: string | undefined, ministeres: Ministere[]): string | undefined {
  if (!minCode) return undefined;
  return ministeres.find((m) => m.minCode === minCode)?.libelle ?? minCode;
}

/** Catégorie d'utilisation d'un recensement (code brut) — mêmes libellés que la fiche du recensement. */
const CATEGORIES_UTILISATION: Record<string, string> = { '1': 'Représentation', '2': 'Fonction', '3': 'Service' };

/** Libellés lisibles des codes d'état (état du véhicule BON/MOYEN/…, état général constaté 1 à 4) ; code brut sinon. */
interface LibellesEtats {
  etatVehicule: (code?: string) => string;
  etatGeneral: (code?: string) => string;
}

function libelle(liste: { code: string; libelle: string }[], code?: string): string {
  if (!code) return '—';
  return liste.find((e) => e.code === code)?.libelle ?? code;
}

/** Construit le texte "origine → destination" d'un mouvement selon son type. */
function describeMouvement(m: MouvementVehicule, ministeres: Ministere[], etats: LibellesEtats): string {
  switch (m.typeMouvement) {
    case 'AFFECTATION':
      return [ministereLibelle(m.minCodeDestination, ministeres), m.soaDestination, m.detenteurDestination]
        .filter(Boolean).join(' — ') || '—';
    case 'TRANSFERT':
      return `${ministereLibelle(m.minCodeOrigine, ministeres) ?? '—'} / ${m.soaOrigine ?? '—'} → ${ministereLibelle(m.minCodeDestination, ministeres) ?? '—'} / ${m.soaDestination ?? '—'}`;
    case 'CHANGEMENT_DETENTEUR':
      return `${m.detenteurOrigine ?? '—'} → ${m.detenteurDestination ?? '—'}`;
    case 'CHANGEMENT_ETAT':
      return `${etats.etatVehicule(m.etatOrigine)} → ${etats.etatVehicule(m.etatDestination)}`;
    case 'RECENSEMENT':
      return [
        m.exercice ? `Recensé pour ${m.exercice}` : 'Recensé',
        m.structureCode ? `STRUCTURE ${m.structureCode}${m.structureLibelle ? ` — ${m.structureLibelle}` : ''}` : undefined,
        m.detenteur ? `Détenteur : ${m.detenteur}` : undefined,
        m.etatGeneral
          ? `État général : ${m.etatGeneralOrigine ? `de ${etats.etatGeneral(m.etatGeneralOrigine)} à ` : ''}${etats.etatGeneral(m.etatGeneral)}`
          : undefined,
        m.categorieUtilisation ? `Catégorie : ${CATEGORIES_UTILISATION[m.categorieUtilisation] ?? m.categorieUtilisation}` : undefined,
      ].filter(Boolean).join(' · ');
    case 'REFORME':
    case 'CONDAMNATION':
      return m.referenceActe ?? '—';
    default:
      return '—';
  }
}

export default function VehiculeDetailPage() {
  const id = useSearchParams().get('id') ?? '';
  const t = useTranslations('vehicules');
  const router = useRouter();
  const { data: vehicule, isLoading } = useVehicule(id);
  const { data: dossiers = [] } = useDossiers();
  const { data: historique = [] } = useVehiculeHistorique(id);
  const { data: ministeres = [] } = useMinisteres();
  const { data: etatsVehicule = [] } = useEtatsVehicule();
  const { data: etatsGeneral = [] } = useEtatsGeneralConstate();
  const etats: LibellesEtats = {
    etatVehicule: (code) => libelle(etatsVehicule.map((e) => ({ code: e.etatVehicule, libelle: e.libelle })), code),
    etatGeneral: (code) => libelle(etatsGeneral.map((e) => ({ code: e.etatGeneralCode, libelle: e.libelle })), code),
  };
  const deleteVehicule = useDeleteVehicule();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [motif, setMotif] = useState('');

  const dossiersLies = dossiers.filter((d) => d.vehiculeId === id);

  if (isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!vehicule) return <p className="text-sm text-muted-foreground">Véhicule introuvable.</p>;

  function closeDeleteDialog() {
    setDeleteOpen(false);
    setMotif('');
  }

  function confirmDelete() {
    if (!motif.trim()) return;
    deleteVehicule.mutate(
      { id, motif: motif.trim() },
      { onSuccess: () => router.push(ROUTES.VEHICULES) },
    );
  }

  return (
    <div data-testid="vehicule-detail-page" className="space-y-6">
      <PageHeader
        title={vehicule.vehiculeImmatriculation}
        description={t('detailTitle')}
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="outline">{vehicule.etatVehicule}</Badge>
            <Link href={ROUTES.VEHICULE_EDIT(id)}>
              <Button variant="outline" size="sm" data-testid="vehicule-edit-button">
                <Pencil className="mr-1.5 h-4 w-4" />
                {t('actions.edit')}
              </Button>
            </Link>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setDeleteOpen(true)}
              data-testid="vehicule-delete-button"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              {t('actions.delete')}
            </Button>
          </div>
        }
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmDescription')}
        variant="destructive"
        loading={deleteVehicule.isPending}
        onConfirm={motif.trim() ? confirmDelete : undefined}
        testId="vehicule-delete-dialog"
      >
        <Textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder={t('deleteMotifPlaceholder')}
          aria-label={t('deleteMotifLabel')}
          data-testid="vehicule-delete-motif-input"
        />
      </ConfirmDialog>

      <Tabs defaultValue="informations">
        <TabsList>
          <TabsTrigger value="informations" data-testid="vehicule-tab-informations">{t('tabs.informations')}</TabsTrigger>
          <TabsTrigger value="historique" data-testid="vehicule-tab-historique">{t('tabs.historique')}</TabsTrigger>
          <TabsTrigger value="dossiers" data-testid="vehicule-tab-dossiers">{t('tabs.dossiers')}</TabsTrigger>
        </TabsList>

        <TabsContent value="informations" className="space-y-4 pt-4">
          <FormSection title={t('sections.identification')}>
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={t('fields.immatriculation')} value={vehicule.vehiculeImmatriculation} />
              <Field label={t('fields.marque')} value={vehicule.marqueLibelle ?? vehicule.marqueCode} />
              <Field label={t('fields.genre')} value={vehicule.genreCode} />
              <Field label={t('fields.carrosserie')} value={vehicule.carrosserieCode} />
              <Field label={t('fields.categorie')} value={vehicule.categorieVehicule} />
              <Field label={t('fields.energie')} value={vehicule.sourceEnergie} />
            </dl>
          </FormSection>

          <FormSection title={t('sections.caracteristiques')}>
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={t('fields.numeroMoteur')} value={vehicule.numeroMoteur} />
              <Field label={t('fields.vin')} value={vehicule.vin} />
              <Field label={t('fields.puissanceAdministrative')} value={vehicule.puissanceAdministrative} />
              <Field label={t('fields.pls')} value={vehicule.pls} />
              <Field label={t('fields.pv')} value={vehicule.pv} />
              <Field label={t('fields.cu')} value={vehicule.cu} />
              <Field label={t('fields.pt')} value={vehicule.pt} />
              <Field label={t('fields.valeurEstimative')} value={`${vehicule.valeurEstimative.toLocaleString('fr-FR')} Ar`} />
              <Field label={t('fields.datePremierMiseCirculation')} value={vehicule.datePremierMiseCirculation} />
              <Field label={t('fields.carteGrise')} value={vehicule.carteGrise} />
              <Field label={t('fields.livretsDisponibles')} value={vehicule.livretsDisponibles} />
            </dl>
          </FormSection>

          <FormSection title={t('sections.localisation')}>
            <dl className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label={t('fields.detenteurEffectif')} value={vehicule.detenteurEffectif} />
              <Field label={t('fields.region')} value={vehicule.regionLibelle ?? vehicule.regionCode} />
              <Field label={t('fields.district')} value={vehicule.districtLibelle ?? vehicule.districtCode} />
              <Field label={t('fields.commune')} value={vehicule.communeLibelle ?? vehicule.communeCode} />
            </dl>
          </FormSection>
        </TabsContent>

        <TabsContent value="historique" className="pt-4" data-testid="vehicule-historique-panel">
          {historique.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('emptyHistorique')}</p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-5">
              {historique.map((m) => (
                <li key={m.mouvementId} className="text-sm" data-testid={`vehicule-mouvement-${m.mouvementId}`}>
                  <p className="font-medium text-foreground">
                    {t(`historique.types.${m.typeMouvement}`)}
                    <span className="ml-2 text-xs text-muted-foreground">{m.dateMouvement}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {describeMouvement(m, ministeres, etats)}{m.motif ? ` — ${m.motif}` : ''}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </TabsContent>

        <TabsContent value="dossiers" className="pt-4">
          {dossiersLies.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('emptyDossiers')}</p>
          ) : (
            <ul className="space-y-2">
              {dossiersLies.map((d) => (
                <li key={d.referenceActe}>
                  <Link href={ROUTES.DOSSIER_DETAIL(d.referenceActe)} className="text-sm text-sky-600 hover:underline">
                    {d.referenceActe} — {d.dossierMotif}
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
