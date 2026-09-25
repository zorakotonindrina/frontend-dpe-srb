'use client';

import { useTranslations } from 'next-intl';
import { Download } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDownloadDocument } from '@/hooks/useDocuments';
import type { DocumentGenere, DocumentStatut } from '@/lib/api/documents';

export interface DocumentVersionInfo {
  versionIndex: number;
  versionCount: number;
  isLatest: boolean;
}

export interface DocumentVersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: DocumentGenere[];
  versions: Map<string, DocumentVersionInfo>;
  statutVariant: Record<DocumentStatut, 'default' | 'secondary' | 'destructive' | 'outline'>;
}

export function DocumentVersionsDialog({
  open, onOpenChange, documents, versions, statutVariant,
}: DocumentVersionsDialogProps) {
  const tCommon = useTranslations('common');
  const t = useTranslations('documents');
  const tStatuts = useTranslations('documents.statuts');
  const downloadDocument = useDownloadDocument();

  const sorted = [...documents].sort((a, b) => b.genereLe.localeCompare(a.genereLe));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('versions.title')}</DialogTitle>
          <p className="text-sm text-muted-foreground">{t('versions.subtitle', { count: documents.length })}</p>
        </DialogHeader>

        <ul className="max-h-[60vh] space-y-2 overflow-y-auto">
          {sorted.map((d) => {
            const v = versions.get(d.documentId);
            return (
              <li
                key={d.documentId}
                className="flex items-center justify-between gap-3 rounded-sm border border-border px-3 py-2"
                data-testid={`document-version-row-${d.documentId}`}
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    {t('columns.genereLe')} {d.genereLe}
                    {v && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        {t('versions.label', { index: v.versionIndex, count: v.versionCount })}
                      </span>
                    )}
                    {v?.isLatest && (
                      <Badge variant="outline" className="ml-2">{t('versions.current')}</Badge>
                    )}
                  </p>
                  <Badge variant={statutVariant[d.statut]}>{tStatuts(d.statut)}</Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={downloadDocument.isPending}
                  onClick={() => downloadDocument.mutate({ documentId: d.documentId, numeroDocument: d.numeroDocument })}
                  data-testid={`document-version-download-${d.documentId}`}
                >
                  <Download className="mr-1.5 h-4 w-4" />
                  {t('actions.telecharger')}
                </Button>
              </li>
            );
          })}
        </ul>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>{tCommon('close')}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
