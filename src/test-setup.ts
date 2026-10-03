/**
 * Test environment shims.
 *
 * jsdom does not implement `window.matchMedia`, and GSAP's `matchMedia()` calls
 * it directly. Every section in this app registers breakpoint and
 * reduced-motion behaviour through GSAP, so without this polyfill any test that
 * renders a section throws `TypeError: window.matchMedia is not a function`.
 *
 * Wired via `setupFiles` on the `test` target in angular.json. This is a
 * builder option and works without `runnerConfig` being set.
 */
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string): MediaQueryList => {
      const listeners = new Set<(event: MediaQueryListEvent) => void>();

      return {
        matches: false,
        media: query,
        onchange: null,
        addEventListener: (_type: string, listener: EventListener) =>
          listeners.add(listener as (event: MediaQueryListEvent) => void),
        removeEventListener: (_type: string, listener: EventListener) =>
          listeners.delete(listener as (event: MediaQueryListEvent) => void),
        addListener: (listener: (event: MediaQueryListEvent) => void) =>
          listeners.add(listener),
        removeListener: (listener: (event: MediaQueryListEvent) => void) =>
          listeners.delete(listener),
        dispatchEvent: () => false,
      } as unknown as MediaQueryList;
    },
  });
}