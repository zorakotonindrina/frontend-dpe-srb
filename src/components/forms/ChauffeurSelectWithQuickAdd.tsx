'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormSelect } from '@/components/forms/FormSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useChauffeurs, useCreateChauffeur } from '@/hooks/useChauffeurs';
import { useMinisteres } from '@/hooks/useReferentiels';

export interface ChauffeurSelectWithQuickAddProps {
  name: string;
  label: string;
  required?: boolean;
}

/**
 * Sélection d'un chauffeur réel (`traitement_siigpe.tsi_chauffeur`, via `useChauffeurs()`) + bouton
 * « + » pour en créer un nouveau sans quitter le formulaire. La colonne réelle qui reçoit ce champ
 * (ex. `ts_constatation_technique.nom_chauffeur`) est un simple `varchar(250)`, pas une clé
 * étrangère — la valeur stockée par ce composant est donc directement le **nom** du chauffeur
 * choisi, pas un id (`FormSelectWithQuickAdd` générique non réutilisé ici : un chauffeur a 6 champs,
 * pas juste code+libellé).
 *
 * `minCode` du panneau de création utilise un vrai `<select>` alimenté par `useMinisteres()` (codes
 * réels à 2 caractères) plutôt qu'un texte libre — `ts_chauffeur.min_code` est, comme
 * `workflow.wf_dossier.ministere_code`, une colonne `varchar(2)` : un texte libre y reproduirait le
 * même bug "valeur trop longue" déjà corrigé ailleurs (voir plan).
 */
export function ChauffeurSelectWithQuickAdd({ name, label, required }: ChauffeurSelectWithQuickAddProps) {
  const tCommon = useTranslations('common');
  const { setValue } = useFormContext();
  const { data: chauffeurs = [] } = useChauffeurs();
  const { data: ministeres = [] } = useMinisteres();
  const createChauffeur = useCreateChauffeur();

  const [adding, setAdding] = useState(false);
  const [nom, setNom] = useState('');
  const [matricule, setMatricule] = useState('');
  const [cin, setCin] = useState('');
  const [permis, setPermis] = useState('');
  const [minCode, setMinCode] = useState('');
  const [soaCode, setSoaCode] = useState('');

  function closePanel() {
    setAdding(false);
    setNom(''); setMatricule(''); setCin(''); setPermis(''); setMinCode(''); setSoaCode('');
  }

  async function handleCreate() {
    if (!nom.trim()) return;
    const created = await createChauffeur.mutateAsync({
      nom: nom.trim(), matricule: matricule.trim(), cin: cin.trim(),
      permis: permis.trim(), minCode, soaCode: soaCode.trim(),
    });
    setValue(name, created.nom, { shouldDirty: true, shouldValidate: true });
    closePanel();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <FormSelect
            name={name}
            label={label}
            required={required}
            options={chauffeurs.map((c) => ({ value: c.nom, label: c.nom }))}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Ajouter un chauffeur"
          data-testid={`${name}-quick-add-button`}
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {adding && (
        <div className="grid grid-cols-1 gap-2 rounded-sm border border-dashed border-border p-3 sm:grid-cols-3">
          <div>
            <Label htmlFor={`${name}-quick-add-nom`}>Nom *</Label>
            <Input id={`${name}-quick-add-nom`} className="mt-1.5" value={nom} onChange={(e) => setNom(e.target.value)} data-testid={`${name}-quick-add-nom-input`} />
          </div>
          <div>
            <Label htmlFor={`${name}-quick-add-matricule`}>Matricule</Label>
            <Input id={`${name}-quick-add-matricule`} className="mt-1.5" value={matricule} onChange={(e) => setMatricule(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={`${name}-quick-add-cin`}>CIN</Label>
            <Input id={`${name}-quick-add-cin`} className="mt-1.5" value={cin} onChange={(e) => setCin(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={`${name}-quick-add-permis`}>Permis</Label>
            <Input id={`${name}-quick-add-permis`} className="mt-1.5" value={permis} onChange={(e) => setPermis(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={`${name}-quick-add-mincode`}>Ministère</Label>
            <select
              id={`${name}-quick-add-mincode`}
              className="mt-1.5 h-9 w-full rounded-sm border border-gray-300 bg-white px-2 text-sm"
              value={minCode}
              onChange={(e) => setMinCode(e.target.value)}
              data-testid={`${name}-quick-add-mincode-select`}
            >
              <option value="">Sélectionner…</option>
              {ministeres.map((m) => (
                <option key={m.minCode} value={m.minCode}>{m.libelle}</option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor={`${name}-quick-add-soacode`}>SOA</Label>
            <Input id={`${name}-quick-add-soacode`} className="mt-1.5" value={soaCode} onChange={(e) => setSoaCode(e.target.value)} />
          </div>
          <div className="flex gap-2 sm:col-span-3 sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={closePanel}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!nom.trim() || createChauffeur.isPending}
              onClick={handleCreate}
              data-testid={`${name}-quick-add-confirm`}
            >
              {tCommon('save')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
