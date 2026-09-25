'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Plus, Search, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { SummaryList } from '@/components/common/SummaryList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { SoaSearchField } from '@/components/forms/SoaSearchField';
import { FormAsyncSelectField } from '@/components/forms/FormAsyncSelectField';
import type { ComboboxOption } from '@/components/forms/FormCombobox';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { constatationSchema, type ConstatationFormData } from '@/lib/validations/constatation.schema';
import { useCreateConstatation } from '@/hooks/useConstatation';
import { useDernierEtatVehicule } from '@/hooks/useRecensement';
import { useVehicules } from '@/hooks/useVehicules';
import {
  useSectionsConstatation, useElementsConstatation, useEtatsGeneralConstate, useMarques, useGenres, useEnergies, useExperts,
} from '@/hooks/useReferentiels';
import type { ElementInput, LibelleInput } from '@/lib/api/constatation';
import type { Vehicule } from '@/lib/api/vehicules';
import type { DernierEtatVehicule } from '@/lib/api/recensement';
import type { MarqueVehicule, GenreVehicule, EnergieVehicule } from '@/lib/fixtures/referentiels.fixtures';
import { ROUTES } from '@/lib/constants/routes';

/** La constatation ne concerne jamais un véhicule déjà déclaré épave (code réservé au recensement) */
const ETAT_GENERAL_CODES_CONSTATATION = ['1', '2', '3'];

export default function NouvelleConstatationPage() {
  const t = useTranslations('processus.constatationTechnique');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof constatationSchema>, unknown, ConstatationFormData>({
    resolver: zodResolver(constatationSchema),
    defaultValues: {
      vehiculeId: '', numeroConstat: '', dateConstat: '', heureConstat: '', lieu: '',
      expertNom: '', soa: '', equipementVerif: '', kilometrage: 0, nomChauffeur: '', chauffeurContact: '', detenteur: '',
      etatGeneral: '', constats: '',
    },
  });

  const { data: vehicules = [] } = useVehicules();
  const { data: sections = [] } = useSectionsConstatation();
  const { data: etatsGeneral = [] } = useEtatsGeneralConstate();
  const { data: experts = [] } = useExperts();
  const { data: marques = [] } = useMarques();
  const { data: genres = [] } = useGenres();
  const { data: energies = [] } = useEnergies();
  const createConstatation = useCreateConstatation();

  const etatsGeneralConstatation = etatsGeneral.filter((e) => ETAT_GENERAL_CODES_CONSTATATION.includes(e.etatGeneralCode));

  const [elementStates, setElementStates] = useState<Record<string, 'C' | 'N' | undefined>>({});
  const [observations, setObservations] = useState<Record<string, string>>({});
  const [ordrePriorites, setOrdrePriorites] = useState<Record<string, number>>({});
  const [pneuPourcentages, setPneuPourcentages] = useState<Record<string, number>>({});
  const [pieces, setPieces] = useState<LibelleInput[]>([]);
  const [reparations, setReparations] = useState<LibelleInput[]>([]);
  const [accessoires, setAccessoires] = useState<LibelleInput[]>([]);
  const [nouvellePiece, setNouvellePiece] = useState('');
  const [nouvelleReparation, setNouvelleReparation] = useState('');
  const [nouvelAccessoire, setNouvelAccessoire] = useState('');

  const values = form.watch();
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);
  const selectedEtat = etatsGeneral.find((e) => e.etatGeneralCode === values.etatGeneral);

  // Le véhicule doit avoir été recensé (referentiel_siigpe.rsi_vehicule_etat) pour l'année de la
  // constatation, avec la même STRUCTURE que celle saisie ici — sinon le processus est bloqué
  // (retour BSCVA). soaDepositaire/detenteurEffectif ne sont plus maintenus sur la fiche véhicule
  // permanente depuis la refonte du recensement (voir rsi_vehicule_etat) : plus de pré-remplissage
  // basé dessus, la source de vérité est désormais la fiche ci-dessous.
  const { data: dernierEtat, isLoading: chargementEtat } = useDernierEtatVehicule(values.vehiculeId);
  const anneeConstat = values.dateConstat ? new Date(values.dateConstat).getFullYear() : undefined;
  const vehiculeRecense = Boolean(dernierEtat && Object.keys(dernierEtat).length > 0);
  const anneeCorrespond = !vehiculeRecense || !anneeConstat || String(anneeConstat) === dernierEtat?.exercice;
  const structureCorrespond = !vehiculeRecense || !dernierEtat?.soaCode || !values.soa
    || dernierEtat.soaCode.trim() === values.soa.trim();
  const blocageEtat: string | null = !values.vehiculeId || chargementEtat ? null
    : !vehiculeRecense ? t('ficheVehicule.erreurNonRecense')
    : !anneeCorrespond ? t('ficheVehicule.erreurAnneeDifferente', { annee: anneeConstat ?? '' })
    : !structureCorrespond ? t('ficheVehicule.erreurStructureDifferente')
    : null;

  // Détenteur/état général pré-remplis depuis le dernier recensement du véhicule — best-effort,
  // ne remplace jamais une valeur déjà saisie (pas de re-sync si l'utilisateur change de véhicule
  // après avoir déjà rempli ces champs, même limitation que l'ancien pré-remplissage retiré
  // plus haut dans cette conversation, cette fois sur la bonne source de vérité).
  useEffect(() => {
    if (!dernierEtat) return;
    if (!values.detenteur && dernierEtat.detenteurEffectif) form.setValue('detenteur', dernierEtat.detenteurEffectif);
    if (!values.etatGeneral && dernierEtat.etatGeneral) form.setValue('etatGeneral', dernierEtat.etatGeneral);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dernierEtat]);

  // Véhicules déjà chargés en intégralité côté client (useVehicules()) — recherche par
  // immatriculation en filtrant localement plutôt qu'en interrogeant une API (contrairement à
  // SoaSearchInput, nécessaire uniquement pour les 20 101 codes SOA).
  const fetchVehiculeOptions = useCallback(
    (query: string): Promise<ComboboxOption[]> => {
      const q = query.trim().toLowerCase();
      return Promise.resolve(
        vehicules
          .filter((v) => v.vehiculeImmatriculation.toLowerCase().includes(q))
          .slice(0, 20)
          .map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation })),
      );
    },
    [vehicules],
  );

  const elementsCount = Object.values(elementStates).filter((v) => v !== undefined).length;
  const elementsConformes = Object.values(elementStates).filter((v) => v === 'C').length;
  const elementsNonConformes = Object.values(elementStates).filter((v) => v === 'N').length;

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'),
      fields: ['expertNom', 'lieu', 'dateConstat', 'heureConstat', 'soa', 'vehiculeId', 'etatGeneral', 'kilometrage', 'detenteur', 'numeroConstat', 'equipementVerif', 'nomChauffeur', 'chauffeurContact', 'constats'] },
    { id: 'elements', title: t('elementsTitle') },
    { id: 'pieces-reparations', title: t('piecesRemplacerTitle') },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  function setConforme(elementId: string, value: 'C' | 'N') {
    setElementStates((prev) => ({ ...prev, [elementId]: value }));
  }

  async function onSubmit(data: ConstatationFormData) {
    const allElementIds = new Set([
      ...Object.keys(elementStates).filter((id) => elementStates[id] !== undefined),
      ...Object.keys(pneuPourcentages),
    ]);
    const elementsInput: ElementInput[] = Array.from(allElementIds).map((elementId) => ({
      elementId,
      conforme: elementStates[elementId],
      observation: observations[elementId] ?? '',
      ordrePriorite: ordrePriorites[elementId],
      pneuPourcentage: pneuPourcentages[elementId],
    }));

    await createConstatation.mutateAsync({ input: data, elements: elementsInput, pieces, reparations, accessoires });
    router.push(ROUTES.PROCESSUS_CONSTATATION);
  }

  return (
    <div data-testid="constatation-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_CONSTATATION)} data-testid="constatation-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="constatation-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormAsyncSelectField
                    name="vehiculeId"
                    label={t('fields.vehicule')}
                    required
                    ariaLabel={t('fields.vehicule')}
                    icon={<Search className="h-4 w-4" />}
                    placeholder="Rechercher par immatriculation…"
                    fetchOptions={fetchVehiculeOptions}
                    minCharsToSearch={1}
                    emptyMessage="Aucun véhicule trouvé pour cette immatriculation."
                    data-testid="constatation-vehicule-search"
                  />
                  <SoaSearchField name="soa" label={t('fields.soa')} />
                </div>

                {values.vehiculeId && (
                  <div className="mt-4">
                    <FicheVehiculeRecensement
                      dernierEtat={dernierEtat}
                      isLoading={chargementEtat}
                      vehicule={selectedVehicule}
                      marques={marques}
                      genres={genres}
                      energies={energies}
                      blocage={blocageEtat}
                      t={t}
                    />
                  </div>
                )}

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect
                    name="expertNom"
                    label={t('fields.expertNom')}
                    required
                    options={experts.map((e) => ({ value: e.expertNom, label: e.expertNom }))}
                  />
                  <FormField name="lieu" label={t('fields.lieu')} required />
                  <FormField name="dateConstat" label={t('fields.dateConstat')} type="date" required />
                  <FormField name="heureConstat" label={t('fields.heureConstat')} type="time" required />
                  <FormSelect name="etatGeneral" label={t('fields.etatGeneral')} required options={etatsGeneralConstatation.map((e) => ({ value: e.etatGeneralCode, label: e.libelle }))} />
                  <FormField name="kilometrage" label={t('fields.kilometrage')} type="number" required />
                  <FormField name="detenteur" label={t('fields.detenteur')} />
                  <FormField name="numeroConstat" label={t('fields.numeroConstat')} required />
                  <FormField name="equipementVerif" label={t('fields.equipementVerif')} />
                  <FormField name="nomChauffeur" label={t('fields.nomChauffeur')} required />
                  <FormField name="chauffeurContact" label={t('fields.chauffeurContact')} />
                </div>

                <div className="mt-4">
                  <FormTextarea name="constats" label={t('fields.constats')} />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={t('elementsTitle')}>
                <div className="space-y-6">
                  {sections.map((section) => (
                    <SectionElements
                      key={section.sectionId}
                      sectionId={section.sectionId}
                      sectionCode={section.sectionCode}
                      sectionLibelle={section.sectionLibelle}
                      states={elementStates}
                      observations={observations}
                      ordrePriorites={ordrePriorites}
                      pneuPourcentages={pneuPourcentages}
                      onSetConforme={setConforme}
                      onSetObservation={(elementId, value) => setObservations((prev) => ({ ...prev, [elementId]: value }))}
                      onSetOrdrePriorite={(elementId, value) => setOrdrePriorites((prev) => ({ ...prev, [elementId]: value }))}
                      onSetPneuPourcentage={(elementId, value) => setPneuPourcentages((prev) => ({ ...prev, [elementId]: value }))}
                      tConforme={t('conforme')}
                      tNonConforme={t('nonConforme')}
                      tOrdrePriorite={t('fields.ordrePriorite')}
                    />
                  ))}
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={2}>
              <FormSection title={t('piecesRemplacerTitle')}>
                <ListEditor
                  items={pieces}
                  value={nouvellePiece}
                  onValueChange={setNouvellePiece}
                  onAdd={() => { if (nouvellePiece.trim()) { setPieces((p) => [...p, { libelle: nouvellePiece.trim() }]); setNouvellePiece(''); } }}
                  onRemove={(idx) => setPieces((p) => p.filter((_, i) => i !== idx))}
                  addLabel={t('addPiece')}
                  testIdPrefix="constatation-piece"
                />
              </FormSection>

              <FormSection title={t('reparationsTitle')} className="mt-6">
                <ListEditor
                  items={reparations}
                  value={nouvelleReparation}
                  onValueChange={setNouvelleReparation}
                  onAdd={() => { if (nouvelleReparation.trim()) { setReparations((r) => [...r, { libelle: nouvelleReparation.trim() }]); setNouvelleReparation(''); } }}
                  onRemove={(idx) => setReparations((r) => r.filter((_, i) => i !== idx))}
                  addLabel={t('addReparation')}
                  testIdPrefix="constatation-reparation"
                />
              </FormSection>

              <FormSection title={t('accessoiresTitle')} className="mt-6">
                <ListEditor
                  items={accessoires}
                  value={nouvelAccessoire}
                  onValueChange={setNouvelAccessoire}
                  onAdd={() => { if (nouvelAccessoire.trim()) { setAccessoires((a) => [...a, { libelle: nouvelAccessoire.trim() }]); setNouvelAccessoire(''); } }}
                  onRemove={(idx) => setAccessoires((a) => a.filter((_, i) => i !== idx))}
                  addLabel={t('addAccessoire')}
                  testIdPrefix="constatation-accessoire"
                />
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={3}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.expertNom'), value: values.expertNom },
                    { label: t('fields.lieu'), value: values.lieu },
                    { label: t('fields.dateConstat'), value: values.dateConstat },
                    { label: t('fields.heureConstat'), value: values.heureConstat },
                    { label: t('fields.soa'), value: values.soa },
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.etatGeneral'), value: selectedEtat?.libelle },
                    { label: t('fields.kilometrage'), value: values.kilometrage as number | undefined },
                    { label: t('fields.detenteur'), value: values.detenteur },
                    { label: t('fields.numeroConstat'), value: values.numeroConstat },
                    { label: t('fields.equipementVerif'), value: values.equipementVerif },
                    { label: t('fields.nomChauffeur'), value: values.nomChauffeur },
                    { label: t('fields.chauffeurContact'), value: values.chauffeurContact },
                    { label: t('fields.constats'), value: values.constats },
                    { label: t('elementsTitle'), value: `${elementsCount} (${elementsConformes} ${t('conforme')} / ${elementsNonConformes} ${t('nonConforme')})` },
                  ]}
                />
                {(pieces.length > 0 || reparations.length > 0 || accessoires.length > 0) && (
                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {pieces.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">{t('piecesRemplacerTitle')}</p>
                        <ul className="divide-y divide-border rounded-sm border border-border">
                          {pieces.map((p, idx) => <li key={idx} className="px-3 py-2 text-sm">{p.libelle}</li>)}
                        </ul>
                      </div>
                    )}
                    {reparations.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">{t('reparationsTitle')}</p>
                        <ul className="divide-y divide-border rounded-sm border border-border">
                          {reparations.map((r, idx) => <li key={idx} className="px-3 py-2 text-sm">{r.libelle}</li>)}
                        </ul>
                      </div>
                    )}
                    {accessoires.length > 0 && (
                      <div>
                        <p className="mb-1 text-xs font-medium text-muted-foreground">{t('accessoiresTitle')}</p>
                        <ul className="divide-y divide-border rounded-sm border border-border">
                          {accessoires.map((a, idx) => <li key={idx} className="px-3 py-2 text-sm">{a.libelle}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </FormSection>
            </StepperStep>

            <StepperNav
              prevLabel={tCommon('previous')}
              nextLabel={tCommon('next')}
              submitLabel={tCommon('save')}
              nextDisabled={Boolean(blocageEtat)}
            />
          </Stepper>
        </form>
      </FormProvider>
    </div>
  );
}

function SectionElements({
  sectionId, sectionCode, sectionLibelle, states, observations, ordrePriorites, pneuPourcentages,
  onSetConforme, onSetObservation, onSetOrdrePriorite, onSetPneuPourcentage, tConforme, tNonConforme, tOrdrePriorite,
}: {
  sectionId: string;
  sectionCode: string;
  sectionLibelle: string;
  states: Record<string, 'C' | 'N' | undefined>;
  observations: Record<string, string>;
  ordrePriorites: Record<string, number>;
  pneuPourcentages: Record<string, number>;
  onSetConforme: (elementId: string, value: 'C' | 'N') => void;
  onSetObservation: (elementId: string, value: string) => void;
  onSetOrdrePriorite: (elementId: string, value: number) => void;
  onSetPneuPourcentage: (elementId: string, value: number) => void;
  tConforme: string;
  tNonConforme: string;
  tOrdrePriorite: string;
}) {
  const { data: elements = [], isLoading } = useElementsConstatation(sectionId);
  if (isLoading) return <p className="text-sm text-muted-foreground">{sectionLibelle} — chargement…</p>;
  if (elements.length === 0) return null;

  const isPneumatique = sectionCode === 'PNEUMATIQUE';

  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold text-foreground">{sectionLibelle}</h4>
      <ul className="space-y-2">
        {elements.map((el) => {
          const state = states[el.elementId];
          return (
            <li key={el.elementId} className="flex flex-col gap-2 rounded-sm border border-border p-2 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm">{el.elementLibelle}</span>
              <div className="flex flex-wrap items-center gap-2">
                {isPneumatique && (
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      className="w-20"
                      value={pneuPourcentages[el.elementId] ?? ''}
                      onChange={(e) => onSetPneuPourcentage(el.elementId, Number(e.target.value))}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                )}
                <Badge
                  variant={state === 'C' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onSetConforme(el.elementId, 'C')}
                >
                  {tConforme}
                </Badge>
                <Badge
                  variant={state === 'N' ? 'destructive' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => onSetConforme(el.elementId, 'N')}
                >
                  {tNonConforme}
                </Badge>
                {state === 'N' && (
                  <>
                    <Input
                      placeholder="Observation"
                      className="w-48"
                      value={observations[el.elementId] ?? ''}
                      onChange={(e) => onSetObservation(el.elementId, e.target.value)}
                    />
                    <Input
                      type="number"
                      min={1}
                      placeholder={tOrdrePriorite}
                      aria-label={tOrdrePriorite}
                      className="w-20"
                      value={ordrePriorites[el.elementId] ?? ''}
                      onChange={(e) => onSetOrdrePriorite(el.elementId, Number(e.target.value))}
                    />
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ListEditor({
  items, value, onValueChange, onAdd, onRemove, addLabel, testIdPrefix,
}: {
  items: LibelleInput[];
  value: string;
  onValueChange: (v: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  addLabel: string;
  testIdPrefix: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-end gap-3">
        <Input value={value} onChange={(e) => onValueChange(e.target.value)} placeholder={addLabel} data-testid={`${testIdPrefix}-input`} />
        <Button type="button" variant="outline" onClick={onAdd} data-testid={`${testIdPrefix}-add-button`}>
          <Plus className="mr-1.5 h-4 w-4" />
          {addLabel}
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="divide-y divide-border rounded-sm border border-border">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
              <span>{item.libelle}</span>
              <Button type="button" variant="ghost" size="icon" onClick={() => onRemove(idx)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Lecture seule des données du dernier recensement du véhicule choisi (referentiel_siigpe.
 * rsi_vehicule_etat) — sert à la fois d'aperçu pour l'utilisateur et de justification visuelle du
 * blocage calculé dans la page parente (`blocage`, déjà traduit). Les champs permanents (marque,
 * genre, n° moteur, énergie) viennent de la fiche véhicule elle-même, pas du recensement.
 */
function FicheVehiculeRecensement({
  dernierEtat, isLoading, vehicule, marques, genres, energies, blocage, t,
}: {
  dernierEtat?: DernierEtatVehicule;
  isLoading: boolean;
  vehicule?: Vehicule;
  marques: MarqueVehicule[];
  genres: GenreVehicule[];
  energies: EnergieVehicule[];
  blocage: string | null;
  t: (key: string, values?: Record<string, string | number>) => string;
}) {
  const marqueLibelle = marques.find((m) => m.marqueCode === vehicule?.marqueCode)?.libelle ?? vehicule?.marqueCode;
  const genreLibelle = genres.find((g) => g.genreCode === vehicule?.genreCode)?.libelle ?? vehicule?.genreCode;
  const energieLibelle = energies.find((e) => e.energieCode === vehicule?.sourceEnergie)?.libelle ?? vehicule?.sourceEnergie;

  return (
    <div className="mt-4 rounded-sm border border-border p-3">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{t('ficheVehicule.title')}</p>
      {isLoading ? (
        <p className="text-sm text-muted-foreground">{t('ficheVehicule.chargement')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
          <p><span className="text-muted-foreground">{t('ficheVehicule.structure')} :</span> {dernierEtat?.soaCode ?? '—'}</p>
          <p><span className="text-muted-foreground">{t('ficheVehicule.detenteur')} :</span> {dernierEtat?.detenteurEffectif ?? '—'}</p>
          <p><span className="text-muted-foreground">{t('ficheVehicule.type')} :</span> {dernierEtat?.type ?? '—'}</p>
          <p><span className="text-muted-foreground">{t('ficheVehicule.categorie')} :</span> {dernierEtat?.categorieUtilisation ?? '—'}</p>
          <p><span className="text-muted-foreground">{t('ficheVehicule.etatGeneral')} :</span> {dernierEtat?.etatGeneral ?? '—'}</p>
          <p><span className="text-muted-foreground">{t('ficheVehicule.marque')} :</span> {marqueLibelle ?? '—'}</p>
          <p><span className="text-muted-foreground">{t('ficheVehicule.genre')} :</span> {genreLibelle ?? '—'}</p>
          <p><span className="text-muted-foreground">{t('ficheVehicule.numeroMoteur')} :</span> {vehicule?.numeroMoteur ?? '—'}</p>
          <p><span className="text-muted-foreground">{t('ficheVehicule.energie')} :</span> {energieLibelle ?? '—'}</p>
        </div>
      )}
      {blocage && <p className="mt-2 text-sm text-destructive">{blocage}</p>}
    </div>
  );
}
