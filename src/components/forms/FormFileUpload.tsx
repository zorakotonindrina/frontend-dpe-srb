'use client';

import { useRef, useState, type DragEvent, type ChangeEvent } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}\u00a0B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}\u00a0Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}\u00a0Mo`;
}

/* ------------------------------------------------------------------ */
/* Types                                                                */
/* ------------------------------------------------------------------ */

export interface FormFileUploadProps {
  /** Nom du champ (clé dans le schéma Zod) */
  name: string;
  /** Label affiché au-dessus */
  label: string;
  /** Types MIME acceptés (ex. "image/*,.pdf") */
  accept?: string;
  /** Taille max en octets (ex. 5 * 1024 * 1024 = 5 Mo) */
  maxSize?: number;
  /** Accepte plusieurs fichiers */
  multiple?: boolean;
  /** Champ obligatoire */
  required?: boolean;
  /** Désactive le champ */
  disabled?: boolean;
  className?: string;
}

/* ------------------------------------------------------------------ */
/* FormFileUpload                                                       */
/* ------------------------------------------------------------------ */

export function FormFileUpload({
  name,
  label,
  accept,
  maxSize,
  multiple = false,
  required = false,
  disabled = false,
  className,
}: FormFileUploadProps) {
  const t = useTranslations('upload');
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [sizeError, setSizeError] = useState<string | null>(null);

  const files: File[] = Array.isArray(field.value)
    ? field.value
    : field.value instanceof File
      ? [field.value]
      : field.value instanceof FileList
        ? Array.from(field.value)
        : [];

  function validateAndSet(incoming: File[]) {
    setSizeError(null);
    if (maxSize) {
      const oversized = incoming.filter((f) => f.size > maxSize);
      if (oversized.length > 0) {
        setSizeError(
          t('errorTooLarge', {
            size:  formatFileSize(maxSize),
            files: oversized.map((f) => f.name).join(', '),
          }),
        );
        return;
      }
    }
    field.onChange(multiple ? incoming : incoming[0] ?? null);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (picked.length) validateAndSet(picked);
    e.target.value = '';
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length) validateAndSet(dropped);
  }

  function removeFile(index: number) {
    const next = files.filter((_, i) => i !== index);
    field.onChange(multiple ? next : next[0] ?? null);
  }

  const errorMessage = sizeError ?? (error?.message as string | undefined);

  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      {/* Zone de dépôt */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={t('dropZoneLabel')}
        aria-invalid={!!errorMessage}
        aria-disabled={disabled}
        onDragEnter={() => !disabled && setIsDragging(true)}
        onDragOver={(e) => { e.preventDefault(); !disabled && setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            inputRef.current?.click();
          }
        }}
        className={cn(
          'flex flex-col items-center gap-3 rounded-[var(--radius-md)] border-2 border-dashed px-6 py-8 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-muted/30',
          disabled && 'pointer-events-none opacity-50',
          errorMessage && 'border-destructive',
        )}
      >
        <UploadCloud
          className={cn(
            'h-8 w-8',
            isDragging ? 'text-primary' : 'text-muted-foreground',
          )}
          aria-hidden="true"
        />
        <div>
          <p className="text-sm font-medium text-foreground">
            {t('dragOrBrowse')}{' '}
            <span className="text-primary underline-offset-2 hover:underline">
              {t('browse')}
            </span>
          </p>
          {accept && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('acceptedFormats', { accept })}
            </p>
          )}
          {maxSize && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {t('maxSize', { size: formatFileSize(maxSize) })}
            </p>
          )}
        </div>
      </div>

      {/* Input caché */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        aria-hidden="true"
        onChange={handleChange}
      />

      {/* Liste des fichiers sélectionnés */}
      {files.length > 0 && (
        <ul className="grid gap-1.5 mt-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-muted/30 px-3 py-2 text-sm"
            >
              <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="flex-1 truncate font-medium">{file.name}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                {formatFileSize(file.size)}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                aria-label={`${t('deleteFile' as never)} ${file.name}`}
                disabled={disabled}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}

      {errorMessage && (
        <p className="text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
