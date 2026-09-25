import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { outputFolder: 'playwright-report' }], ['list']],

  use: {
    baseURL:    'http://localhost:3000',
    trace:      'on-first-retry',
    screenshot: 'only-on-failure',
    video:      'retain-on-failure',
    locale:     'fr-FR',
    launchOptions: {
      slowMo: process.env.SLOWMO ? Number(process.env.SLOWMO) : 0,
    },
  },

  projects: [
    // Setup : authentification réutilisée entre tous les tests
    {
      name:      'setup',
      testMatch: /global\.setup\.ts/,
    },

    // Tests nécessitant une session authentifiée
    {
      name:         'chromium',
      use:          { ...devices['Desktop Chrome'],  storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name:         'firefox',
      use:          { ...devices['Desktop Firefox'], storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
    {
      name:         'mobile',
      use:          { ...devices['iPhone 13'],       storageState: 'e2e/.auth/user.json' },
      dependencies: ['setup'],
    },

    // Tests d'authentification sans session préchargée
    {
      name:      'auth-tests',
      testMatch: /auth\//,
      use:       { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command:            'npm run dev',
    url:                'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
