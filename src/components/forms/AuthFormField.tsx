'use client';

import { forwardRef, useState, type ReactNode } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Eye, EyeOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface AuthFormFieldProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Type de l'input */
  type?: 'text' | 'email' | 'password';
  /** Texte de placeholder */
  placeholder?: string;
  /** Label accessible (aria-label) — remplace le label visuel */
  ariaLabel: string;
  /** Icône à gauche (ex: <User />) */
  icon: ReactNode;
  /**
   * Variante visuelle :
   * - 'auth'     : fond bleu-gris (login)
   * - 'register' : fond blanc + bordure fine (register)
   */
  variant?: 'auth' | 'register';
  /** Affiche un bouton × de vidage quand le champ est non vide */
  clearable?: boolean;
  /** Callback custom appelé à chaque changement de valeur */
  onChange?: (value: string) => void;
  /** Callback custom appelé au blur du champ */
  onBlur?: (value: string) => void;
  /** Classe CSS additionnelle */
  className?: string;
  /** Classe CSS appliquee au conteneur visuel de l'input */
  controlClassName?: string;
  /** Classe CSS appliquee a l'input natif */
  inputClassName?: string;
  /** Classe CSS appliquee au conteneur de l'icone gauche */
  iconClassName?: string;
  /** Identifiant de test */
  'data-testid'?: string;
}

/* ------------------------------------------------------------------ */
/* AuthFormField — champ avec icône, sans label visible               */
/* ------------------------------------------------------------------ */

export const AuthFormField = forwardRef<HTMLInputElement, AuthFormFieldProps>(
  ({ name, type = 'text', placeholder, ariaLabel, icon, variant = 'auth', clearable = false, onChange, onBlur, className, controlClassName, inputClassName, iconClassName, 'data-testid': dataTestId }, _ref) => {
    const {
      register,
      setValue,
      formState: { errors },
    } = useFormContext();

    const fieldValue = useWatch({ name });
    const { onChange: rhfOnChange, onBlur: rhfOnBlur, ...registerRest } = register(name);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType  = isPassword && showPassword ? 'text' : type;

    const error        = errors[name];
    const errorMessage = error?.message as string | undefined;

    const isRegister = variant === 'register';

    return (
      <div className={cn('flex flex-col gap-1', className)}>
        <div
          className={cn(
            'flex items-center gap-2.5 px-3 py-2',
            /* ── variante auth (login) ── */
            !isRegister && [
              'rounded bg-white border border-[#cbd5e1] text-[#334155]',
              'shadow-sm transition-all',
              'focus-within:border-[#1e3461] focus-within:ring-2 focus-within:ring-[#1e3461]/15',
              errorMessage && 'border-red-400 bg-red-50 focus-within:border-red-500 focus-within:ring-red-200',
            ],
            /* ── variante register ── */
            isRegister && [
              'rounded-sm bg-white border border-gray-300 transition-all',
              'focus-within:border-[#e05726]',
              errorMessage && 'border-red-400 bg-red-50',
            ],
            controlClassName,
          )}
        >
          {/* Icône gauche */}
          <span className={cn('shrink-0 text-[#64748b]', iconClassName)} aria-hidden="true">
            {icon}
          </span>

          {/* Input */}
          <input
            id={`auth-field-${name}`}
            type={inputType}
            placeholder={placeholder}
            aria-label={ariaLabel}
            aria-invalid={!!error}
            aria-describedby={errorMessage ? `auth-field-${name}-error` : undefined}
            data-testid={dataTestId}
            className={cn(
              'flex-1 bg-transparent text-sm text-[#1e293b] placeholder:text-[#64748b]',
              'outline-none min-w-0',
              inputClassName,
            )}
            onChange={(e) => { rhfOnChange(e); onChange?.(e.target.value); }}
            onBlur={(e) => { rhfOnBlur(e); onBlur?.(e.target.value); }}
            {...registerRest}
          />

          {/* Bouton × de vidage (clearable, non-password) */}
          {clearable && !isPassword && fieldValue && (
            <button
              type="button"
              onClick={() => setValue(name, '', { shouldValidate: true })}
              className="shrink-0 text-[#64748b] hover:text-red-400 transition-colors"
              aria-label="Vider le champ"
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Toggle visibilité (password uniquement) */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="shrink-0 text-[#64748b] hover:text-[#1e3461] transition-colors"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              tabIndex={-1}
            >
              {showPassword
                ? <EyeOff className="h-4 w-4" />
                : <Eye     className="h-4 w-4" />}
            </button>
          )}
        </div>

        {/* Message d'erreur */}
        {errorMessage && (
          <p
            id={`auth-field-${name}-error`}
            className="text-xs text-red-500"
            role="alert"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);
AuthFormField.displayName = 'AuthFormField';
