'use client';

import { forwardRef, type ReactNode } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Couleurs auth (spécifiques aux pages login / register)             */
/* ------------------------------------------------------------------ */

const AUTH_NAVY = '#1e3461';
const AUTH_ORANGE = '#000000ff';
const AUTH_BLUE = '#2da9d7';

/* ------------------------------------------------------------------ */
/* Base interne                                                        */
/* ------------------------------------------------------------------ */

interface BaseAuthButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const BaseAuthButton = forwardRef<HTMLButtonElement, BaseAuthButtonProps & { bg: string; hoverBg: string }>(
  ({ children, loading, fullWidth = true, bg, hoverBg, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(
        'relative flex items-center justify-center gap-2 rounded',
        'px-5 py-2.5 text-sm font-semibold text-white',
        'transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50',
        'disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer',
        fullWidth && 'w-full',
        className,
      )}
      style={{ backgroundColor: bg }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = hoverBg;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = bg;
      }}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </button>
  ),
);
BaseAuthButton.displayName = 'BaseAuthButton';

/* ------------------------------------------------------------------ */
/* LoginButton — bouton de soumission du formulaire de connexion      */
/* ------------------------------------------------------------------ */

export type LoginButtonProps = Omit<BaseAuthButtonProps, 'bg' | 'hoverBg'>;

export const LoginButton = forwardRef<HTMLButtonElement, LoginButtonProps>(
  (props, ref) => (
    <BaseAuthButton
      ref={ref}
      bg={AUTH_NAVY}
      hoverBg="#162849"
      {...props}
    />
  ),
);
LoginButton.displayName = 'LoginButton';

/* ------------------------------------------------------------------ */
/* RegisterButton — bouton CTA "S'inscrire" (panneau droit login)     */
/* ------------------------------------------------------------------ */

export type RegisterButtonProps = Omit<BaseAuthButtonProps, 'bg' | 'hoverBg'>;

export const RegisterButton = forwardRef<HTMLButtonElement, RegisterButtonProps>(
  (props, ref) => (
    <BaseAuthButton
      ref={ref}
      bg={AUTH_ORANGE}
      hoverBg="#000000ff"
      {...props}
    />
  ),
);
RegisterButton.displayName = 'RegisterButton';

/* ------------------------------------------------------------------ */
/* EnvoyerButton — bouton de soumission du formulaire d'inscription   */
/* ------------------------------------------------------------------ */

const AUTH_TEAL = '#17a589';

export type EnvoyerButtonProps = Omit<BaseAuthButtonProps, 'bg' | 'hoverBg'>;

export const EnvoyerButton = forwardRef<HTMLButtonElement, EnvoyerButtonProps>(
  (props, ref) => (
    <BaseAuthButton
      ref={ref}
      bg={AUTH_TEAL}
      hoverBg="#148f77"
      {...props}
    />
  ),
);
EnvoyerButton.displayName = 'EnvoyerButton';

/* ------------------------------------------------------------------ */
/* RetourButton — bouton "Retour" avec icône                          */
/* ------------------------------------------------------------------ */

export type RetourButtonProps = Omit<BaseAuthButtonProps, 'bg' | 'hoverBg'>;

export const RetourButton = forwardRef<HTMLButtonElement, RetourButtonProps>(
  ({ children, className, ...props }, ref) => (
    <BaseAuthButton
      ref={ref}
      bg={AUTH_NAVY}
      hoverBg="#162849"
      className={cn('gap-2', className)}
      {...props}
    >
      <RotateCcw className="h-4 w-4" />
      {children}
    </BaseAuthButton>
  ),
);
RetourButton.displayName = 'RetourButton';

/* ------------------------------------------------------------------ */
/* Constantes exportées pour usage CSS direct                         */
/* ------------------------------------------------------------------ */

export { AUTH_NAVY, AUTH_ORANGE, AUTH_TEAL, AUTH_BLUE };
