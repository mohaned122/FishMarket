# AGENTS.md — 9sharti

Angular 21 standalone + SSR fish-market e-commerce site. Tailwind v4 (CSS-first),
GSAP + ScrollTrigger, Firebase wired but unused. **No `zone.js` — the app is
zoneless, so state must be signals to trigger change detection.**

## Read this first

`todo` (root, no extension) is the authoritative **design brief** — brand palette,
type scale, imagery specs, motion rules, self-audit. Read it before designing.

But it specifies **Vite + React**, which this repo is not. Its stack rules are
already translated; its design rules apply verbatim. Quick map:

| Brief says | This repo |
| --- | --- |
| Vite / React / `react-dom` | Angular 21 standalone, signals, control flow |
| `react-router-dom` | `@angular/router` |
| `@gsap/react`, `useGSAP()` | `gsap.context()` + `DestroyRef.onDestroy` |
| `React.lazy`, `React.StrictMode` | router lazy loading; `ctx.revert()` on destroy |
| `lucide-react` icons | inline SVG / typographic glyphs (not installed) |
| `tailwind.config` (`theme.extend`) | `@theme { }` block in `src/styles.css` |
| `src/data/*.js` | `src/app/core/data/*.ts` |
| `npm run dev` | `npm start` |

## Commands

| Task | Command |
| --- | --- |
| Dev server (:4200, dev config) | `npm start` |
| Production build (SSR + prerender) | `npm run build` |
| Tests (Vitest + jsdom) | `npm test -- --watch=false` |
| One suite | `npx ng test --watch=false --filter="^Cart"` |
| One spec file | `npx ng test --watch=false --include=src/app/core/cart/cart.spec.ts` |
| Serve SSR output | `npm run build && npm run serve:ssr:9sharti` (PORT or 4000) |

- **No lint exists** — no script, no ESLint config, no CI. Verify with
  `npm run build` (typechecks, `strictTemplates`) then the test command.
- `npm test` **watches by default in a TTY**. Always pass `--watch=false` or it hangs.
- `ng test` auto-detects `tsconfig.spec.json` (`vitest/globals`, no imports needed).
- `angular.json` sets no `runnerConfig`, so a `vitest.config.ts` you add is
  **silently ignored**. Set `"runnerConfig": true` on the test target to enable it.
- Prettier config lives in `package.json` (printWidth 100, single quotes, `angular`
  parser for `.html`). `.editorconfig`: 2-space indent, single quotes in TS.

## Architecture

```
src/app/
  core/data/      brand, fish, cuts, copy, whatsapp   (single source of truth)
  core/cart/      CartService (signals + localStorage), message builder + spec
  core/motion/    motion.ts (the ONLY eases/durations), gsap.ts (helpers)
  layout/         header, footer, cart-drawer
  sections/       hero, fish-explorer, fresh-today,
                  story-section, mediterranean, final-cta
  shared/         fish-image, line-art, cursor, grain
  pages/          home, shop, story
```

- **UI renders only from `core/data`.** No component hard-codes a price, a species
  or an image filename. Re-map photos in `core/data/fish.ts` only.
- `ease` and `duration` in `core/motion/motion.ts` are the only allowed timing
  values. Never inline a duration or ease.
- Every GSAP animation lives in a `gsap.context()` scoped to the host element and
  is reverted on destroy. Raw `ScrollTrigger.create` is only used where noted.
- Breakpoint and reduced-motion behaviour goes through `gsap.matchMedia`, never
  `window.innerWidth` checks.

## Gotchas that will bite you

- **`@import "tailwindcss" source(none)` in `src/styles.css` is load-bearing.**
  Tailwind's automatic content detection scans every file git does not ignore,
  including the `todo` brief, which contains the literal text `bg-[url(...)]`.
  Tailwind parses that as an arbitrary background value and tries to resolve a
  module named `...`, failing the entire build with a confusing CSS error. Do not
  remove the `source(none)` + explicit `@source`.
- **jsdom has no `window.matchMedia`.** `src/test-setup.ts` polyfills it and is
  wired via `setupFiles`. GSAP's `matchMedia()` calls it directly, so without the
  polyfill every test that renders a section throws.
- **`viewChild` is singular.** Repeated template refs (`#line` inside a loop) need
  `viewChildren`, which returns a signal to an array and has **no `.required`**.
- **A pinned ScrollTrigger must be refreshed after fonts settle.** The explorer
  measures panel geometry to decide how long to pin; read against fallback font
  metrics the distance comes out far too short and the section appears to vanish
  early. Call `refreshWhenFontsReady()` (and refresh again once images decode) in
  any component that pins.
- **Never gate one element's visibility in two places.** The custom cursor is
  shown and hidden purely from JS, because a `lg:block` utility and a JS pointer
  check are separate sources of truth that disagree: the gate passes while the
  stylesheet still says `display: none`.
- **Only `public/` is served.** `angular.json` globs `public` for assets, and
  `src/assets/` exists but is **not** in the build. Fish photos live in
  `public/fish/`.
- `src/app/app.config.ts` registers `initializeApp`, `provideAuth`,
  `provideFirestore` and `provideDatabase` **twice**, and hardcodes the Firebase
  config inline rather than reading the environment (the README's env-file advice
  is aspirational). Nothing in the site currently reads Firebase; the initial
  bundle is 1.12 MB almost entirely because of it.
- Routes are **prerendered** (`app.routes.server.ts`, `RenderMode.Prerender` on
  `**`). Any page needing request-time data must get a different `RenderMode` or
  the build fails. Guard `window`/`localStorage` with `isPlatformBrowser`.
- `CartService` persists in `effect()` and reads `localStorage` only after
  `_hydrated()` flips, so SSR never touches storage.
- Custom `--breakpoint-*` values in `@theme` are tree-shaken until a template
  actually uses them; `--breakpoint-tablet` is absent from the output today.
- Budgets are enforced and fail the build: `initial` 1.5 MB warning / 2 MB error,
  `anyComponentStyle` 4 kB / 8 kB. `app.css` must stay near-empty — component
  styles are budgeted, `styles.css` is not.

## Firebase

- `.firebaserc` default project is `ayoubbahar`. `firebase-tools` is **not**
  installed; emulator and deploy commands need `npx firebase-tools`.
- `firebase.json` declares the Data Connect emulator and Firestore rules/indexes
  but **no hosting or functions target**, so the SSR build is not deployable as
  configured.
- `firestore.rules` is wide open — `allow read, write` for anyone — and expires
  **2026-11-02**. Tighten it before then.
- Data Connect ids must stay in sync across `app.config.ts` (`getDataConnect`),
  `dataconnect/dataconnect.yaml` and `dataconnect/example/connector.yaml`:
  connector `example`, service `9sharti`, location `us-east4`. The generated SDK
  target `src/dataconnect-generated` does not exist yet.

## Design rules worth keeping

These are the ones most likely to be broken by a well-meaning edit:

- Radius is **0** everywhere; the circle is the only round motif (`circle` utility).
- One dominant colour per section, max three visible at once. The per-section
  assignments are a table in the brief — do not improvise.
- GSAP is the only animation engine. Animate only `x, y, xPercent, yPercent,
  scale, rotation, opacity, clipPath`. Never `width`, `height`, `top`, `left`,
  `margin`, `padding`, `font-size`, `box-shadow`, or `filter: blur`.
- No `will-change` in CSS. No decorative gradients, glassmorphism, or shadow-heavy UI.
- Set animation initial states from GSAP, never CSS `opacity-0`, so the page
  still works if JS fails.
- `prefers-reduced-motion` must remove pinning, parallax and splitting animation.

## Still missing

See `DECISIONS.md` for the full list. The two that matter most:

- **Page transitions (`A11`) are not implemented** — routes change instantly.
- **No photography** for the Story plates or Mediterranean depth planes; they are
  colour planes and inline SVG. Inventory and gaps in `public/fish/ASSETS.md`.

Never claim a check passed unless you ran it. This environment cannot screenshot,
so visual review is manual.