import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';
import { Plus, Trash2, Download, Edit, ChevronRight, Star, Printer, FileText, CheckCircle2, Save, Send } from 'lucide-react';

import { Button }  from './Button';
import { LoadingButton } from './LoadingButton';
import { IconButton }    from './IconButton';
import { SplitButton }   from './SplitButton';
import { ToggleButton }  from './ToggleButton';
import { LoginButton, RegisterButton, EnvoyerButton, RetourButton } from './AuthButton';
import { InfoButton } from './InfoButton';
import { ButtonValider } from './ButtonValider';
import { ButtonSupprimer } from './ButtonSupprimer';

/* ================================================================
   Button
   ================================================================ */
const actionMeta: Meta<typeof Button> = {
  title:     'Buttons/Button',
  component: Button,
  tags:      ['autodocs'],
  args:      { children: 'Action' },
};
export default actionMeta;
type ActionStory = StoryObj<typeof Button>;

export const Default: ActionStory = {};

export const AllVariants: ActionStory = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

export const AllSizes: ActionStory = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Petit</Button>
      <Button size="default">Moyen</Button>
      <Button size="lg">Grand</Button>
    </div>
  ),
};

export const WithIcons: ActionStory = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button leadingIcon={<Plus className="h-4 w-4" />}>Nouvel agent</Button>
      <Button trailingIcon={<ChevronRight className="h-4 w-4" />} variant="outline">
        Voir détails
      </Button>
      <Button leadingIcon={<Download className="h-4 w-4" />} variant="secondary">
        Exporter
      </Button>
    </div>
  ),
};

export const States: ActionStory = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Normal</Button>
      <Button disabled>Désactivé</Button>
    </div>
  ),
};

export const Destructive: ActionStory = {
  render: () => (
    <div className="flex gap-3">
      <Button variant="destructive" leadingIcon={<Trash2 className="h-4 w-4" />}>
        Supprimer l&apos;agent
      </Button>
      <Button variant="destructive" disabled leadingIcon={<Trash2 className="h-4 w-4" />}>
        Supprimer (désactivé)
      </Button>
    </div>
  ),
};

/* ================================================================
   LoadingButton
   ================================================================ */
export const LoadingStates: StoryObj<typeof LoadingButton> = {
  name: 'LoadingButton — États',
  render: () => {
    const [loading, setLoading] = useState(false);
    return (
      <div className="flex flex-wrap gap-3">
        <LoadingButton loading={false}>Normal</LoadingButton>
        <LoadingButton loading={true} loadingText="Enregistrement…">
          Enregistrer
        </LoadingButton>
        <LoadingButton
          loading={loading}
          loadingText="Traitement…"
          onClick={() => {
            setLoading(true);
            setTimeout(() => setLoading(false), 2000);
          }}
        >
          Cliquer pour charger
        </LoadingButton>
      </div>
    );
  },
};

/* ================================================================
   IconButton
   ================================================================ */
export const IconButtons: StoryObj<typeof IconButton> = {
  name: 'IconButton — Catalogue',
  render: () => (
    <div className="flex flex-wrap gap-3">
      <IconButton icon={<Edit className="h-4 w-4" />} aria-label="Modifier" variant="ghost" />
      <IconButton icon={<Trash2 className="h-4 w-4" />} aria-label="Supprimer" variant="ghost" />
      <IconButton icon={<Download className="h-4 w-4" />} aria-label="Télécharger" variant="outline" />
      <IconButton icon={<Plus className="h-4 w-4" />} aria-label="Ajouter" variant="default" />
      <IconButton icon={<Star className="h-4 w-4" />} aria-label="Favoris" variant="secondary" />
      <IconButton icon={<Trash2 className="h-4 w-4" />} aria-label="Supprimer (désactivé)" variant="ghost" disabled />
    </div>
  ),
};

export const IconButtonSizes: StoryObj<typeof IconButton> = {
  name: 'IconButton — Tailles',
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton icon={<Edit className="h-3 w-3" />} aria-label="Modifier (sm)" size="sm" variant="outline" />
      <IconButton icon={<Edit className="h-4 w-4" />} aria-label="Modifier (md)" size="default" variant="outline" />
      <IconButton icon={<Edit className="h-5 w-5" />} aria-label="Modifier (lg)" size="lg" variant="outline" />
    </div>
  ),
};

/* ================================================================
   SplitButton
   ================================================================ */
export const SplitButtonStory: StoryObj<typeof SplitButton> = {
  name: 'SplitButton',
  render: () => (
    <div className="flex gap-3">
      <SplitButton
        actions={[
          { label: 'Enregistrer et fermer', onClick: () => alert('Enregistrer et fermer') },
          { label: 'Enregistrer comme brouillon', onClick: () => alert('Brouillon') },
          { label: 'Dupliquer', onClick: () => alert('Dupliquer'), icon: <Plus className="h-4 w-4" /> },
        ]}
      >
        Enregistrer
      </SplitButton>
      <SplitButton
        variant="outline"
        actions={[
          { label: 'Exporter CSV', onClick: () => alert('CSV') },
          { label: 'Exporter PDF', onClick: () => alert('PDF') },
        ]}
      >
        <Download className="h-4 w-4 mr-2" aria-hidden="true" />Exporter
      </SplitButton>
    </div>
  ),
};

/* ================================================================
   ToggleButton
   ================================================================ */
export const ToggleButtonStory: StoryObj<typeof ToggleButton> = {
  name: 'ToggleButton',
  render: () => {
    const [pressed, setPressed] = useState(false);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-3">
          <ToggleButton pressed={pressed} onPressedChange={setPressed}>
            <Star className="h-4 w-4" />
            {pressed ? 'Favori ajouté' : 'Ajouter aux favoris'}
          </ToggleButton>
        </div>
        <div className="flex gap-3">
          <ToggleButton pressed={true} onPressedChange={() => {}}>
            Actif
          </ToggleButton>
          <ToggleButton pressed={false} onPressedChange={() => {}}>
            Inactif
          </ToggleButton>
          <ToggleButton pressed={false} onPressedChange={() => {}} disabled>
            Désactivé
          </ToggleButton>
        </div>
      </div>
    );
  },
};

/* ================================================================
   LoginButton
   ================================================================ */
export const LoginButtonDefault: StoryObj<typeof LoginButton> = {
  name: 'LoginButton — par défaut',
  render: () => (
    <div className="w-64">
      <LoginButton>Se connecter</LoginButton>
    </div>
  ),
};

/* ================================================================
   RegisterButton
   ================================================================ */
export const RegisterButtonDefault: StoryObj<typeof RegisterButton> = {
  name: "RegisterButton — par défaut",
  render: () => (
    <div className="w-48">
      <RegisterButton>S&apos;inscrire maintenant !</RegisterButton>
    </div>
  ),
};

/* ================================================================
   EnvoyerButton
   ================================================================ */
   export const EnvoyerButtonDefault: StoryObj<typeof EnvoyerButton> = {
    name: "EnvoyerButton — par défaut",
    render: () => (
      <div className="w-48">
        <EnvoyerButton>Envoyer</EnvoyerButton>
      </div>
    ),
  };

/* ================================================================
   RetourButton
   ================================================================ */
export const RetourButtonDefault: StoryObj<typeof RetourButton> = {
  name: "RetourButton — par défaut",
  render: () => (
    <div className="w-48">
      <RetourButton>Retour</RetourButton>
    </div>
  ),
};

/* ================================================================
   InfoButton
   ================================================================ */
export const InfoButtonDefault: StoryObj<typeof InfoButton> = {
  name: 'InfoButton — icône configurable',
  render: () => (
    <div className="flex flex-col gap-3 w-56">
      <InfoButton icon={<Printer className="h-4 w-4" />}>Imprimer</InfoButton>
      <InfoButton icon={<FileText className="h-4 w-4" />}>Générer le rapport</InfoButton>
      <InfoButton icon={<Download className="h-4 w-4" />}>Télécharger</InfoButton>
      <InfoButton>Sans icône</InfoButton>
    </div>
  ),
};

/* ================================================================
   Auth buttons — Pied de page (contexte réel)
   ================================================================ */
export const AuthFooterButtons: StoryObj<typeof RetourButton> = {
  name: 'Auth — Pied de page (Retour & Imprimer)',
  render: () => (
    <div className="flex items-center justify-between gap-4 p-6 bg-[#f1f4f9] w-[480px]">
      <RetourButton>Retour</RetourButton>
      <InfoButton icon={<Printer className="h-4 w-4" />}>Imprimer</InfoButton>
    </div>
  ),
};

/* ================================================================
   Auth buttons — panneau droit login (contexte réel)
   ================================================================ */
export const AuthButtonsPanel: StoryObj<typeof LoginButton> = {
  name: 'Auth — Panneau login complet',
  render: () => (
    <div className="flex gap-0 rounded-md overflow-hidden shadow-xl w-[480px]">
      {/* Panneau gauche — formulaire */}
      <div className="flex-1 bg-white px-8 py-6 space-y-3">
        <h1 className="text-lg font-bold text-gray-800">S&apos;identifier</h1>
        <p className="text-xs text-gray-500">Connectez-vous à votre compte</p>
        <LoginButton>Se connecter</LoginButton>
      </div>
      {/* Panneau droit — CTA inscription */}
      <div className="w-48 shrink-0 flex flex-col items-center justify-center gap-4 px-6 py-8 bg-[#1e3461]">
        <h2 className="text-sm font-bold text-white text-center leading-snug">
          Créer un compte
        </h2>
        <RegisterButton>S&apos;inscrire maintenant !</RegisterButton>
      </div>
    </div>
  ),
};

/* ================================================================
   ButtonValider
   ================================================================ */
export const ButtonValiderDefault: StoryObj<typeof ButtonValider> = {
  name: 'ButtonValider — États',
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ButtonValider icon={<CheckCircle2 className="h-4 w-4" />}>
        Valider
      </ButtonValider>
      <ButtonValider icon={<Save className="h-4 w-4" />}>
        Enregistrer
      </ButtonValider>
      <ButtonValider icon={<Send className="h-4 w-4" />}>
        Enclencher le Processus
      </ButtonValider>
      <ButtonValider icon={<CheckCircle2 className="h-4 w-4" />} disabled>
        Désactivé
      </ButtonValider>
    </div>
  ),
};

/* ================================================================
   ButtonSupprimer
   ================================================================ */
export const ButtonSupprimerDefault: StoryObj<typeof ButtonSupprimer> = {
  name: 'ButtonSupprimer — États',
  render: () => (
    <div className="flex flex-wrap gap-4">
      <ButtonSupprimer>
        Supprimer
      </ButtonSupprimer>
      <ButtonSupprimer icon={<Trash2 className="h-4 w-4" />}>
        Supprimer l&apos;agent
      </ButtonSupprimer>
      <ButtonSupprimer icon={<Trash2 className="h-4 w-4" />} disabled>
        Désactivé
      </ButtonSupprimer>
    </div>
  ),
};
