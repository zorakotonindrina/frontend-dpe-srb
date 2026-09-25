'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { SoaSearchInput } from '@/components/forms/SoaSearchInput';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useCreateVehiculeQuick, useUpdateVehicule } from '@/hooks/useVehicules';
import {
  useMarques, useGenres, useCarrosseries, useEnergies,
  useCategoriesUtilisationVehicule, useEtatsGeneralConstate,
} from '@/hooks/useReferentiels';
import type { Vehicule } from '@/lib/api/vehicules';
import { recensementApi, type RecensementLigneInput } from '@/lib/api/recensement';

export interface VehiculeQuickAddPanelProps {
  /** Véhicules déjà chargés par la page appelante (`useVehicules()`) — réutilisés ici pour détecter
   *  une immatriculation déjà connue sans appel réseau supplémentaire. */
  existingVehicules: Vehicule[];
  /** Pré-remplissage silencieux (non affiché) depuis l'en-tête du dossier appelant. */
  defaultMinCode?: string;
  /** Non nul = édition d'une ligne déjà ajoutée à la liste (rouvre le panneau pré-rempli). */
  editing?: { ligne: RecensementLigneInput; vehicule: Vehicule } | null;
  onSaved: (ligne: RecensementLigneInput, vehiculeId: string, immatriculation: string) => void;
  onCancelEdit?: () => void;
}

const emptyForm = {
  immatriculation: '', marqueCode: '', genreCode: '', carrosserieCode: '',
  puissanceAdministrative: '', numeroMoteur: '', sourceEnergie: '', dateMiseCirculation: '',
  soaCode: '', stdCtd: '', detenteurEffectif: '', type: '', categorieUtilisation: '', etatGeneral: '',
};

/** Construit l'état initial du formulaire depuis `editing` — utilisé comme initialiseur de
 *  `useState`, jamais dans un effet : la page appelante force un remount (prop `key` sur
 *  `editingIndex`) quand la ligne éditée change, ce qui suffit à réinitialiser cet état sans
 *  synchronisation manuelle (évite le anti-pattern "setState dans un effet"). */
function buildFormFromEditing(editing: VehiculeQuickAddPanelProps['editing']) {
  if (!editing) return emptyForm;
  const { ligne, vehicule } = editing;
  return {
    immatriculation: vehicule.vehiculeImmatriculation,
    marqueCode: vehicule.marqueCode,
    genreCode: vehicule.genreCode,
    carrosserieCode: vehicule.carrosserieCode,
    puissanceAdministrative: vehicule.puissanceAdministrative ? String(vehicule.puissanceAdministrative) : '',
    numeroMoteur: vehicule.numeroMoteur,
    sourceEnergie: vehicule.sourceEnergie,
    dateMiseCirculation: vehicule.datePremierMiseCirculation ? vehicule.datePremierMiseCirculation.slice(0, 10) : '',
    // SOA/STD-CTD sont portés par la ligne de recensement (peuvent changer d'une campagne à
    // l'autre pour un même véhicule), jamais par la fiche véhicule elle-même.
    soaCode: ligne.soaCode,
    stdCtd: ligne.stdCtd,
    detenteurEffectif: ligne.detenteurEffectif,
    type: ligne.type,
    categorieUtilisation: ligne.categorieUtilisation,
    etatGeneral: ligne.etatGeneral,
  };
}

/**
 * Panneau unique de création/rattachement d'un véhicule à une ligne de recensement — fusionne les
 * champs techniques du véhicule (canevas papier, `utils/IMPRIMES DIGITALISATION 2026.xlsx`, feuille
 * "Modele Canevas") et les champs propres à la ligne (type, catégorie d'utilisation, état général,
 * carte grise, livrets, détenteur effectif — retour utilisateurs : ça doit être une seule action,
 * pas "créer le véhicule" puis "ajouter la ligne" séparément).
 *
 * Toujours visible dans l'étape "lignes" (plus de sélecteur de véhicule existant à côté duquel se
 * greffer — retiré à la demande du métier). Si l'immatriculation saisie correspond à un véhicule
 * déjà présent dans `existingVehicules`, ses champs sont pré-remplis et la sauvegarde met à jour ce
 * véhicule (`PUT`) au lieu d'en créer un nouveau (`POST`) — un véhicule recensé lors d'une campagne
 * précédente ne doit pas provoquer une erreur de doublon sur l'immatriculation (contrainte UNIQUE).
 *
 * Contrôlé, pas lié à React Hook Form (l'étape "lignes" du wizard recensement gère ses champs hors
 * de tout `FormProvider`).
 */
export function VehiculeQuickAddPanel({
  existingVehicules, defaultMinCode, editing, onSaved, onCancelEdit,
}: VehiculeQuickAddPanelProps) {
  const t = useTranslations('processus.recensement.vehiculeQuickAdd');
  const tFields = useTranslations('processus.recensement.fields');
  const tCommon = useTranslations('common');
  const selectPlaceholder = 'Choisir…';

  const { data: marques = [] } = useMarques();
  const { data: genres = [] } = useGenres();
  const { data: carrosseries = [] } = useCarrosseries();
  const { data: energies = [] } = useEnergies();
  const { data: categoriesUtilisation = [] } = useCategoriesUtilisationVehicule();
  const { data: etatsGeneral = [] } = useEtatsGeneralConstate();
  const createVehicule = useCreateVehiculeQuick();
  const updateVehicule = useUpdateVehicule();

  const [form, setForm] = useState(() => buildFormFromEditing(editing));
  const [carteGriseDispo, setCarteGriseDispo] = useState(editing?.ligne.carteGriseDispo ?? false);
  const [livretsDispo, setLivretsDispo] = useState(editing?.ligne.livretsDispo ?? false);
  const [matchedVehiculeId, setMatchedVehiculeId] = useState<string | null>(editing?.vehicule.vehiculeId ?? null);
  const [loadingEtat, setLoadingEtat] = useState(false);
  const [error, setError] = useState('');

  function set<K extends keyof typeof emptyForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setCarteGriseDispo(false);
    setLivretsDispo(false);
    setMatchedVehiculeId(null);
    setError('');
  }

  async function handleImmatriculationBlur() {
    const trimmed = form.immatriculation.trim();
    if (!trimmed) { setMatchedVehiculeId(editing ? editing.vehicule.vehiculeId : null); return; }
    const found = existingVehicules.find(
      (v) => v.vehiculeImmatriculation.trim().toLowerCase() === trimmed.toLowerCase(),
    );
    if (found) {
      setMatchedVehiculeId(found.vehiculeId);
      setForm((prev) => ({
        ...prev,
        marqueCode: found.marqueCode,
        genreCode: found.genreCode,
        carrosserieCode: found.carrosserieCode,
        puissanceAdministrative: found.puissanceAdministrative ? String(found.puissanceAdministrative) : '',
        numeroMoteur: found.numeroMoteur,
        sourceEnergie: found.sourceEnergie,
        dateMiseCirculation: found.datePremierMiseCirculation ? found.datePremierMiseCirculation.slice(0, 10) : '',
      }));

      // SOA/détenteur/type/catégorie/état général/carte grise/livrets/STD-CTD ne sont plus portés
      // par la fiche véhicule (voir rsi_vehicule_etat) — on va donc chercher le dernier état connu
      // de ce véhicule (dernière campagne où il a été recensé) pour ne pas forcer une ressaisie
      // complète chaque année. Best-effort : si l'appel échoue, le panneau reste utilisable, juste
      // vierge sur ces champs (comme un véhicule jamais recensé).
      setLoadingEtat(true);
      try {
        const etat = await recensementApi.dernierEtat(found.vehiculeId);
        if (etat && Object.keys(etat).length > 0) {
          setForm((prev) => ({
            ...prev,
            soaCode: etat.soaCode ?? prev.soaCode,
            stdCtd: etat.stdCtd ?? prev.stdCtd,
            detenteurEffectif: etat.detenteurEffectif ?? prev.detenteurEffectif,
            type: etat.type ?? prev.type,
            categorieUtilisation: etat.categorieUtilisation ?? prev.categorieUtilisation,
            etatGeneral: etat.etatGeneral ?? prev.etatGeneral,
          }));
          setCarteGriseDispo(etat.carteGriseDispo === '1');
          setLivretsDispo(etat.livretsDispo === '1');
        }
      } catch {
        // best-effort — voir commentaire ci-dessus
      } finally {
        setLoadingEtat(false);
      }
    } else {
      setMatchedVehiculeId(null);
    }
  }

  const canSave = Boolean(form.immatriculation.trim()) && Boolean(form.categorieUtilisation) && Boolean(form.etatGeneral);
  const saving = createVehicule.isPending || updateVehicule.isPending;

  async function handleSave() {
    if (!canSave) return;
    setError('');

    // Confort UX : retour immédiat si ce véhicule est déjà recensé cette année pour ce SOA — ne
    // s'applique qu'en cas de réutilisation d'un véhicule existant (un véhicule tout juste créé ne
    // peut par construction jamais être en doublon) et hors édition d'une ligne déjà dans ce
    // recensement (sinon la ligne se détecterait elle-même comme doublon). Garantie réelle : le
    // contrôle serveur dans RecensementService.creerRecensement() à la soumission finale.
    if (!editing && matchedVehiculeId && form.soaCode.trim()) {
      try {
        const { existe } = await recensementApi.verifierDoublon(matchedVehiculeId, form.soaCode.trim());
        if (existe) {
          setError(t('doublonError'));
          return;
        }
      } catch {
        // Best-effort : une panne de ce contrôle de confort ne doit pas bloquer la saisie, le
        // contrôle serveur à la soumission finale reste la garantie réelle.
      }
    }

    const vehiculePayload = {
      vehiculeImmatriculation: form.immatriculation.trim(),
      minCode: defaultMinCode,
      marqueCode: form.marqueCode || undefined,
      genreCode: form.genreCode || undefined,
      carrosserieCode: form.carrosserieCode || undefined,
      puissanceAdministrative: form.puissanceAdministrative ? Number(form.puissanceAdministrative) : undefined,
      numeroMoteur: form.numeroMoteur || undefined,
      sourceEnergie: form.sourceEnergie || undefined,
      datePremierMiseCirculation: form.dateMiseCirculation || undefined,
    };
    try {
      let vehiculeId: string;
      if (matchedVehiculeId) {
        await updateVehicule.mutateAsync({ id: matchedVehiculeId, patch: vehiculePayload });
        vehiculeId = matchedVehiculeId;
      } else {
        const created = await createVehicule.mutateAsync(vehiculePayload);
        vehiculeId = created.vehiculeId;
      }
      const ligne: RecensementLigneInput = {
        vehiculeId,
        detenteurEffectif: form.detenteurEffectif.trim(),
        carteGriseDispo,
        livretsDispo,
        etatGeneral: form.etatGeneral,
        categorieUtilisation: form.categorieUtilisation,
        type: form.type.trim(),
        soaCode: form.soaCode.trim(),
        stdCtd: form.stdCtd.trim(),
      };
      onSaved(ligne, vehiculeId, form.immatriculation.trim());
      resetForm();
    } catch {
      setError(t('saveError'));
    }
  }

  function handleCancel() {
    resetForm();
    onCancelEdit?.();
  }

  return (
    <div className="space-y-3 rounded-sm border border-border p-3">
      <p className="text-sm font-medium">{editing ? t('titleEdit') : t('title')}</p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="vehicule-quick-add-immat">{t('immatriculation')} *</Label>
          <Input
            id="vehicule-quick-add-immat"
            className="mt-1.5"
            value={form.immatriculation}
            onChange={(e) => set('immatriculation', e.target.value)}
            onBlur={handleImmatriculationBlur}
            data-testid="vehicule-quick-add-immat-input"
          />
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-marque">{t('marque')}</Label>
          <Select value={form.marqueCode} onValueChange={(v) => set('marqueCode', v ?? '')} items={marques.map((m) => ({ value: m.marqueCode, label: m.libelle }))}>
            <SelectTrigger id="vehicule-quick-add-marque" data-testid="vehicule-quick-add-marque-select" className="mt-1.5">
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {marques.map((m) => <SelectItem key={m.marqueCode} value={m.marqueCode}>{m.libelle}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-genre">{t('genre')}</Label>
          <Select value={form.genreCode} onValueChange={(v) => set('genreCode', v ?? '')} items={genres.map((g) => ({ value: g.genreCode, label: g.libelle }))}>
            <SelectTrigger id="vehicule-quick-add-genre" data-testid="vehicule-quick-add-genre-select" className="mt-1.5">
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {genres.map((g) => <SelectItem key={g.genreCode} value={g.genreCode}>{g.libelle}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-carrosserie">{t('carrosserie')}</Label>
          <Select value={form.carrosserieCode} onValueChange={(v) => set('carrosserieCode', v ?? '')} items={carrosseries.map((c) => ({ value: c.carrosserieCode, label: c.libelle }))}>
            <SelectTrigger id="vehicule-quick-add-carrosserie" data-testid="vehicule-quick-add-carrosserie-select" className="mt-1.5">
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {carrosseries.map((c) => <SelectItem key={c.carrosserieCode} value={c.carrosserieCode}>{c.libelle}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-puissance">{t('puissanceAdministrative')}</Label>
          <Input
            id="vehicule-quick-add-puissance"
            type="number"
            min={0}
            className="mt-1.5"
            value={form.puissanceAdministrative}
            onChange={(e) => set('puissanceAdministrative', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-moteur">{t('numeroMoteur')}</Label>
          <Input
            id="vehicule-quick-add-moteur"
            className="mt-1.5"
            value={form.numeroMoteur}
            onChange={(e) => set('numeroMoteur', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-energie">{t('sourceEnergie')}</Label>
          <Select value={form.sourceEnergie} onValueChange={(v) => set('sourceEnergie', v ?? '')} items={energies.map((e) => ({ value: e.energieCode, label: e.libelle }))}>
            <SelectTrigger id="vehicule-quick-add-energie" data-testid="vehicule-quick-add-energie-select" className="mt-1.5">
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {energies.map((e) => <SelectItem key={e.energieCode} value={e.energieCode}>{e.libelle}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-date">{t('dateMiseCirculation')}</Label>
          <Input
            id="vehicule-quick-add-date"
            type="date"
            className="mt-1.5"
            value={form.dateMiseCirculation}
            onChange={(e) => set('dateMiseCirculation', e.target.value)}
          />
        </div>

        <SoaSearchInput
          key={matchedVehiculeId ?? 'new'}
          id="vehicule-quick-add-soa"
          value={form.soaCode}
          onChange={(v) => set('soaCode', v)}
          label={t('soa')}
          initialLabel={form.soaCode}
          data-testid="vehicule-quick-add-soa"
        />

        <div>
          <Label htmlFor="vehicule-quick-add-stdctd">{t('stdCtd')}</Label>
          <Input
            id="vehicule-quick-add-stdctd"
            className="mt-1.5"
            value={form.stdCtd}
            onChange={(e) => set('stdCtd', e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-detenteur">{t('detenteurEffectif')}</Label>
          <Input
            id="vehicule-quick-add-detenteur"
            className="mt-1.5"
            value={form.detenteurEffectif}
            onChange={(e) => set('detenteurEffectif', e.target.value)}
            data-testid="recensement-detenteur-input"
          />
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-type">{tFields('type')}</Label>
          <Input
            id="vehicule-quick-add-type"
            className="mt-1.5"
            value={form.type}
            onChange={(e) => set('type', e.target.value)}
            data-testid="recensement-type-input"
          />
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-categorie">{tFields('categorieUtilisation')} *</Label>
          <Select value={form.categorieUtilisation} onValueChange={(v) => set('categorieUtilisation', v ?? '')} items={categoriesUtilisation.map((c) => ({ value: c.categorieUtilisationCode, label: c.libelle }))}>
            <SelectTrigger id="vehicule-quick-add-categorie" data-testid="recensement-categorie-select" className="mt-1.5">
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {categoriesUtilisation.map((c) => <SelectItem key={c.categorieUtilisationCode} value={c.categorieUtilisationCode}>{c.libelle}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="vehicule-quick-add-etat">{tFields('etatGeneral')} *</Label>
          <Select value={form.etatGeneral} onValueChange={(v) => set('etatGeneral', v ?? '')} items={etatsGeneral.map((e) => ({ value: e.etatGeneralCode, label: e.libelle }))}>
            <SelectTrigger id="vehicule-quick-add-etat" data-testid="recensement-etat-select" className="mt-1.5">
              <SelectValue placeholder={selectPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {etatsGeneral.map((e) => <SelectItem key={e.etatGeneralCode} value={e.etatGeneralCode}>{e.libelle}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={carteGriseDispo} onCheckedChange={(c) => setCarteGriseDispo(c === true)} />
          {tFields('carteGriseDispo')}
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={livretsDispo} onCheckedChange={(c) => setLivretsDispo(c === true)} />
          {tFields('livretsDispo')}
        </label>
      </div>

      {form.immatriculation.trim() && (
        <p className="text-xs text-muted-foreground">
          {loadingEtat ? t('chargementEtat') : matchedVehiculeId ? t('vehiculeExistant') : t('nouveauVehicule')}
        </p>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={handleCancel}>
          {tCommon('cancel')}
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={!canSave || saving}
          onClick={handleSave}
          data-testid="vehicule-quick-add-confirm"
        >
          {editing ? tCommon('saveChanges') : t('addButton')}
        </Button>
      </div>
    </div>
  );
}
