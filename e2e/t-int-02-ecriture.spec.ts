import { test, expect, type Page } from '@playwright/test';

/**
 * T-INT-02 — parcours d'écriture de bout en bout :
 * navigateur → passerelle (JWT) → api-recensement / api-workflow / api-documents → hub → PostgreSQL.
 * Crée un recensement d'un véhicule de test, fait avancer le dossier jusqu'à l'édition du livrable,
 * génère le quitus puis vérifie, par l'API, que l'état du véhicule a été historisé.
 */
const LOGIN = process.env.E2E_LOGIN ?? '';
const PASSWORD = process.env.E2E_PASSWORD ?? '';
const IMMAT = `E2E-${Date.now().toString().slice(-6)}`;

async function choisir(page: Page, trigger: string, option?: string) {
  await page.locator(trigger).click();
  // [role=option] explicite : exclut les <option> natives du sélecteur de langue de la barre du haut.
  const opt = option ? page.locator('[role="option"]:visible', { hasText: option }).first() : page.locator('[role="option"]:visible').first();
  await opt.click();
}

test('T-INT-02 : recensement créé, validé et quitus généré de bout en bout', async ({ page, request }) => {
  const t0 = Date.now();
  // 1. Connexion
  await page.goto('/login');
  await page.locator('input[name="login"]').fill(LOGIN);
  await page.locator('input[name="password"]').fill(PASSWORD);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'));

  // 2. Assistant de recensement — en-tête
  await page.goto('/processus/recensement/nouveau');
  await choisir(page, '#select-minCode');
  await choisir(page, '#select-niveauType');
  await page.locator('input[name="niveauLibelle"]').fill('Recette T-INT-02');
  await page.locator('input[name="pointFocalNom"]').fill('Point focal de test');
  await page.locator('input[name="pointFocalFonction"]').fill('Testeur');
  await page.locator('input[name="pointFocalTel"]').fill('0340000000');
  await page.locator('input[name="pointFocalEmail"]').fill('test@example.org');
  await page.getByRole('button', { name: 'Suivant' }).click();

  // 3. Ligne de recensement : véhicule de test créé dans le panneau
  await page.getByTestId('vehicule-quick-add-immat-input').fill(IMMAT);
  await page.getByTestId('vehicule-quick-add-immat-input').blur();
  const soa = page.getByTestId('vehicule-quick-add-soa');
  await soa.pressSequentially('DIRECTION', { delay: 40 });
  await page.locator('[data-testid^="vehicule-quick-add-soa-option-"]').first().click({ timeout: 30_000 });
  await page.getByTestId('recensement-detenteur-input').fill('Parc de service — test');
  await page.getByTestId('recensement-type-input').fill('Berline');
  await choisir(page, '[data-testid="recensement-categorie-select"]');
  await choisir(page, '[data-testid="recensement-etat-select"]');
  await page.getByTestId('vehicule-quick-add-confirm').click();
  await expect(page.getByText(IMMAT).first()).toBeVisible();
  await page.getByRole('button', { name: 'Suivant' }).click();

  // 4. Confirmation : création du dossier (passerelle → api-recensement → api-workflow → hub)
  const creation = page.waitForResponse((r) => r.url().includes('/api-recensement/api/recensements') && r.request().method() === 'POST');
  await page.getByRole('button', { name: 'Enregistrer' }).click();
  const rep = await creation;
  expect(rep.status()).toBe(200);
  const { referenceActe } = await rep.json();
  expect(referenceActe).toBeTruthy();
  test.info().annotations.push({ type: 'referenceActe', description: referenceActe });

  // 5. Avancement du workflow dans l'écran du dossier, jusqu'à l'édition du livrable
  await page.goto(`/dossiers/detail?reference=${referenceActe}`);
  const etapes = page.getByRole('button', { name: /^(Valider le contrôle|Terminer le traitement technique|Viser)$/ });
  const generer = page.getByRole('button', { name: 'Générer le livrable' });
  for (let i = 0; i < 8; i++) {
    await expect(etapes.first().or(generer.first())).toBeVisible({ timeout: 30_000 });
    if (await generer.first().isVisible()) break;
    const avance = page.waitForResponse((r) => r.url().includes(`/api-workflow/api/dossiers/${referenceActe}/valider`));
    await etapes.first().click();
    expect((await avance).status()).toBe(200);
    test.info().annotations.push({ type: 'etape', description: `validation ${i + 1}` });
    await page.waitForTimeout(1_000);
  }

  // 6. L'étape « Générer le livrable » ouvre l'archivage ; le quitus est produit depuis l'onglet
  //    « Véhicules recensés » (validation du recensement → historisation de l'état + rendu JasperReports).
  if (await generer.first().isVisible()) {
    const avance = page.waitForResponse((r) => r.url().includes(`/api-workflow/api/dossiers/${referenceActe}/valider`));
    await generer.first().click();
    expect((await avance).status()).toBe(200);
  }
  await page.getByRole('tab', { name: 'Véhicules recensés' }).click();
  const tGen = Date.now();
  const generation = page.waitForResponse((r) => r.url().includes('/documents/generer/QUITUS_RECENSEMENT') && r.request().method() === 'POST', { timeout: 60_000 });
  await page.getByTestId('generer-quitus-button').click();
  const gen = await generation;
  test.info().annotations.push({ type: 'generation_quitus', description: `HTTP ${gen.status()} en ${Date.now() - tGen} ms` });
  expect(gen.status()).toBe(200);
  await page.keyboard.press('Escape');

  // 7. Clôture du dossier (numéro et date de sortie)
  await page.goto(`/dossiers/detail?reference=${referenceActe}`);
  await page.getByTestId('archivage-reference-sortie-input').fill('E2E/001');
  await page.getByTestId('archivage-date-sortie-input').fill(new Date().toISOString().slice(0, 10));
  const cloture = page.waitForResponse((r) => r.url().includes(`/api-workflow/api/dossiers/${referenceActe}/valider`));
  await page.getByRole('button', { name: 'Clôturer le dossier' }).click();
  expect((await cloture).status()).toBe(200);

  // 8. Vérifications en base, relues par la passerelle avec un jeton obtenu indépendamment
  const login = await request.post('http://localhost:6556/api-financiere/rest/login', { data: { login: LOGIN, password: PASSWORD } });
  const headers = { Authorization: `Bearer ${(await login.json()).token}` };
  const dossier = await (await request.get(`http://localhost:6556/api-workflow/api/dossiers/${referenceActe}`, { headers })).json();
  test.info().annotations.push({ type: 'dossier', description: JSON.stringify(dossier).slice(0, 400) });
  const docs = await (await request.get(`http://localhost:6556/api-documents/api/dossiers/${referenceActe}/documents`, { headers })).json();
  test.info().annotations.push({ type: 'documents', description: JSON.stringify(docs).slice(0, 400) });
  expect(JSON.stringify(docs)).toContain('QUITUS_RECENSEMENT');
  const vehicules = await (await request.get('http://localhost:6556/api-vehicules/api/vehicules', { headers })).json();
  const veh = (vehicules as Array<Record<string, string>>).find((v) => v.vehiculeImmatriculation === IMMAT);
  expect(veh).toBeTruthy();
  const mouvements = await (await request.get(`http://localhost:6556/api-vehicules/api/vehicules/${veh!.vehiculeId}/mouvements`, { headers })).json();
  test.info().annotations.push({ type: 'mouvements', description: JSON.stringify(mouvements).slice(0, 400) });
  expect(JSON.stringify(mouvements)).toContain(referenceActe);
  test.info().annotations.push({ type: 'vehicule', description: `${IMMAT} ${veh!.vehiculeId}` });
  test.info().annotations.push({ type: 'duree_ms', description: `${Date.now() - t0}` });
});
