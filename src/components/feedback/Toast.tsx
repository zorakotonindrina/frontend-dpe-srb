import { toast } from 'sonner';

export { Toaster } from 'sonner';

export const showToast = {
  success: (message: string, title?: string) =>
    toast.success(title ?? message, { description: title ? message : undefined }),

  error: (message: string, title?: string) =>
    toast.error(title ?? message, { description: title ? message : undefined }),

  warning: (message: string, title?: string) =>
    toast.warning(title ?? message, { description: title ? message : undefined, duration: 10000 }),

  info: (message: string, title?: string) =>
    toast.info(title ?? message, { description: title ? message : undefined }),
};
