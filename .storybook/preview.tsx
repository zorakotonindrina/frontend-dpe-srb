import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import '../src/app/globals.css';
import messages from '../messages/fr.json';

const preview: Preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    backgrounds: {
      default: 'augure',
      values: [
        { name: 'augure',  value: 'var(--color-background, #f9fafb)' },
        { name: 'surface', value: 'var(--color-surface, #ffffff)' },
        { name: 'dark',    value: '#0f172a' },
      ],
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date:  /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <NextIntlClientProvider locale="fr" messages={messages}>
        <div className="font-sans antialiased">
          <Story />
        </div>
      </NextIntlClientProvider>
    ),
  ],
};

export default preview;
