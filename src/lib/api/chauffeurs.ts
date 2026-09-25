import type { Chauffeur } from '@/lib/fixtures/chauffeurs.fixtures';
import { api } from './client';

export type ChauffeurInput = Omit<Chauffeur, 'chauffeurId'>;

export const chauffeursApi = {
  list: () => api.get<Chauffeur[]>('/api-testchauffeur/api/chauffeurs'),

  async create(input: ChauffeurInput): Promise<Chauffeur> {
    const { chauffeurId } = await api.post<{ chauffeurId: string }>('/api-testchauffeur/api/chauffeurs', input);
    return { ...input, chauffeurId };
  },
};

export type { Chauffeur };
