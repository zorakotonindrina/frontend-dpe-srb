import { defineConfig, devices } from '@playwright/test';

/** Scénarios d'écriture de bout en bout T-INT-02 puis T-INT-03, joués à la suite (mémoire §8.4). */
export default defineConfig({
  testDir: '.',
  testMatch: /t-int-0[23]-.*\.spec\.ts/,
  workers: 1,
  fullyParallel: false,
  timeout: 240_000,
  reporter: [['list'], ['json', { outputFile: 't-int-resultat.json' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:3000',
    locale: 'fr-FR',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
});
