'use client';

import { useState } from 'react';
import { Check, RotateCcw, Send, Ban, FileCheck, Archive } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/common/Card';
import { ButtonValider } from '@/components/buttons/ButtonValider';
import { ButtonDanger } from '@/components/buttons/ButtonDanger';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useValiderWorkflow, useRessaisirDossier } from '@/hooks/useWorkflow';
import { deriveWorkflowState, getActionableEtape } from '@/lib/constants/workflow-etapes';
import { ETAPE_ROLE_MAP } from '@/lib/constants/etape-roles';
import { useAuth } from '@/hooks/useAuth';
import { ROLE_LABELS } from '@/types/auth.types';
import type { Dossier } from '@/lib/api/dossiers';

/** SRB n'a qu'une seule entité/sous-entité (voir seed Script.sql, `entite_code = 'BSCVA'` partout). */
const ENTITE_CODE = 'BSCVA';

export interface EtapeActionPanelProps {
  dossier: Dossier;
}

type MotifDialogKind = 'retourner' | 'refuser' | null;

/**
 * Panneau d'action du dossier — pilote directement le moteur de workflow réel :
 * `validerWorkflow` pour avancer (clôt la tâche courante, ouvre la suivante), `ressaisirDossier`
 * pour "retourner pour complément" ET "refuser" (mécanisme unique, aligné sur le modèle AUGURE).
 */
export function EtapeActionPanel({ dossier }: EtapeActionPanelProps) {
  const t = useTranslations('dossiers.actions');
  const { hasPermission, role, user } = useAuth();
  const canTraiter = hasPermission('workflow:traiter');
  const matricule = user?.login ?? '';

  const validerWorkflow = useValiderWorkflow();
  const ressaisirDossier = useRessaisirDossier();

  const [motifDialog, setMotifDialog] = useState<MotifDialogKind>(null);
  const [motif, setMotif] = useState('');
  /** Numéro + date de sortie — saisis à la main après signature papier du livrable, capturés
   *  uniquement à la clôture de l'étape ARCHIVAGE (workflow.wf_dossier.reference_sortie/date_sortie,
   *  audité automatiquement via AuditAspect côté backend). */
  const [referenceSortie, setReferenceSortie] = useState('');
  const [dateSortie, setDateSortie] = useState('');

  const { etapeStates } = deriveWorkflowState(dossier.etapeCode, dossier.motifRejet);
  const actionable = getActionableEtape(etapeStates);
  const allowedRoles = actionable ? ETAPE_ROLE_MAP[actionable] : [];
  const canActOnEtape = role === 'ADMIN' || (role ? allowedRoles.includes(role) : false);
  const isPending = validerWorkflow.isPending || ressaisirDossier.isPending;
  const isArchivage = actionable === 'ARCHIVAGE';
  const archivageIncomplet = isArchivage && (!referenceSortie.trim() || !dateSortie);

  function valider() {
    validerWorkflow.mutate({
      referenceActe: dossier.referenceActe,
      agentMatriculeConnected: matricule,
      sousEntiteCode: ENTITE_CODE,
      ...(isArchivage ? { referenceSortie: referenceSortie.trim(), dateSortie } : {}),
    });
  }

  function closeMotifDialog() {
    setMotifDialog(null);
    setMotif('');
  }

  function confirmMotifDialog() {
    if (!motif.trim()) return;
    ressaisirDossier.mutate(
      {
        referenceActe: dossier.referenceActe,
        agentMatriculeConnected: matricule,
        entiteCode: ENTITE_CODE,
        sousEntiteCode: ENTITE_CODE,
        motifRejet: motif.trim(),
      },
      { onSuccess: closeMotifDialog },
    );
  }

  if (!canTraiter) return null;

  if (actionable === null) {
    return <p className="text-sm text-muted-foreground">{t('closedCloture')}</p>;
  }

  if (!canActOnEtape) {
    return (
      <p className="text-sm text-muted-foreground">
        {t('etapeReserved', { roles: allowedRoles.map((r) => ROLE_LABELS[r]).join(', ') })}
      </p>
    );
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-2 p-4">
        {actionable === 'DEPOT_DOSSIER' && (
          <ButtonValider icon={<Send className="h-4 w-4" />} onClick={valider} disabled={isPending}>
            {t('validerControle')}
          </ButtonValider>
        )}

        {actionable === 'CONTROLE_PIECES' && (
          <>
            <ButtonValider icon={<Check className="h-4 w-4" />} onClick={valider} disabled={isPending}>
              {t('validerControle')}
            </ButtonValider>
            <ButtonDanger onClick={() => setMotifDialog('retourner')} disabled={isPending}>
              <RotateCcw className="h-4 w-4" />
              {t('retournerComplement')}
            </ButtonDanger>
          </>
        )}

        {actionable === 'TRAITEMENT_TECHNIQUE' && (
          <ButtonValider icon={<Check className="h-4 w-4" />} onClick={valider} disabled={isPending}>
            {t('terminerTraitement')}
          </ButtonValider>
        )}

        {actionable === 'VISA_VALIDATION' && (
          <>
            <ButtonValider icon={<FileCheck className="h-4 w-4" />} onClick={valider} disabled={isPending}>
              {t('viser')}
            </ButtonValider>
            <ButtonDanger onClick={() => setMotifDialog('refuser')} disabled={isPending}>
              <Ban className="h-4 w-4" />
              {t('refuser')}
            </ButtonDanger>
          </>
        )}

        {actionable === 'EDITION_LIVRABLE' && (
          <ButtonValider icon={<FileCheck className="h-4 w-4" />} onClick={valider} disabled={isPending}>
            {t('genererLivrable')}
          </ButtonValider>
        )}

        {actionable === 'ARCHIVAGE' && (
          <div className="flex w-full flex-wrap items-end gap-3">
            <div>
              <Label htmlFor="archivage-reference-sortie">{t('referenceSortie')}</Label>
              <Input
                id="archivage-reference-sortie"
                className="mt-1.5"
                value={referenceSortie}
                onChange={(e) => setReferenceSortie(e.target.value)}
                data-testid="archivage-reference-sortie-input"
              />
            </div>
            <div>
              <Label htmlFor="archivage-date-sortie">{t('dateSortie')}</Label>
              <Input
                id="archivage-date-sortie"
                type="date"
                className="mt-1.5"
                value={dateSortie}
                onChange={(e) => setDateSortie(e.target.value)}
                data-testid="archivage-date-sortie-input"
              />
            </div>
            <ButtonValider icon={<Archive className="h-4 w-4" />} onClick={valider} disabled={isPending || archivageIncomplet}>
              {t('cloturerDossier')}
            </ButtonValider>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={motifDialog === 'retourner'}
        onOpenChange={(open) => !open && closeMotifDialog()}
        title={t('confirmRetourTitle')}
        variant="warning"
        loading={isPending}
        onConfirm={motif.trim() ? confirmMotifDialog : undefined}
      >
        <Textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder={t('motifRetourPlaceholder')}
          aria-label={t('motifRetourLabel')}
        />
      </ConfirmDialog>

      <ConfirmDialog
        open={motifDialog === 'refuser'}
        onOpenChange={(open) => !open && closeMotifDialog()}
        title={t('confirmRefusTitle')}
        variant="destructive"
        loading={isPending}
        onConfirm={motif.trim() ? confirmMotifDialog : undefined}
      >
        <Textarea
          value={motif}
          onChange={(e) => setMotif(e.target.value)}
          placeholder={t('motifRefusPlaceholder')}
          aria-label={t('motifRefusLabel')}
        />
      </ConfirmDialog>
    </Card>
  );
}
