'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { PageHeader } from '@/components/common/PageHeader';
import { FormSection } from '@/components/common/FormSection';
import { SummaryList } from '@/components/common/SummaryList';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormTextarea } from '@/components/forms/FormTextarea';
import { FormCombobox } from '@/components/forms/FormCombobox';
import { SoaSearchField } from '@/components/forms/SoaSearchField';
import { FicheEvaluationVehicule } from '@/components/evaluation/FicheEvaluationVehicule';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import {
  receptionNeufSchema, TYPES_ACQUISITION, TYPES_FINANCEMENT, type ReceptionNeufFormData,
} from '@/lib/validations/receptionNeuf.schema';
import { useCreateReceptionNeuf } from '@/hooks/useReceptionNeuf';
import { useGenres, useMarques, useCarrosseries, useEnergies, useAllCommunes } from '@/hooks/useReferentiels';
import { useSaveFichesEvaluation, enregistrerFichesApresCreation } from '@/hooks/useEvaluationFiche';
import type { FicheEvaluation } from '@/lib/api/evaluationFiche';
import { ficheVide } from '@/lib/utils/fiche-evaluation';
import type { ReceptionNeufLigneInput } from '@/lib/api/receptionNeuf';
import type { ReceptionNeufLigneDecision } from '@/lib/fixtures/receptionNeuf.fixtures';
import { ROUTES } from '@/lib/constants/routes';

const DECISION_LIGNE_OPTIONS: ReceptionNeufLigneDecision[] = ['SANS_CHANGEMENT', 'REDUCTION', 'REBUTEE'];

const LIGNE_DRAFT_INITIAL = {
  designation: '', immatriculation: '', genre: '', typeVeh: '', marque: '', numeroSerie: '',
  carrosserie: '', numeroMoteur: '', puissance: '', sourceEnergie: '', nombrePlace: 5,
  datePremiereMise: '', quantiteFacturee: 1, quantiteReconnue: 1,
  decision: 'SANS_CHANGEMENT' as ReceptionNeufLigneDecision,
  kilometrage: null as number | null, valeur: null as number | null, observation: '',
};

export default function NouvelleReceptionNeufPage() {
  const t = useTranslations('processus.receptionVaNeuf');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof receptionNeufSchema>, unknown, ReceptionNeufFormData>({
    resolver: zodResolver(receptionNeufSchema),
    defaultValues: {
      typeAcquisition: '', budgetCode: '', chapitre: '', article: '', compte: '', financement: '', nomFinancement: '',
      commune: '', referenceMarche: '', fournisseurNom: '', fournisseurAdresse: '', fournisseurStat: '', fournisseurNif: '',
      fournisseurAnneeCarteFiscale: '', soaCode: '', depositaireNom: '', commissionMembresEntite: '',
      commissionMembresDpe: '', datePv: '', heurePv: '',
    },
  });

  const [lignes, setLignes] = useState<ReceptionNeufLigneInput[]>([]);
  const [fiches, setFiches] = useState<FicheEvaluation[]>([]);
  const [ligneDraft, setLigneDraft] = useState(LIGNE_DRAFT_INITIAL);
  const createReceptionNeuf = useCreateReceptionNeuf();
  const saveFiches = useSaveFichesEvaluation();
  const { data: communes = [] } = useAllCommunes();
  // La valeur enregistrée est le libellé : plusieurs communes portent le même nom (districts
  // différents) et certains libellés ont des espaces de fin — on dédoublonne sur le libellé nettoyé,
  // sinon clés React et valeurs cmdk en double dans la liste déroulante.
  const communeOptions = useMemo(
    () => [...new Set(communes.map((c) => c.communeLibelle.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'fr'))
      .map((libelle) => ({ value: libelle, label: libelle })),
    [communes],
  );
  const { data: genres = [] } = useGenres();
  const { data: marques = [] } = useMarques();
  const { data: carrosseries = [] } = useCarrosseries();
  const { data: energies = [] } = useEnergies();

  const values = form.watch();

  // Année de carte fiscale : informatif, confronté à l'année de la réception (date du PV, à défaut
  // l'année courante) — avertissement non bloquant, comme sur le visa du bon de commande.
  const anneeReception = values.datePv ? new Date(values.datePv).getFullYear() : new Date().getFullYear();
  const carteFiscaleNonAJour = Boolean(values.fournisseurAnneeCarteFiscale)
    && values.fournisseurAnneeCarteFiscale !== String(anneeReception);

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'),
      fields: ['typeAcquisition', 'budgetCode', 'chapitre', 'article', 'compte', 'financement', 'nomFinancement', 'commune', 'referenceMarche', 'fournisseurNom', 'fournisseurAdresse', 'fournisseurStat', 'fournisseurNif', 'fournisseurAnneeCarteFiscale', 'soaCode', 'depositaireNom', 'commissionMembresEntite', 'commissionMembresDpe', 'datePv', 'heurePv'] },
    { id: 'lignes', title: t('lignesTitle') },
    { id: 'evaluation', title: t('evaluationTitle') },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  function addLigne() {
    if (!ligneDraft.designation.trim()) return;
    setLignes((prev) => [...prev, { ...ligneDraft, rang: prev.length + 1 }]);
    setFiches((prev) => [...prev, ficheVide(ligneDraft.immatriculation, ligneDraft.kilometrage)]);
    setLigneDraft(LIGNE_DRAFT_INITIAL);
  }

  async function onSubmit(data: ReceptionNeufFormData) {
    const cree = await createReceptionNeuf.mutateAsync({ input: data, lignes });
    // Étape « Évaluation » non bloquante : seules les fiches réellement remplies sont enregistrées.
    const remplies = fiches.filter((f) => f.elements.length > 0 || f.observation.trim() !== '' || f.kilometrage !== null);
    await enregistrerFichesApresCreation(saveFiches.mutateAsync, cree.referenceActe, remplies);
    router.push(ROUTES.PROCESSUS_RECEPTION_NEUF);
  }

  return (
    <div data-testid="reception-neuf-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_RECEPTION_NEUF)} data-testid="reception-neuf-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="reception-neuf-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect name="typeAcquisition" label={t('fields.typeAcquisition')} required
                    options={TYPES_ACQUISITION.map((v) => ({ value: v, label: t(`typeAcquisitionOptions.${v}`) }))} />
                  <FormSelect name="financement" label={t('fields.financement')}
                    options={TYPES_FINANCEMENT.map((v) => ({ value: v, label: t(`financementOptions.${v}`) }))} />
                  <FormField name="nomFinancement" label={t('fields.nomFinancement')} />
                  <FormField name="budgetCode" label={t('fields.budgetCode')} />
                  <FormField name="chapitre" label={t('fields.chapitre')} />
                  <FormField name="article" label={t('fields.article')} />
                  <FormField name="compte" label={t('fields.compte')} />
                  <FormCombobox name="commune" label={t('fields.commune')}
                    options={communeOptions}
                    placeholder={t('fields.communePlaceholder')} searchPlaceholder={t('fields.communeRecherche')} />
                  <FormField name="referenceMarche" label={t('fields.referenceMarche')} />
                  <FormField name="fournisseurNom" label={t('fields.fournisseurNom')} />
                  <FormField name="fournisseurAdresse" label={t('fields.fournisseurAdresse')} />
                  <FormField name="fournisseurNif" label={t('fields.fournisseurNif')} />
                  <FormField name="fournisseurAnneeCarteFiscale" label={t('fields.fournisseurAnneeCarteFiscale')} maxLength={4} />
                  <FormField name="fournisseurStat" label={t('fields.fournisseurStat')} />
                  <SoaSearchField name="soaCode" label={t('fields.soaCode')} />
                  <FormField name="depositaireNom" label={t('fields.depositaireNom')} required />
                  <FormField name="datePv" label={t('fields.datePv')} type="date" required />
                  <FormField name="heurePv" label={t('fields.heurePv')} type="time" />
                </div>
                {carteFiscaleNonAJour && (
                  <p className="mt-2 text-sm text-amber-600">{t('carteFiscaleNonAJour')}</p>
                )}
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FormTextarea name="commissionMembresEntite" label={t('fields.commissionMembresEntite')} rows={4}
                    placeholder={t('fields.commissionPlaceholder')} />
                  <FormTextarea name="commissionMembresDpe" label={t('fields.commissionMembresDpe')} rows={4}
                    placeholder={t('fields.commissionPlaceholder')} />
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={t('lignesTitle')}>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    <Input placeholder={t('fields.designation')} value={ligneDraft.designation} onChange={(e) => setLigneDraft((d) => ({ ...d, designation: e.target.value }))} />
                    <Input placeholder={t('fields.immatriculation')} value={ligneDraft.immatriculation} onChange={(e) => setLigneDraft((d) => ({ ...d, immatriculation: e.target.value }))} />
                    <Select value={ligneDraft.genre} onValueChange={(v) => setLigneDraft((d) => ({ ...d, genre: v as string }))} items={genres.map((g) => ({ value: g.genreCode, label: g.libelle }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder={t('fields.genre')} /></SelectTrigger>
                      <SelectContent>{genres.map((g) => <SelectItem key={g.genreCode} value={g.genreCode}>{g.libelle}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={ligneDraft.marque} onValueChange={(v) => setLigneDraft((d) => ({ ...d, marque: v as string }))} items={marques.map((m) => ({ value: m.marqueCode, label: m.libelle }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder={t('fields.marque')} /></SelectTrigger>
                      <SelectContent>{marques.map((m) => <SelectItem key={m.marqueCode} value={m.marqueCode}>{m.libelle}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={ligneDraft.carrosserie} onValueChange={(v) => setLigneDraft((d) => ({ ...d, carrosserie: v as string }))} items={carrosseries.map((c) => ({ value: c.carrosserieCode, label: c.libelle }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder={t('fields.carrosserie')} /></SelectTrigger>
                      <SelectContent>{carrosseries.map((c) => <SelectItem key={c.carrosserieCode} value={c.carrosserieCode}>{c.libelle}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={ligneDraft.sourceEnergie} onValueChange={(v) => setLigneDraft((d) => ({ ...d, sourceEnergie: v as string }))} items={energies.map((en) => ({ value: en.energieCode, label: en.libelle }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder={t('fields.sourceEnergie')} /></SelectTrigger>
                      <SelectContent>{energies.map((en) => <SelectItem key={en.energieCode} value={en.energieCode}>{en.libelle}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input placeholder={t('fields.typeVeh')} value={ligneDraft.typeVeh} onChange={(e) => setLigneDraft((d) => ({ ...d, typeVeh: e.target.value }))} />
                    <Input placeholder={t('fields.numeroSerie')} value={ligneDraft.numeroSerie} onChange={(e) => setLigneDraft((d) => ({ ...d, numeroSerie: e.target.value }))} />
                    <Input placeholder={t('fields.numeroMoteur')} value={ligneDraft.numeroMoteur} onChange={(e) => setLigneDraft((d) => ({ ...d, numeroMoteur: e.target.value }))} />
                    <Input placeholder={t('fields.puissance')} type="number" value={ligneDraft.puissance} onChange={(e) => setLigneDraft((d) => ({ ...d, puissance: e.target.value }))} />
                    <Input placeholder={t('fields.nombrePlace')} type="number" min={1} value={ligneDraft.nombrePlace} onChange={(e) => setLigneDraft((d) => ({ ...d, nombrePlace: Number(e.target.value) || 0 }))} />
                    <Input placeholder={t('fields.datePremiereMise')} type="date" value={ligneDraft.datePremiereMise} onChange={(e) => setLigneDraft((d) => ({ ...d, datePremiereMise: e.target.value }))} />
                    <Input placeholder={t('fields.quantiteFacturee')} type="number" min={0} value={ligneDraft.quantiteFacturee} onChange={(e) => setLigneDraft((d) => ({ ...d, quantiteFacturee: Number(e.target.value) || 0 }))} />
                    <Input placeholder={t('fields.quantiteReconnue')} type="number" min={0} value={ligneDraft.quantiteReconnue} onChange={(e) => setLigneDraft((d) => ({ ...d, quantiteReconnue: Number(e.target.value) || 0 }))} />
                    <Input placeholder={t('fields.kilometrage')} type="number" min={0} value={ligneDraft.kilometrage ?? ''} onChange={(e) => setLigneDraft((d) => ({ ...d, kilometrage: e.target.value === '' ? null : Number(e.target.value) }))} />
                    <Input placeholder={t('fields.valeur')} type="number" min={0} value={ligneDraft.valeur ?? ''} onChange={(e) => setLigneDraft((d) => ({ ...d, valeur: e.target.value === '' ? null : Number(e.target.value) }))} />
                    <Input placeholder={t('fields.observation')} value={ligneDraft.observation} onChange={(e) => setLigneDraft((d) => ({ ...d, observation: e.target.value }))} />
                    <Select value={ligneDraft.decision} onValueChange={(v) => setLigneDraft((d) => ({ ...d, decision: v as ReceptionNeufLigneDecision }))} items={DECISION_LIGNE_OPTIONS.map((v) => ({ value: v, label: t(`decisionOptions.${v}`) }))}>
                      <SelectTrigger className="w-full"><SelectValue placeholder={t('fields.decision')} /></SelectTrigger>
                      <SelectContent>{DECISION_LIGNE_OPTIONS.map((v) => <SelectItem key={v} value={v}>{t(`decisionOptions.${v}`)}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button type="button" variant="outline" onClick={addLigne} data-testid="reception-neuf-add-ligne-button">
                      <Plus className="mr-1.5 h-4 w-4" />
                      {t('addLigne')}
                    </Button>
                  </div>
                  {lignes.length > 0 && (
                    <ul className="divide-y divide-border rounded-sm border border-border">
                      {lignes.map((l, idx) => (
                        <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                          <span>{l.designation} — {l.immatriculation} — {l.marque} — {t(`decisionOptions.${l.decision}`)}</span>
                          <Button type="button" variant="ghost" size="icon" onClick={() => {
                            setLignes((prev) => prev.filter((_, i) => i !== idx).map((l2, i) => ({ ...l2, rang: i + 1 })));
                            setFiches((prev) => prev.filter((_, i) => i !== idx));
                          }}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={2}>
              <FormSection title={t('evaluationTitle')}>
                {lignes.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t('evaluationAucunVehicule')}</p>
                ) : (
                  <div className="space-y-6">
                    <p className="text-xs text-muted-foreground">{t('evaluationHint')}</p>
                    {lignes.map((l, idx) => (
                      <div key={idx} className="space-y-2 rounded-sm border border-border p-3">
                        <p className="text-sm font-semibold">{l.designation} — {l.immatriculation || '—'}</p>
                        <FicheEvaluationVehicule
                          value={fiches[idx] ?? ficheVide(l.immatriculation, l.kilometrage)}
                          immatriculationFigee
                          testIdPrefix={`reception-neuf-fiche-${idx}`}
                          onChange={(f) => setFiches((prev) => {
                            const copie = [...prev];
                            copie[idx] = f;
                            return copie;
                          })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={3}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.typeAcquisition'), value: values.typeAcquisition ? t(`typeAcquisitionOptions.${values.typeAcquisition}`) : undefined },
                    { label: t('fields.financement'), value: values.financement ? t(`financementOptions.${values.financement}`) : undefined },
                    { label: t('fields.nomFinancement'), value: values.nomFinancement },
                    { label: t('fields.budgetCode'), value: values.budgetCode },
                    { label: t('fields.chapitre'), value: values.chapitre },
                    { label: t('fields.article'), value: values.article },
                    { label: t('fields.compte'), value: values.compte },
                    { label: t('fields.commune'), value: values.commune },
                    { label: t('fields.referenceMarche'), value: values.referenceMarche },
                    { label: t('fields.fournisseurNom'), value: values.fournisseurNom },
                    { label: t('fields.fournisseurAdresse'), value: values.fournisseurAdresse },
                    { label: t('fields.fournisseurNif'), value: values.fournisseurNif },
                    { label: t('fields.fournisseurAnneeCarteFiscale'), value: values.fournisseurAnneeCarteFiscale },
                    { label: t('fields.fournisseurStat'), value: values.fournisseurStat },
                    { label: t('fields.soaCode'), value: values.soaCode },
                    { label: t('fields.depositaireNom'), value: values.depositaireNom },
                    { label: t('fields.commissionMembresEntite'), value: values.commissionMembresEntite },
                    { label: t('fields.commissionMembresDpe'), value: values.commissionMembresDpe },
                    { label: t('fields.datePv'), value: values.datePv },
                    { label: t('fields.heurePv'), value: values.heurePv },
                  ]}
                />
                {lignes.length > 0 && (
                  <ul className="mt-4 divide-y divide-border rounded-sm border border-border">
                    {lignes.map((l, idx) => (
                      <li key={idx} className="px-3 py-2 text-sm">
                        {l.designation} — {l.immatriculation} — {l.marque} — {l.quantiteFacturee}/{l.quantiteReconnue} — {t(`decisionOptions.${l.decision}`)}
                      </li>
                    ))}
                  </ul>
                )}
              </FormSection>
            </StepperStep>

            <StepperNav prevLabel={tCommon('previous')} nextLabel={tCommon('next')} submitLabel={tCommon('save')} />
          </Stepper>
        </form>
      </FormProvider>
    </div>
  );
}
