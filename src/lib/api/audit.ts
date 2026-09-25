import { createStore, uuid } from '@/lib/fixtures/store';
import { getCurrentSessionUser } from '@/lib/utils/current-session';

export interface AuditLogEntry {
  auditId: string;
  dateAction: string;
  utilisateurMatricule: string;
  utilisateurNom: string;
  action: string;
  referenceActe?: string;
  detail: string;
}

const store = createStore<AuditLogEntry>('audit', [], (e) => e.auditId);

export const auditApi = {
  async list(): Promise<AuditLogEntry[]> {
    const items = await store.list();
    return [...items].sort((a, b) => b.dateAction.localeCompare(a.dateAction));
  },

  /** Fire-and-forget : les appelants (fonctions synchrones/async de lib/api/*.ts) n'ont pas
   * besoin d'attendre l'écriture du journal pour retourner leur propre résultat. */
  log(action: string, detail: string, opts?: { referenceActe?: string; utilisateurMatricule?: string; utilisateurNom?: string }): void {
    const explicit = opts?.utilisateurMatricule;
    const session = explicit ? null : getCurrentSessionUser();
    void store.create({
      auditId: uuid(),
      dateAction: new Date().toISOString(),
      utilisateurMatricule: explicit ?? session?.id ?? '',
      utilisateurNom: opts?.utilisateurNom ?? session?.name ?? '',
      action,
      referenceActe: opts?.referenceActe,
      detail,
    });
  },
};
