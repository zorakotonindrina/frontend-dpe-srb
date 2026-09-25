import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { FileText, Printer, ShieldAlert, Trash2 } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';
import { Button } from '@/components/buttons/Button';
import { Input } from '@/components/ui/input';

const meta: Meta<typeof ConfirmDialog> = {
  title:     'Common/ConfirmDialog',
  component: ConfirmDialog,
  tags:      ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes:  {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl', 'full'],
    },
  },
};
export default meta;
type Story = StoryObj<typeof ConfirmDialog>;

function DialogWrapper(input: Partial<React.ComponentProps<typeof ConfirmDialog>>) {
  const {
    children,
    footer,
    destructive = false,
    title = 'Confirmer l\'action',
    description = 'Cette action est irréversible. Souhaitez-vous continuer ?',
    confirmLabel = 'Confirmer',
    ...props
  } = input;
  const [open, setOpen] = useState(false);
  const hasCustomFooter = Object.prototype.hasOwnProperty.call(input, 'footer');

  return (
    <>
      <Button
        variant={destructive ? 'destructive' : 'default'}
        leadingIcon={destructive ? <Trash2 /> : <FileText />}
        onClick={() => setOpen(true)}
      >
        {destructive ? 'Supprimer l\'agent' : 'Ouvrir la dialog'}
      </Button>
      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={title}
        description={description}
        confirmLabel={confirmLabel}
        destructive={destructive}
        footer={hasCustomFooter ? footer : undefined}
        onConfirm={() => { alert('Confirmé !'); setOpen(false); }}
        {...props}
      >
        {children}
      </ConfirmDialog>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <DialogWrapper
      title="Confirmer la modification"
      description="Souhaitez-vous enregistrer les modifications apportées à cet agent ?"
    />
  ),
};

export const Success: Story = {
  render: () => (
    <DialogWrapper
      variant="success"
      size="lg"
      title="Impression de demande de réinitialisation de mot de passe"
      description={undefined}
      footer={(
        <>
          <Button variant="outline">Annuler</Button>
          <Button leadingIcon={<Printer />}>Imprimer</Button>
        </>
      )}
    >
      <Input placeholder="Matricule/CIN" />
    </DialogWrapper>
  ),
};

export const Warning: Story = {
  name: 'Avertissement',
  render: () => (
    <DialogWrapper
      variant="warning"
      title="Attention"
      description="Cette opération nécessite une vérification préalable."
      footer={<Button variant="outline">Fermer</Button>}
    />
  ),
};

export const Destructive: Story = {
  name: 'Destructive (suppression)',
  render: () => (
    <DialogWrapper
      destructive
      title="Supprimer l'agent"
      description="Cette action supprimera définitivement l'agent Marie Dupont et toutes ses données associées."
      confirmLabel="Supprimer définitivement"
    />
  ),
};

export const StaticBackdrop: Story = {
  render: () => (
    <DialogWrapper
      staticBackdrop
      title="Fond statique"
      description="Le clic extérieur ne ferme pas ce pop-up."
    />
  ),
};

export const PdfPreview: Story = {
  render: () => (
    <DialogWrapper
      size="full"
      title="APERÇU DU DOCUMENT"
      description={undefined}
      footer={null}
      contentClassName="p-0"
    >
      <iframe
        title="Aperçu PDF"
        className="h-[70vh] w-full border-0"
        src="about:blank"
      />
    </DialogWrapper>
  ),
};

export const CustomDestructiveFooter: Story = {
  render: () => (
    <DialogWrapper
      variant="destructive"
      title="Action impossible"
      description="Le dossier ne peut pas être imprimé dans son état actuel."
      footer={<Button variant="destructive" leadingIcon={<ShieldAlert />}>Compris</Button>}
    />
  ),
};
