import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Brief A5: refresh measured triggers once webfonts have settled, otherwise
 * ScrollTrigger caches pre-font metrics and pinned sections drift.
 */
export function refreshWhenFontsReady(): void {
  if (typeof document === 'undefined') return;
  void document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/** A1 / X1. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * A9: parallax and the custom cursor are pointer-driven, so they stay desktop-only.
 *
 * Only `(pointer: fine)` is required. Adding `and (hover: hover)` looks stricter
 * but is not: several desktop configurations report `hover: none` while still
 * having a real mouse (touch-first laptops, some VMs and remote desktop), and
 * requiring it silently disabled the custom cursor entirely.
 */
export function hasFinePointer(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: fine)').matches;
}

/**
 * Scoped GSAP context for a component. Everything created inside the callback is
 * reverted on destroy — satisfies A3 (scope + revert) and A4 (no duplicated
 * triggers, no leaked listeners across route changes and StrictMode-style
 * double mounts).
 */
export function inContext(
  host: Element,
  setup: () => void | (() => void),
): () => void {
  const ctx = gsap.context(setup, host);
  return () => ctx.revert();
}

/** Register teardown alongside an Angular `DestroyRef`. */
export function onDestroy(register: () => void, destroyRef: { onDestroy: (fn: () => void) => void }): void {
  destroyRef.onDestroy(register);
}

/**
 * A9: register a listener without a manual unsubscribe — GSAP's context already
 * reverts `ctx.add()`ed listeners on revert, and this keeps components honest.
 */
export function listen<T extends Event>(
  target: EventTarget,
  type: string,
  handler: (event: T) => void,
  options?: AddEventListenerOptions,
): void {
  target.addEventListener(type, handler as EventListener, options);
}

export const ctx = gsap.context;