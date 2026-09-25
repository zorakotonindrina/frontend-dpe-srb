import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDir = resolve(rootDir, 'node_modules', 'tinymce');
const targetDir = resolve(rootDir, 'public', 'tinymce');

if (!existsSync(sourceDir)) {
  throw new Error(
    'TinyMCE is not installed. Run `npm install tinymce @tinymce/tinymce-react` first.',
  );
}

if (!targetDir.startsWith(resolve(rootDir, 'public'))) {
  throw new Error(`Refusing to copy TinyMCE assets outside public/: ${targetDir}`);
}

rmSync(targetDir, { recursive: true, force: true });
mkdirSync(targetDir, { recursive: true });

for (const entry of [
  'icons',
  'models',
  'plugins',
  'skins',
  'themes',
  'license.md',
  'notices.txt',
  'tinymce.d.ts',
  'tinymce.js',
  'tinymce.min.js',
]) {
  const from = resolve(sourceDir, entry);
  if (existsSync(from)) {
    cpSync(from, resolve(targetDir, entry), { recursive: true });
  }
}
