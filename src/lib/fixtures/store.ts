/**
 * Petit store en mémoire pour simuler une API REST à partir de fixtures
 * locales, le temps que le backend ne soit pas branché. Chaque domaine
 * (véhicules, dossiers, processus…) crée son propre store typé avec
 * createStore(), et la couche lib/api/*.ts l'expose avec la même
 * signature qu'auront les futurs appels réseau (fonctions async typées).
 */

function delay(ms = 150): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const STORAGE_PREFIX = 'dpe-srb-store:';

/**
 * Recharge un tableau depuis localStorage (clé préfixée par domaine) s'il existe, sinon retombe
 * sur les fixtures d'origine. Protégé contre le SSR/export statique (pas de `window` côté build)
 * et contre un storage indisponible/corrompu.
 */
export function loadPersisted<T>(storageKey: string, initial: T[]): T[] {
  if (typeof window === 'undefined') return [...initial];
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + storageKey);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // storage indisponible/corrompu — on retombe sur les fixtures
  }
  return [...initial];
}

/** Écrit un tableau dans localStorage sous la clé de domaine. Silencieux si le storage est plein/désactivé. */
export function persist<T>(storageKey: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + storageKey, JSON.stringify(data));
  } catch {
    // quota dépassé ou storage désactivé — la mutation reste appliquée en mémoire
  }
}

export function createStore<T>(storageKey: string, initial: T[], keyFn: (item: T) => string) {
  let data = loadPersisted(storageKey, initial);

  return {
    async list(): Promise<T[]> {
      await delay();
      return [...data];
    },

    async get(id: string): Promise<T | null> {
      await delay();
      return data.find((item) => keyFn(item) === id) ?? null;
    },

    async create(item: T): Promise<T> {
      await delay();
      data = [item, ...data];
      persist(storageKey, data);
      return item;
    },

    async update(id: string, patch: Partial<T>): Promise<T> {
      await delay();
      data = data.map((item) => (keyFn(item) === id ? { ...item, ...patch } : item));
      const updated = data.find((item) => keyFn(item) === id);
      if (!updated) throw new Error(`Élément introuvable : ${id}`);
      persist(storageKey, data);
      return updated;
    },

    async remove(id: string): Promise<void> {
      await delay();
      data = data.filter((item) => keyFn(item) !== id);
      persist(storageKey, data);
    },
  };
}

export function uuid(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
