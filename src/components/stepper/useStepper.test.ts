import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepper } from './useStepper';

const STEPS = [
  { id: 'step-1', title: 'Étape 1' },
  { id: 'step-2', title: 'Étape 2' },
  { id: 'step-3', title: 'Étape 3' },
];

/* ================================================================
   useStepper — état initial
   ================================================================ */
describe('useStepper — état initial', () => {
  it("démarre à l'étape 0 par défaut", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    expect(result.current.currentStep).toBe(0);
  });

  it("démarre à l'étape initialStep si fourni", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS, initialStep: 2 }));
    expect(result.current.currentStep).toBe(2);
  });

  it('clamp initialStep hors limite (négatif)', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS, initialStep: -5 }));
    expect(result.current.currentStep).toBe(0);
  });

  it('clamp initialStep hors limite (trop grand)', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS, initialStep: 99 }));
    expect(result.current.currentStep).toBe(STEPS.length - 1);
  });

  it('expose totalSteps correct', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    expect(result.current.totalSteps).toBe(3);
  });

  it("isFirst=true à l'étape 0", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
  });

  it('isLast=true à la dernière étape', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS, initialStep: 2 }));
    expect(result.current.isLast).toBe(true);
    expect(result.current.isFirst).toBe(false);
  });
});

/* ================================================================
   useStepper — navigation
   ================================================================ */
describe('useStepper — navigation', () => {
  it("next() avance d'une étape", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.next());
    expect(result.current.currentStep).toBe(1);
  });

  it('next() ne dépasse pas la dernière étape', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS, initialStep: 2 }));
    act(() => result.current.next());
    expect(result.current.currentStep).toBe(2);
  });

  it("prev() recule d'une étape", () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS, initialStep: 2 }));
    act(() => result.current.prev());
    expect(result.current.currentStep).toBe(1);
  });

  it('prev() ne passe pas avant 0', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.prev());
    expect(result.current.currentStep).toBe(0);
  });

  it('goTo() navigue vers une étape spécifique', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.goTo(2));
    expect(result.current.currentStep).toBe(2);
  });

  it('goTo() clamp valeur négative', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.goTo(-1));
    expect(result.current.currentStep).toBe(0);
  });

  it('goTo() clamp valeur trop grande', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    act(() => result.current.goTo(100));
    expect(result.current.currentStep).toBe(2);
  });
});

/* ================================================================
   useStepper — reset
   ================================================================ */
describe('useStepper — reset', () => {
  it('reset() revient à 0', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS, initialStep: 2 }));
    act(() => result.current.reset());
    expect(result.current.currentStep).toBe(0);
    expect(result.current.isFirst).toBe(true);
  });
});

/* ================================================================
   useStepper — canGoNext
   ================================================================ */
describe('useStepper — canGoNext', () => {
  it('canGoNext=true quand pas à la dernière étape', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS }));
    expect(result.current.canGoNext).toBe(true);
  });

  it('canGoNext=false à la dernière étape', () => {
    const { result } = renderHook(() => useStepper({ steps: STEPS, initialStep: 2 }));
    expect(result.current.canGoNext).toBe(false);
  });
});
