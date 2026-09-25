'use client';

import dynamic from 'next/dynamic';
import { useId } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import type { IAllProps } from '@tinymce/tinymce-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type TinyMCEEditorProps = IAllProps;

const TinyMCEEditor = dynamic<TinyMCEEditorProps>(
  () => import('@tinymce/tinymce-react').then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-72 items-center rounded-sm border border-border bg-muted/30 px-3 text-sm text-muted-foreground">
        Chargement de l&apos;editeur...
      </div>
    ),
  },
);

export interface RichTextEditorProps {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  height?: number;
  description?: string;
  className?: string;
  init?: TinyMCEEditorProps['init'];
}

const DEFAULT_PLUGINS = [
  'advlist',
  'autolink',
  'code',
  'link',
  'lists',
  'preview',
  'table',
].join(' ');

const DEFAULT_TOOLBAR = [
  'undo redo',
  'blocks',
  'bold italic underline',
  'alignleft aligncenter alignright alignjustify',
  'bullist numlist outdent indent',
  'link table',
  'removeformat',
  'preview code',
].join(' | ');

export function RichTextEditor({
  name,
  label,
  required = false,
  disabled = false,
  placeholder,
  height = 360,
  description,
  className,
  init,
}: RichTextEditorProps) {
  const generatedId = useId();
  const editorId = `rich-text-${name}-${generatedId.replace(/:/g, '')}`;
  const { control } = useFormContext();
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const descriptionId = description ? `${editorId}-description` : undefined;
  const errorId = error?.message ? `${editorId}-error` : undefined;

  return (
    <div
      className={cn('grid gap-1.5', className)}
      data-testid={`rich-text-editor-${name}`}
    >
      <Label htmlFor={editorId}>
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      <div
        className={cn(
          'rounded-sm',
          error && 'ring-1 ring-destructive',
          disabled && 'opacity-70',
        )}
        data-invalid={!!error}
      >
        <TinyMCEEditor
          id={editorId}
          textareaName={name}
          tinymceScriptSrc="/tinymce/tinymce.min.js"
          licenseKey="gpl"
          disabled={disabled}
          value={field.value ?? ''}
          onEditorChange={(content) => field.onChange(content)}
          onBlur={field.onBlur}
          init={{
            height,
            menubar: 'edit insert format table view',
            plugins: DEFAULT_PLUGINS,
            toolbar: DEFAULT_TOOLBAR,
            language: 'fr_FR',
            language_url: '/tinymce/langs/fr_FR.js',
            branding: false,
            promotion: false,
            resize: true,
            statusbar: true,
            placeholder,
            content_style:
              'body { font-family: Arial, sans-serif; font-size: 14px; line-height: 1.5; }',
            ...init,
          }}
        />
      </div>

      {description && !error?.message && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error?.message && (
        <p
          id={errorId}
          className="text-sm text-destructive"
          role="alert"
          data-testid={`rich-text-editor-${name}-error`}
        >
          {error.message}
        </p>
      )}
    </div>
  );
}
