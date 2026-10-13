// Test de charge (mémoire §8.4, exigence « 30 utilisateurs simultanés ») — poste de développement.
// 30 utilisateurs virtuels se connectent puis enchaînent, pendant DUREE_S secondes, les consultations
// les plus fréquentes (listes des véhicules et des dossiers, « Mes tâches », détail d'un dossier),
// avec une seconde de réflexion entre deux actions. Mesures : temps de réponse (médiane, 95e
// centile, maximum), débit et taux d'erreur, par point d'entrée.
// Usage : E2E_LOGIN=... E2E_PASSWORD=... node e2e/charge-30.mjs [utilisateurs] [durée_s]
import { writeFileSync } from 'node:fs';

const GW = process.env.E2E_GATEWAY ?? 'http://localhost:6556';
const LOGIN = process.env.E2E_LOGIN;
const PASSWORD = process.env.E2E_PASSWORD;
const UTILISATEURS = Number(process.argv[2] ?? 30);
const DUREE_S = Number(process.argv[3] ?? 120);
const REFLEXION_MS = 1000;

const mesures = new Map(); // nom → { durees: [], erreurs: 0 }
function noter(nom, ms, ok) {
  if (!mesures.has(nom)) mesures.set(nom, { durees: [], erreurs: 0 });
  const m = mesures.get(nom);
  m.durees.push(ms);
  if (!ok) m.erreurs++;
}

async function appel(nom, url, options = {}) {
  const t = performance.now();
  try {
    const r = await fetch(url, options);
    const corps = await r.text();
    noter(nom, performance.now() - t, r.ok);
    return r.ok ? JSON.parse(corps) : null;
  } catch {
    noter(nom, performance.now() - t, false);
    return null;
  }
}

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

async function utilisateur(n, fin) {
  await pause(n * 100); // montée en charge progressive sur 3 s
  const login = await appel('connexion', `${GW}/api-financiere/rest/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ login: LOGIN, password: PASSWORD }),
  });
  if (!login?.token) return;
  const h = { headers: { Authorization: `Bearer ${login.token}` } };
  let reference = null;
  while (Date.now() < fin) {
    const dossiers = await appel('liste des dossiers', `${GW}/api-workflow/api/dossiers`, h);
    if (Array.isArray(dossiers) && dossiers.length) reference = dossiers[(n * 7) % dossiers.length].referenceActe;
    await pause(REFLEXION_MS);
    await appel('liste des véhicules', `${GW}/api-vehicules/api/vehicules`, h);
    await pause(REFLEXION_MS);
    await appel('mes tâches', `${GW}/api-workflow/api/dossiers/mes-taches`, h);
    await pause(REFLEXION_MS);
    if (reference) await appel('détail d\'un dossier', `${GW}/api-workflow/api/dossiers/${reference}`, h);
    await pause(REFLEXION_MS);
  }
}

const pct = (a, p) => a[Math.min(a.length - 1, Math.ceil((p / 100) * a.length) - 1)];
const debut = Date.now();
const fin = debut + DUREE_S * 1000;
await Promise.all(Array.from({ length: UTILISATEURS }, (_, i) => utilisateur(i, fin)));
const dureeReelle = (Date.now() - debut) / 1000;

const lignes = [];
let total = 0, erreurs = 0;
for (const [nom, m] of mesures) {
  const d = [...m.durees].sort((a, b) => a - b);
  total += d.length; erreurs += m.erreurs;
  lignes.push({ point: nom, appels: d.length, erreurs: m.erreurs, mediane_ms: Math.round(pct(d, 50)),
    p95_ms: Math.round(pct(d, 95)), max_ms: Math.round(d[d.length - 1]) });
}
const resume = { utilisateurs: UTILISATEURS, duree_s: Math.round(dureeReelle), appels: total, erreurs,
  taux_erreur_pct: +(100 * erreurs / Math.max(1, total)).toFixed(2), debit_par_s: +(total / dureeReelle).toFixed(1), points: lignes };
console.table(lignes);
console.log(JSON.stringify({ ...resume, points: undefined }));
writeFileSync(new URL('./charge-30-resultat.json', import.meta.url), JSON.stringify(resume, null, 2));
