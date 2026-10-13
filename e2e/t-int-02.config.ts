import { defineConfig, devices } from '@playwright/test';

/** Configuration autonome du scénario d'écriture de bout en bout T-INT-02 (mémoire §8.4). */
export default defineConfig({
  testDir: '.',
  testMatch: /t-int-02-ecriture\.spec\.ts/,
  timeout: 240_000,
  reporter: [['list'], ['json', { outputFile: 't-int-02-resultat.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3000',
    locale: 'fr-FR',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
});
