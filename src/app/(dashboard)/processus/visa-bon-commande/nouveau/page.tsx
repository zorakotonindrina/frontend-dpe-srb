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
import { FormField } from '@/components/forms/FormField';
import { FormSelect } from '@/components/forms/FormSelect';
import { FormCheckbox } from '@/components/forms/FormCheckbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Stepper } from '@/components/stepper/Stepper';
import { StepperIndicator } from '@/components/stepper/StepperIndicator';
import { StepperStep } from '@/components/stepper/StepperStep';
import { StepperNav } from '@/components/stepper/StepperNav';
import type { StepConfig } from '@/components/stepper/stepper.types';
import { visaBcSchema, type VisaBcFormData } from '@/lib/validations/visaBc.schema';
import { useCreateVisaBc } from '@/hooks/useVisaBc';
import { useVehicules } from '@/hooks/useVehicules';
import {
  useConstatations, useConstatationPiecesRemplacer, useConstatationReparations, useConstatationAccessoires,
} from '@/hooks/useConstatation';
import type { VisaBcPieceInput } from '@/lib/api/visaBc';
import { ROUTES } from '@/lib/constants/routes';

export default function NouveauVisaBcPage() {
  const t = useTranslations('processus.visaBonCommande');
  const tCommon = useTranslations('common');
  const router = useRouter();

  const form = useForm<z.input<typeof visaBcSchema>, unknown, VisaBcFormData>({
    resolver: zodResolver(visaBcSchema),
    defaultValues: {
      vehiculeId: '', numeroBc: '', dateBc: '', fournisseur: '', adresseFournisseur: '', nif: '', stat: '',
      anneeCarteFiscale: '', referencePvConstat: '', grandsTravaux: false, decision: null, motifRefus: '',
    },
  });

  const { data: vehicules = [] } = useVehicules();
  const { data: constatations = [] } = useConstatations();
  const createVisaBc = useCreateVisaBc();

  const [pieces, setPieces] = useState<VisaBcPieceInput[]>([]);
  const [designation, setDesignation] = useState('');
  const [quantite, setQuantite] = useState('1');
  const [prixUnitaire, setPrixUnitaire] = useState('0');

  const values = form.watch();
  const selectedVehicule = vehicules.find((v) => v.vehiculeId === values.vehiculeId);
  const montantTotal = pieces.reduce((sum, p) => sum + p.prixUnitaire * p.quantite, 0);
  const anneeExercice = new Date().getFullYear();
  const constatationsDuVehicule = constatations.filter(
    (c) => c.vehiculeId === values.vehiculeId && new Date(c.dateConstat).getFullYear() === anneeExercice,
  );

  // Pièces/réparations/accessoires déjà enregistrées sur la constatation liée — la "demande
  // d'entretien/réparation" existe déjà à cette étape (processus réel, déjà passé par le vrai
  // circuit de validation multi-étapes), pas besoin d'en ressaisir le contenu à la main. La
  // désignation est choisie dans cette liste (voir étape "pieces"), jamais saisie librement.
  const selectedConstatation = constatationsDuVehicule.find((c) => c.referenceActe === values.referencePvConstat);
  const constatationId = selectedConstatation?.constatationId ?? '';
  const { data: piecesRemplacer = [] } = useConstatationPiecesRemplacer(constatationId);
  const { data: reparationsConstat = [] } = useConstatationReparations(constatationId);
  const { data: accessoiresConstat = [] } = useConstatationAccessoires(constatationId);
  const candidateLibelles = useMemo(
    () => [...piecesRemplacer, ...reparationsConstat, ...accessoiresConstat]
      .map((item) => item.libelle)
      .filter((libelle) => libelle.trim().length > 0),
    [piecesRemplacer, reparationsConstat, accessoiresConstat],
  );
  const designationsDejaAjoutees = new Set(pieces.map((p) => p.designation));
  const designationsDisponibles = candidateLibelles.filter((libelle) => !designationsDejaAjoutees.has(libelle));

  const anneeCarteFiscaleNonAJour = Boolean(values.anneeCarteFiscale) && values.anneeCarteFiscale !== String(anneeExercice);

  const STEPS: StepConfig[] = [
    { id: 'infos', title: t('title'),
      fields: ['vehiculeId', 'numeroBc', 'dateBc', 'fournisseur', 'adresseFournisseur', 'nif', 'stat', 'anneeCarteFiscale', 'referencePvConstat', 'grandsTravaux'] },
    { id: 'pieces', title: t('piecesTitle') },
    { id: 'confirmation', title: tCommon('confirmationTitle') },
  ];

  function addPiece() {
    if (!designation.trim()) return;
    setPieces((prev) => [...prev, { designation: designation.trim(), quantite: Number(quantite) || 1, prixUnitaire: Number(prixUnitaire) || 0 }]);
    setDesignation(''); setQuantite('1'); setPrixUnitaire('0');
  }

  function updatePieceUnitPrice(idx: number, value: string) {
    const prixUnitaireEdite = Number(value) || 0;
    setPieces((prev) => prev.map((p, i) => (i === idx ? { ...p, prixUnitaire: prixUnitaireEdite } : p)));
  }

  async function onSubmit(data: VisaBcFormData) {
    await createVisaBc.mutateAsync({ input: { ...data, montant: montantTotal }, pieces });
    router.push(ROUTES.PROCESSUS_VISA_BC);
  }

  return (
    <div data-testid="visa-bc-nouveau-page" className="space-y-6">
      <PageHeader
        title={t('newTitle')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={() => router.push(ROUTES.PROCESSUS_VISA_BC)} data-testid="visa-bc-cancel-button">
            {tCommon('cancel')}
          </Button>
        }
      />

      <FormProvider {...form}>
        <form data-testid="visa-bc-form" onSubmit={(e) => e.preventDefault()} noValidate className="space-y-6">
          <Stepper steps={STEPS} form={form} onComplete={form.handleSubmit(onSubmit)}>
            <StepperIndicator />

            <StepperStep stepIndex={0}>
              <FormSection title={t('title')}>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormSelect name="vehiculeId" label={t('fields.vehicule')} required options={vehicules.map((v) => ({ value: v.vehiculeId, label: v.vehiculeImmatriculation }))} />
                  <FormField name="numeroBc" label={t('fields.numeroBc')} required />
                  <FormField name="dateBc" label={t('fields.dateBc')} type="date" required />
                  <FormField name="fournisseur" label={t('fields.fournisseur')} required />
                  <FormField name="adresseFournisseur" label={t('fields.adresseFournisseur')} />
                  <FormField name="nif" label={t('fields.nif')} required />
                  <FormField name="stat" label={t('fields.stat')} required />
                  <FormField name="anneeCarteFiscale" label={t('fields.anneeCarteFiscale')} />
                  <FormSelect
                    name="referencePvConstat"
                    label={t('fields.referencePvConstat')}
                    disabled={!values.vehiculeId}
                    placeholder={values.vehiculeId ? undefined : t('selectionnerVehiculeDabord')}
                    options={constatationsDuVehicule.map((c) => ({
                      value: c.referenceActe,
                      label: `${c.referenceActe} — ${c.numeroConstat} (${c.dateConstat})`,
                    }))}
                  />
                  <FormCheckbox name="grandsTravaux" label={t('fields.grandsTravaux')} />
                </div>
                {anneeCarteFiscaleNonAJour && (
                  <p className="mt-2 text-sm text-amber-600">{t('carteFiscaleNonAJour')}</p>
                )}
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={1}>
              <FormSection title={t('piecesTitle')}>
                <div className="space-y-3">
                  <div className="hidden gap-3 text-xs font-medium text-muted-foreground sm:grid sm:grid-cols-4">
                    <span>{t('fields.designation')}</span>
                    <span>{t('fields.quantite')}</span>
                    <span>{t('fields.prixUnitaire')}</span>
                    <span />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                    <Select
                      value={designation}
                      onValueChange={(v) => { setDesignation(v ?? ''); setQuantite('1'); }}
                      disabled={designationsDisponibles.length === 0}
                      items={designationsDisponibles.map((libelle) => ({ value: libelle, label: libelle }))}
                    >
                      <SelectTrigger className="w-full" data-testid="visa-bc-designation-select">
                        <SelectValue placeholder={
                          designationsDisponibles.length === 0 ? t('aucunePieceDisponible') : t('fields.designation')
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {designationsDisponibles.map((libelle) => (
                          <SelectItem key={libelle} value={libelle}>{libelle}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input placeholder={t('fields.quantite')} type="number" min={1} value={quantite} onChange={(e) => setQuantite(e.target.value)} />
                    <Input placeholder={t('fields.prixUnitaire')} type="number" min={0} value={prixUnitaire} onChange={(e) => setPrixUnitaire(e.target.value)} />
                    <Button type="button" variant="outline" onClick={addPiece} disabled={!designation} data-testid="visa-bc-add-piece-button">
                      <Plus className="mr-1.5 h-4 w-4" />
                      {t('addPiece')}
                    </Button>
                  </div>
                  {pieces.length > 0 && (
                    <Table data-testid="visa-bc-pieces-table">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('fields.designation')}</TableHead>
                          <TableHead className="text-right">{t('fields.quantite')}</TableHead>
                          <TableHead className="text-right">{t('fields.prixUnitaire')}</TableHead>
                          <TableHead className="text-right">{t('fields.montant')}</TableHead>
                          <TableHead />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pieces.map((p, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{p.designation}</TableCell>
                            <TableCell className="text-right">{p.quantite}</TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min={0}
                                value={p.prixUnitaire}
                                onChange={(e) => updatePieceUnitPrice(idx, e.target.value)}
                                className="ml-auto w-28 text-right"
                                data-testid={`visa-bc-piece-prix-${idx}`}
                              />
                            </TableCell>
                            <TableCell className="text-right">{(p.quantite * p.prixUnitaire).toLocaleString('fr-FR')}</TableCell>
                            <TableCell>
                              <Button type="button" variant="ghost" size="icon" onClick={() => setPieces((prev) => prev.filter((_, i) => i !== idx))}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                  <p className="text-right text-sm font-semibold text-foreground">
                    {t('fields.montant')} : {montantTotal.toLocaleString('fr-FR')}
                  </p>
                </div>
              </FormSection>
            </StepperStep>

            <StepperStep stepIndex={2}>
              <FormSection title={tCommon('confirmationTitle')}>
                <SummaryList
                  items={[
                    { label: t('fields.vehicule'), value: selectedVehicule?.vehiculeImmatriculation },
                    { label: t('fields.numeroBc'), value: values.numeroBc },
                    { label: t('fields.dateBc'), value: values.dateBc },
                    { label: t('fields.fournisseur'), value: values.fournisseur },
                    { label: t('fields.adresseFournisseur'), value: values.adresseFournisseur },
                    { label: t('fields.nif'), value: values.nif },
                    { label: t('fields.stat'), value: values.stat },
                    { label: t('fields.anneeCarteFiscale'), value: values.anneeCarteFiscale },
                    { label: t('fields.montant'), value: montantTotal.toLocaleString('fr-FR') },
                    { label: t('fields.referencePvConstat'), value: values.referencePvConstat },
                    { label: t('fields.grandsTravaux'), value: values.grandsTravaux ? tCommon('yes') : tCommon('no') },
                  ]}
                />
                {pieces.length > 0 && (
                  <Table className="mt-4">
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('fields.designation')}</TableHead>
                        <TableHead className="text-right">{t('fields.quantite')}</TableHead>
                        <TableHead className="text-right">{t('fields.prixUnitaire')}</TableHead>
                        <TableHead className="text-right">{t('fields.montant')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pieces.map((p, idx) => (
                        <TableRow key={idx}>
                          <TableCell>{p.designation}</TableCell>
                          <TableCell className="text-right">{p.quantite}</TableCell>
                          <TableCell className="text-right">{p.prixUnitaire.toLocaleString('fr-FR')}</TableCell>
                          <TableCell className="text-right">{(p.quantite * p.prixUnitaire).toLocaleString('fr-FR')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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
