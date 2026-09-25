import { z } from 'zod';

type T = (key: string) => string;

export function createLoginSchema(t: T) {
  return z.object({
    login:    z.string().min(1, t('login.required')),
    password: z.string().min(1, t('password.required')),
  });
}

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>;
