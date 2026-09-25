'use client';

import { Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '@/providers/AuthProvider';
import { User, Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { createLoginSchema, type LoginFormData } from '@/lib/validations/auth.schema';
import { showToast } from '@/components/feedback/Toast';
import { AuthFormField } from '@/components/forms/AuthFormField';
import { LoginButton } from '@/components/buttons/AuthButton';
import { ROUTES } from '@/lib/constants/routes';
import { PageTitle } from '@/components/common/PageTitle';
import { PageHeading } from '@/components/common/PageHeading';
import { SectionLabel } from '@/components/common/SectionLabel';

function safeCallbackUrl(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//')) return ROUTES.DASHBOARD;
  return raw;
}

/* ------------------------------------------------------------------ */
/* Inner form — uses useSearchParams, doit être dans Suspense          */
/* ------------------------------------------------------------------ */

function LoginForm() {
  const t = useTranslations('auth.login');
  const tCommon = useTranslations('common');
  const tValidation = useTranslations('validation');

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = safeCallbackUrl(searchParams.get('callbackUrl'));

  const loginSchema = useMemo(() => createLoginSchema(tValidation), [tValidation]);
  const auth = useAuthContext();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: '', password: '' },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;

  async function onSubmit(data: LoginFormData) {
    const result = await auth.login(data.login, data.password);

    if (!result.ok) {
      if (result.code === 'ACCOUNT_DISABLED') {
        showToast.warning(t('errorLoginDisabled'));
      } else {
        showToast.error(t('errorCredentials'));
      }
      return;
    }

    router.push(callbackUrl);
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[7fr_3fr]">
      <section className="relative min-h-[38vh] overflow-hidden bg-slate-100 sm:min-h-[42vh] lg:min-h-screen">
        <Image
          src="/images/backgrounds/login.webp"
          alt=""
          fill
          priority
          unoptimized
          quality={100}
          sizes="(min-width: 1024px) 70vw, 100vw"
          className="object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/50 via-black/18 to-transparent" />
      </section>

      <section className="flex min-h-[62vh] items-center justify-center bg-white px-5 py-8 sm:px-8 md:px-10 lg:min-h-screen lg:px-9 lg:py-8 xl:px-12">
        <div className="w-full max-w-[400px]">
          <div className="flex flex-col items-center text-center">
            <div className="mt-2 flex flex-wrap items-baseline justify-center gap-x-2">
              <PageTitle
                text={t('appSubtitle')}
                className="mt-0 text-xl font-bold leading-tight sm:text-2xl lg:text-xl xl:text-2xl"
              />
            </div>

            <PageHeading
              text={t('title')}
              color="#111827"
              className="mt-7 text-2xl font-bold leading-tight text-[#111827] xl:text-[1.7rem]"
            />
            <SectionLabel
              text={t('description')}
              color="#8a8f98"
              className="mt-2 max-w-sm text-xs leading-relaxed text-[#8a8f98] xl:text-sm"
            />
          </div>

          <FormProvider {...form}>
            <form
              id="login-form"
              data-testid="login-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="mt-7 space-y-4"
            >
              <div className="space-y-2">
                <label
                  htmlFor="auth-field-login"
                  className="block text-sm font-medium text-[#6f7480]"
                >
                  {t('email')}
                </label>
                <AuthFormField
                  name="login"
                  type="text"
                  placeholder={t('emailPlaceholder')}
                  ariaLabel={t('emailAriaLabel')}
                  icon={<User className="h-4 w-4" />}
                  data-testid="login-email-input"
                  className="gap-1.5"
                  controlClassName="rounded-sm border-gray-300 bg-white px-3 py-2 shadow-none focus-within:border-[#1e3461] focus-within:ring-0"
                  inputClassName="auth-input-no-autofill text-sm font-medium placeholder:text-[#111827]"
                  iconClassName="text-[#8a8f98]"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="auth-field-password"
                  className="block text-sm font-medium text-[#6f7480]"
                >
                  {t('password')}
                </label>
                <AuthFormField
                  name="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  ariaLabel={t('passwordAriaLabel')}
                  icon={<Lock className="h-4 w-4" />}
                  data-testid="login-password-input"
                  className="gap-1.5"
                  controlClassName="rounded-sm border-gray-300 bg-white px-3 py-2 shadow-none focus-within:border-[#1e3461] focus-within:ring-0"
                  inputClassName="auth-input-no-autofill text-sm font-medium placeholder:text-[#111827]"
                  iconClassName="text-[#8a8f98]"
                />
              </div>

              <div className="flex justify-end">
                <Link
                  href={ROUTES.FORGOT_PASSWORD}
                  data-testid="login-forgot-password-link"
                  className="shrink-0 text-xs font-semibold text-sky-600 underline-offset-4 transition-colors hover:text-sky-700 hover:underline"
                >
                  {t('forgotPassword')}
                </Link>
              </div>

              <LoginButton
                type="submit"
                loading={isSubmitting}
                fullWidth
                data-testid="login-submit-button"
                className="rounded-sm bg-[#1e3461] py-2.5 text-sm font-semibold tracking-normal shadow-[0_10px_24px_rgba(30,52,97,0.22)]"
              >
                {isSubmitting ? t('submitting') : t('submit')}
              </LoginButton>

              <p className="pt-1 text-center text-[11px] italic text-red-500">
                {tCommon('requiredFields')}
              </p>
            </form>
          </FormProvider>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
