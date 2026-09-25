import { toast } from 'sonner';

export function notifyDossierCreated(message: string, referenceActe: string) {
  toast.success(message, {
    description: `Référence du dossier : ${referenceActe}`,
    action: {
      label: 'Copier',
      onClick: () => {
        navigator.clipboard
          .writeText(referenceActe)
          .then(() => toast.success('Référence copiée dans le presse-papiers'))
          .catch(() => toast.error('Impossible de copier la référence'));
      },
    },
  });
}
