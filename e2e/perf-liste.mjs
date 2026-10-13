import { chromium } from 'playwright';
const b = await chromium.launch(); const p = await b.newPage({ baseURL: 'http://localhost:3000' });
await p.goto('/login'); await p.fill('input[name="login"]', process.env.E2E_LOGIN); await p.fill('input[name="password"]', process.env.E2E_PASSWORD);
await p.click('button[type="submit"]'); await p.waitForURL((u) => !u.pathname.startsWith('/login'));
const url = process.env.URL ?? '/dossiers/liste?vue=en-cours';
const res = [];
for (let i = 0; i < 6; i++) {
  const t = Date.now();
  const api = p.waitForResponse((r) => r.url().includes('/api-workflow/api/dossiers') && r.request().method() === 'GET', { timeout: 60000 });
  await p.goto(url);
  await api;
  await p.locator('[role="row"], table tr').nth(1).waitFor({ timeout: 60000 }).catch(async () => { await p.screenshot({ path: 'e2e/perf.png' }); throw new Error('pas de ligne'); });
  res.push(Date.now() - t);
}
console.log(url, 'affichage (ms):', res.join(', '));
await b.close();
