'use client';

import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Plus } from 'lucide-react';
import { FormSelect, type SelectOption } from '@/components/forms/FormSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslations } from 'next-intl';

export interface FormSelectWithQuickAddProps {
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  disabled?: boolean;
  /** Crée une nouvelle valeur de référentiel et la retourne (code + libellé). */
  onCreate: (input: { code: string; libelle: string }) => Promise<{ code: string; libelle: string }>;
  createLabel: string;
  codeLabel: string;
  libelleLabel: string;
}

/**
 * `FormSelect` complété d'un bouton « + » ouvrant un petit panneau inline permettant de créer une
 * nouvelle valeur de référentiel (code + libellé) sans quitter le formulaire ni passer par un écran
 * d'administration séparé — retour utilisateur SRBA (« faciliter l'ajout de nouvel élément »).
 */
export function FormSelectWithQuickAdd({
  name, label, options, required, disabled, onCreate, createLabel, codeLabel, libelleLabel,
}: FormSelectWithQuickAddProps) {
  const tCommon = useTranslations('common');
  const { setValue } = useFormContext();
  const [adding, setAdding] = useState(false);
  const [code, setCode] = useState('');
  const [libelle, setLibelle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function closePanel() {
    setAdding(false);
    setCode('');
    setLibelle('');
  }

  async function handleCreate() {
    if (!code.trim() || !libelle.trim()) return;
    setSubmitting(true);
    try {
      const created = await onCreate({ code: code.trim(), libelle: libelle.trim() });
      setValue(name, created.code, { shouldDirty: true, shouldValidate: true });
      closePanel();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <FormSelect name={name} label={label} options={options} required={required} disabled={disabled} />
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={createLabel}
          data-testid={`${name}-quick-add-button`}
          onClick={() => setAdding((v) => !v)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {adding && (
        <div className="grid grid-cols-1 gap-2 rounded-sm border border-dashed border-border p-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`${name}-quick-add-code`}>{codeLabel}</Label>
            <Input
              id={`${name}-quick-add-code`}
              className="mt-1.5"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              data-testid={`${name}-quick-add-code-input`}
            />
          </div>
          <div>
            <Label htmlFor={`${name}-quick-add-libelle`}>{libelleLabel}</Label>
            <Input
              id={`${name}-quick-add-libelle`}
              className="mt-1.5"
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              data-testid={`${name}-quick-add-libelle-input`}
            />
          </div>
          <div className="flex gap-2 sm:col-span-2 sm:justify-end">
            <Button type="button" variant="ghost" size="sm" onClick={closePanel}>
              {tCommon('cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={!code.trim() || !libelle.trim() || submitting}
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
