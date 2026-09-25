'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Mail } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';
import { PageHeading } from '@/components/common/PageHeading';
import { SectionLabel } from '@/components/common/SectionLabel';
import { RetourButton } from '@/components/buttons/AuthButton';

/**
 * Les comptes BSCVA sont provisionnés par un administrateur (workflow.wf_utilisateur),
 * pas d'auto-inscription : cette page renvoie vers le contact administrateur plutôt
 * qu'un flux de réinitialisation en libre-service.
 */
export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Mail className="mx-auto h-10 w-10 text-[#1e3461]" />
        <PageHeading text={t('title')} className="mt-4 text-xl font-bold text-[#111827]" />
        <SectionLabel text={t('description')} className="mt-2 text-sm text-[#8a8f98]" />
        <Link href={ROUTES.LOGIN} data-testid="forgot-password-back-link" className="mt-6 inline-block w-full">
          <RetourButton type="button" fullWidth data-testid="forgot-password-back-button">
            {t('backToLogin')}
          </RetourButton>
        </Link>
      </div>
    </main>
  );
}
