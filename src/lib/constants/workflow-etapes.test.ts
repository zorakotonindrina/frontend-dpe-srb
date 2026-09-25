import { describe, it, expect } from 'vitest';
import { deriveWorkflowState, getActionableEtape } from './workflow-etapes';

describe('deriveWorkflowState', () => {
  it('null — circuit terminé, toutes les étapes closes', () => {
    const { etapeStates } = deriveWorkflowState(null);
    expect(Object.values(etapeStates)).toEqual(Array(6).fill('done'));
  });

  it('DEPOT_DOSSIER — dépôt actif', () => {
    const { etapeStates } = deriveWorkflowState('DEPOT_DOSSIER');
    expect(etapeStates.DEPOT_DOSSIER).toBe('active');
    expect(etapeStates.CONTROLE_PIECES).toBe('pending');
  });

  it('CONTROLE_PIECES — dépôt terminé, contrôle des pièces actif', () => {
    const { etapeStates } = deriveWorkflowState('CONTROLE_PIECES');
    expect(etapeStates.DEPOT_DOSSIER).toBe('done');
    expect(etapeStates.CONTROLE_PIECES).toBe('active');
    expect(etapeStates.TRAITEMENT_TECHNIQUE).toBe('pending');
  });

  it('CONTROLE_PIECES + motifRejet — retourné pour complément (ressaisie)', () => {
    const { etapeStates } = deriveWorkflowState('CONTROLE_PIECES', 'Pièce manquante');
    expect(etapeStates.DEPOT_DOSSIER).toBe('done');
    expect(etapeStates.CONTROLE_PIECES).toBe('returned');
    expect(etapeStates.TRAITEMENT_TECHNIQUE).toBe('pending');
  });

  it('TRAITEMENT_TECHNIQUE — traitement technique actif', () => {
    const { etapeStates } = deriveWorkflowState('TRAITEMENT_TECHNIQUE');
    expect(etapeStates.DEPOT_DOSSIER).toBe('done');
    expect(etapeStates.CONTROLE_PIECES).toBe('done');
    expect(etapeStates.TRAITEMENT_TECHNIQUE).toBe('active');
    expect(etapeStates.VISA_VALIDATION).toBe('pending');
  });

  it('VISA_VALIDATION — visa/validation actif', () => {
    const { etapeStates } = deriveWorkflowState('VISA_VALIDATION');
    expect(etapeStates.TRAITEMENT_TECHNIQUE).toBe('done');
    expect(etapeStates.VISA_VALIDATION).toBe('active');
    expect(etapeStates.EDITION_LIVRABLE).toBe('pending');
  });

  it('VISA_VALIDATION + motifRejet — refus traité comme un retour (ressaisie unique, aligné AUGURE)', () => {
    const { etapeStates } = deriveWorkflowState('VISA_VALIDATION', 'Devis non conforme');
    expect(etapeStates.VISA_VALIDATION).toBe('returned');
  });

  it('EDITION_LIVRABLE — édition du livrable actif', () => {
    const { etapeStates } = deriveWorkflowState('EDITION_LIVRABLE');
    expect(etapeStates.VISA_VALIDATION).toBe('done');
    expect(etapeStates.EDITION_LIVRABLE).toBe('active');
    expect(etapeStates.ARCHIVAGE).toBe('pending');
  });

  it('ARCHIVAGE — archivage actif', () => {
    const { etapeStates } = deriveWorkflowState('ARCHIVAGE');
    expect(etapeStates.EDITION_LIVRABLE).toBe('done');
    expect(etapeStates.ARCHIVAGE).toBe('active');
  });
});

describe('getActionableEtape', () => {
  it.each([
    [null, null],
    ['DEPOT_DOSSIER', 'DEPOT_DOSSIER'],
    ['CONTROLE_PIECES', 'CONTROLE_PIECES'],
    ['TRAITEMENT_TECHNIQUE', 'TRAITEMENT_TECHNIQUE'],
    ['VISA_VALIDATION', 'VISA_VALIDATION'],
    ['EDITION_LIVRABLE', 'EDITION_LIVRABLE'],
    ['ARCHIVAGE', 'ARCHIVAGE'],
  ] as const)('%s → %s', (etapeCode, expected) => {
    const { etapeStates } = deriveWorkflowState(etapeCode);
    expect(getActionableEtape(etapeStates)).toBe(expected);
  });

  it('circuit terminé (null) → aucune étape actionnable', () => {
    const { etapeStates } = deriveWorkflowState(null);
    expect(getActionableEtape(etapeStates)).toBeNull();
  });
});
