import { test, expect, type APIRequestContext } from '@playwright/test';

/**
 * T-INT-03 — chaîne anti-surfacturation de bout en bout, côté serveur (sans navigateur) :
 * passerelle (JWT) → api-constatation / api-visabc / api-workflow / api-documents → hub → PostgreSQL
 * → JasperReports. Chaque étape est faite avec le compte du rôle habilité (agent, contrôle, expert,
 * chef, administrateur) et les refus attendus sont vérifiés (409, 403, 401).
 *
 * Précondition : un véhicule de test recensé cette année (créé par T-INT-02, lancé juste avant).
 */
const GW = 'http://localhost:6556';
const MDP = process.env.E2E_PASSWORD ?? '';
const COMPTES = {
  admin: process.env.E2E_LOGIN ?? 'bscva.admin',
  saisie: 'bscva.saisie', controle: 'bscva.controle', expert: 'bscva.expert',
  chef: 'bscva.chef.drpe', consult: 'bscva.consult',
} as const;
type Role = keyof typeof COMPTES;

const jetons: Partial<Record<Role, string>> = {};
async function h(request: APIRequestContext, role: Role) {
  if (!jetons[role]) {
    const r = await request.post(`${GW}/api-financiere/rest/login`, { data: { login: COMPTES[role], password: MDP } });
    expect(r.status(), `connexion ${COMPTES[role]}`).toBe(200);
    jetons[role] = (await r.json()).token;
  }
  return { Authorization: `Bearer ${jetons[role]}` };
}

function note(type: string, description: string) {
  test.info().annotations.push({ type, description });
}

test('T-INT-03 : constatation → visa du BC → réception technique, rôles et refus contrôlés', async ({ request }) => {
  const t0 = Date.now();
  const annee = new Date().getFullYear();
  const aujourdHui = new Date().toISOString().slice(0, 10);

  // 0. Sécurité de la passerelle
  expect((await request.post(`${GW}/api-security/generateToken`, { form: { id: '1', role: 'ADMIN', userName: 'x' } })).status(),
    'fabrication de jeton bloquée').toBe(403);
  expect((await request.get(`${GW}/api-vehicules/api/vehicules`, { headers: { Authorization: 'Bearer jeton.invalide.x' } })).status(),
    'jeton invalide refusé').toBe(401);
  note('securite', 'generateToken via passerelle : 403 ; jeton invalide : 401');

  // 1. Véhicule de test recensé cette année (T-INT-02)
  const vehicules = await (await request.get(`${GW}/api-vehicules/api/vehicules`, { headers: await h(request, 'admin') })).json() as Array<Record<string, string>>;
  const candidats = vehicules.filter((v) => (v.vehiculeImmatriculation ?? '').startsWith('E2E-'));
  let veh: Record<string, string> | undefined;
  let etat: Record<string, string> | undefined;
  for (const v of candidats.reverse()) {
    const r = await request.get(`${GW}/api-recensement/api/recensements/dernier-etat?vehiculeId=${v.vehiculeId}`, { headers: await h(request, 'admin') });
    if (r.status() === 200) {
      const e = await r.json();
      if (e && String(e.exercice) === String(annee)) { veh = v; etat = e; break; }
    }
  }
  expect(veh, 'véhicule E2E recensé cette année (lancer T-INT-02 avant)').toBeTruthy();
  note('vehicule', `${veh!.vehiculeImmatriculation} ${veh!.vehiculeId} — SOA ${etat!.soaCode}`);

  // 2. Doublon de recensement : 409, et aucun dossier créé
  const avant = (await (await request.get(`${GW}/api-workflow/api/dossiers`, { headers: await h(request, 'admin') })).json() as unknown[]).length;
  const doublon = await request.post(`${GW}/api-recensement/api/recensements`, {
    headers: await h(request, 'saisie'),
    data: { minCode: '21', soaCode: etat!.soaCode, niveauType: 'CENTRALE', niveauLibelle: 'Doublon T-INT-03',
      lignes: [{ vehiculeId: veh!.vehiculeId, soaCode: etat!.soaCode, etatGeneral: '1', categorieUtilisation: '3', type: 'Berline' }] },
  });
  const apres = (await (await request.get(`${GW}/api-workflow/api/dossiers`, { headers: await h(request, 'admin') })).json() as unknown[]).length;
  expect(doublon.status(), 'doublon de recensement').toBe(409);
  expect(apres, 'aucun dossier créé par le doublon').toBe(avant);
  note('doublon', `HTTP ${doublon.status()} ; dossiers avant/après : ${avant}/${apres}`);

  // 3. Constatation : structure différente → 409 ; bonne structure → créée
  const constat = (soa: string) => ({
    constatation: { ministereCode: '21', vehiculeId: veh!.vehiculeId, numeroConstat: `CT-E2E-${Date.now() % 100000}`,
      dateConstat: aujourdHui, heureConstat: '09:00', lieu: 'Garage administratif (test)', expertNom: 'Expert de test',
      kilometrage: 42000, nomChauffeur: 'Chauffeur de test', etatGeneral: '1', soaCode: soa, constats: 'Freinage à reprendre' },
    elements: [], piecesRemplacer: [{ libelle: 'Plaquettes de frein avant' }], reparations: [{ libelle: 'Remplacement plaquettes' }], accessoires: [],
  });
  const mauvaise = await request.post(`${GW}/api-constatation/api/constatations`, { headers: await h(request, 'expert'), data: constat('00-00-0-000-STRUCTURE-AUTRE') });
  expect(mauvaise.status(), 'structure différente').toBe(409);
  const cst = await request.post(`${GW}/api-constatation/api/constatations`, { headers: await h(request, 'expert'), data: constat(etat!.soaCode) });
  expect(cst.status(), `création constatation : ${await cst.text()}`).toBe(200);
  const { referenceActe: refCst, constatationId } = await cst.json();
  note('constatation', `${refCst} (structure différente : HTTP ${mauvaise.status()})`);

  // 4. Workflow de la constatation : rôle non habilité refusé, puis chaque étape par son rôle
  const valider = (ref: string, role: Role, data: Record<string, string> = {}) =>
    h(request, role).then((headers) => request.post(`${GW}/api-workflow/api/dossiers/${ref}/valider`, { headers, data }));
  const refus = await valider(refCst, 'consult');
  expect(refus.status(), 'rôle CONSULT refusé').toBe(403);
  for (const role of ['controle', 'expert', 'chef'] as Role[]) {
    const r = await valider(refCst, role);
    expect(r.status(), `étape validée par ${role} : ${await r.text()}`).toBe(200);
  }
  note('workflow_constatation', `CONSULT : 403 ; contrôle, expert, chef : 200`);
  expect((await request.patch(`${GW}/api-constatation/api/constatations/${constatationId}/valider`, { headers: await h(request, 'admin') })).status()).toBe(200);
  const pvCst = await request.post(`${GW}/api-documents/api/dossiers/${refCst}/documents/generer/PV_CONSTATATION`, { headers: await h(request, 'admin') });
  expect(pvCst.status(), 'PV de constatation').toBe(200);

  // 5. Visa du bon de commande (grands travaux) puis décision du chef
  const visa = await request.post(`${GW}/api-visabc/api/visas-bc`, {
    headers: await h(request, 'saisie'),
    data: { ministereCode: '21', vehiculeId: veh!.vehiculeId, numeroBc: `BC-E2E-${Date.now() % 100000}`, dateBc: aujourdHui,
      fournisseur: 'Garage de test', nifStat: '1234567890 / 2019 11 12345', referencePvConstat: refCst, grandsTravaux: true,
      lignes: [{ designation: 'Plaquettes de frein avant', quantite: 1, prixUnitaire: 150000 },
               { designation: 'Remplacement plaquettes', quantite: 1, prixUnitaire: 80000 }] },
  });
  expect(visa.status(), `création visa BC : ${await visa.text()}`).toBe(200);
  const { referenceActe: refVisa, visaBcId } = await visa.json();
  const decision = await request.patch(`${GW}/api-visabc/api/visas-bc/${visaBcId}/decision`, {
    headers: await h(request, 'chef'), data: { decision: 'VISA', numeroVisa: `VISA-E2E-${annee}`, dateVisa: aujourdHui },
  });
  expect(decision.status(), `décision : ${await decision.text()}`).toBe(200);
  const lu = await (await request.get(`${GW}/api-visabc/api/visas-bc/${visaBcId}`, { headers: await h(request, 'admin') })).json();
  note('visa_bc', `${refVisa} — montant serveur ${lu.montant ?? lu.montantTotal ?? '?'} Ar, décision ${lu.decision}`);
  const bcVise = await request.post(`${GW}/api-documents/api/dossiers/${refVisa}/documents/generer/BC_VISE`, { headers: await h(request, 'admin') });
  expect(bcVise.status(), 'BC visé').toBe(200);

  // 6. Réception technique sur le BC visé « grands travaux », avis favorable → PV de réception
  const rct = await request.post(`${GW}/api-receptiontechnique/api/receptions-techniques`, {
    headers: await h(request, 'expert'),
    data: { ministereCode: '21', visaBcId, dateReception: aujourdHui, heureReception: '15:00', minSoa: etat!.soaCode,
      serviceFaitGac: true, expertNom: 'Expert de test', responsableNom: 'Responsable de test', constats: ['Travaux conformes au BC'] },
  });
  expect(rct.status(), `création réception : ${await rct.text()}`).toBe(200);
  const { referenceActe: refRct, receptionId } = await rct.json();
  const avis = await request.patch(`${GW}/api-receptiontechnique/api/receptions-techniques/${receptionId}/avis`, {
    headers: await h(request, 'expert'), data: { avis: 'FAVORABLE' },
  });
  expect(avis.status(), `avis : ${await avis.text()}`).toBe(200);
  const docsRct = JSON.stringify(await (await request.get(`${GW}/api-documents/api/dossiers/${refRct}/documents`, { headers: await h(request, 'admin') })).json());
  expect(docsRct).toContain('PV_RECEPTION');
  note('reception', `${refRct} — avis FAVORABLE, PV_RECEPTION généré`);

  note('references', JSON.stringify({ refCst, refVisa, refRct }));
  note('duree_ms', `${Date.now() - t0}`);
});
