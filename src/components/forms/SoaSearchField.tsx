'use client';

import { useController, useFormContext } from 'react-hook-form';
import { SoaSearchInput } from '@/components/forms/SoaSearchInput';

export interface SoaSearchFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  emptyMessage?: string;
  /** Texte affiché tant que l'utilisateur n'a pas encore tapé/sélectionné — permet à un appelant
   *  de préremplir l'affichage (ex. depuis vehicule.soaDepositaire) sans déclencher de recherche. */
  initialLabel?: string;
  /** Valeur stockée dans le champ RHF à la sélection : le `soaCode` (défaut, la plupart des
   *  colonnes réelles attendent un code) ou le `libelle` (ex. `soa_libelle`, colonne destinée à un
   *  texte lisible, pas un code — voir attestation de caractéristiques). */
  valueMode?: 'code' | 'label';
  'data-testid'?: string;
}

/**
 * Wrapper React Hook Form autour de `SoaSearchInput` (le composant contrôlé qui porte
 * effectivement la recherche/le rendu — voir ce fichier pour le patron AUGURE d'origine reproduit
 * ici). Séparation faite pour que `VehiculeQuickAddPanel` (champs en `useState` local, hors de tout
 * `FormProvider`) puisse réutiliser la même recherche SOA sans dépendre de React Hook Form.
 */
export function SoaSearchField({
  name, label, placeholder, required = false, emptyMessage, initialLabel, valueMode = 'code',
  'data-testid': dataTestId,
}: SoaSearchFieldProps) {
  const { control } = useFormContext();
  const { field, fieldState: { error } } = useController({ name, control });

  return (
    <SoaSearchInput
      id={`soa-${name}`}
      value={field.value ?? ''}
      onChange={field.onChange}
      label={label}
      placeholder={placeholder}
      required={required}
      emptyMessage={emptyMessage}
      initialLabel={initialLabel}
      valueMode={valueMode}
      error={error?.message}
      data-testid={dataTestId}
    />
  );
}
