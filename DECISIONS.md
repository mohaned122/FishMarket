# DECISIONS

One line each, per the brief's decision policy. Anything marked `// EDIT:` in
`src/app/core/data/` is placeholder copy awaiting the owner.

## Stack translation (the brief specifies React; this repo is Angular)

1. The `todo` brief mandates Vite + React (`H1`). The repository is Angular 21
   standalone with signals, so every stack rule was translated rather than
   followed literally: `react-router-dom` -> `@angular/router`, `@gsap/react`/`useGSAP`
   -> plain `gsap.context()`, `React.lazy` -> the router's own lazy loading,
   `React.StrictMode` double-mount safety -> `gsap.context().revert()` on `DestroyRef`.
   The brief's *design* rules were kept verbatim.
2. The brief's `tailwind.config` (`H4`) became an `@theme` block in
   `src/styles.css`. Tailwind v4 is CSS-first; there is deliberately no
   `tailwind.config.js` in this project.
3. `lucide-react` is not installed, so icons are inline SVG or typographic
   characters. `H2` forbids adding anything without an entry here, so nothing
   was added.
4. `VITE_WHATSAPP_NUMBER` -> `brand.whatsappNumber` in `core/data/brand.ts`, with
   `whatsappNumberIsPlaceholder: true` so the UI can say so out loud.
5. `src/data/brand.js` -> `core/data/brand.ts`. Changing `brand.name` rebrands the site.

## Assets

6. The five supplied PNGs were mapped to species **by pixel tone only**, because
   the owner could not describe them to the agent: silvers -> Sea Bass, orange ->
   Salmon, warm pink -> Red Mullet, dense greyscale portrait -> Tuna, sparse
   greyscale -> Sardines. Gilt-head Bream is deliberately left without an image so
   the `FishImage` SVG fallback is exercised in production. Re-map by editing
   `image` in `core/data/fish.ts` only.
7. PNG rather than the brief's WebP/AVIF: no image encoder exists in this
   environment. Files are 84-156 KB against a 160 KB target, so they are close to
   budget. Inventory in `public/fish/ASSETS.md`.

## Repo-specific engineering

8. `@import "tailwindcss" source(none)` plus an explicit `@source "./**/*.{ts,html}"`.
   Tailwind's automatic content detection scans every file git does not ignore,
   including the root `todo` brief, which contains the literal text `bg-[url(...)]`.
   Tailwind then treats `url(...)` as an arbitrary value and tries to import a
   module named `...`, failing the whole build.
9. `src/test-setup.ts` polyfills `window.matchMedia`, wired through `setupFiles`
   on the test target. jsdom does not implement it and GSAP's `matchMedia()` calls
   it directly, so any test rendering a section threw a `TypeError`.
10. The `initial` bundle budget was raised from 500 kB/1 MB to 1.5 MB/2 MB at the
    owner's direction. The bundle is 1.12 MB raw / ~301 kB transfer, almost all of
    it Firebase: eight services are eagerly registered in `app.config.ts` and none
    of them are read by this static site. **The real fix is to defer those
    providers**, not the budget.
11. Removed the unreferenced `src/app/admin`, `src/app/order` and `src/app/home`
    CLI stubs. They were empty boilerplate, never routed, and `pages/home` now
    supersedes the third.

## Brief conflicts, and how they were resolved

12. `D3` says format prices with `Intl.NumberFormat("fr-TN")`; the example in
    `S17` shows `31.80 TND`. `fr-TN` renders a comma, so output is `31,80 TND`.
    Followed `D3` because it names the mechanism and `S17` only sketches the shape.
    Change the locale in `formatPrice` if the dot is wanted.
13. `S9` says Fresh Today lists "only fish with `availability === 'fresh-today'`"
    but also that sold-out items appear struck through. Both are honoured: the main
    list is derived from availability, and sold-out fish sit below it, struck
    through at low opacity.
14. Product weight selection defaults to the **first** entry in `weights` (500 g).
    `red-mullet` has `250 g` available; nothing selects a non-default weight yet.

## Changed at the owner's request

15. **The Cut Selector section is removed** (`S5` in the brief described a salmon
    cut diagram the owner does not want). `src/app/sections/cut-selector/` and
    `copy.cutSelector` are deleted. `core/data/cuts.ts` is kept: it is data the
    brief asks for and is currently unreferenced.
16. **All scrollbars are suppressed** at the owner's request, via
    `scrollbar-width: none` on the universal selector and a zeroed
    `::-webkit-scrollbar`. This removes the scrollbar affordance from the page,
    the explorer track, the cart and the quick-add sheet; the explorer keeps its
    progress rule and `01 / 06` counter as the substitute cue.
17. **The custom cursor is an uncovering lens.** `mix-blend-exclusion` over an
    `ocean` fill, so it negates whatever it passes over — navy becomes sea-teal,
    cream becomes rust, photography becomes a photographic negative. A wider
    "wake" ring trails it on a slower follow, which is what makes it read as
    water rather than as a dot. Timings live in `core/motion/motion.ts` under
    `cursor`.
18. The cursor's visibility is set from JS only, and `hasFinePointer()` tests
    `(pointer: fine)` alone. It previously also required `hover: hover`, which is
    reported as `none` by touch-first laptops and some VMs even when a mouse is
    attached, so the cursor silently never mounted.
19. The explorer panel stagger is `3vh` (was `6vh`) and the fish is sized
    `min(34vw, 28vh, 24rem)` (was `min(38vw, 26rem)`) so a panel can never grow
    taller than the pinned viewport and get clipped by `overflow: hidden`.
20. The pinned distance is measured from the last panel's right edge rather than
    the track's `scrollWidth`, and is floored at `track.minPinDistance`. The
    previous `scrollWidth` reading is the value most likely to be captured before
    the display serif swaps in, which is what made the section appear to vanish
    early.
21. Fresh Today's top padding is `pt-6 md:pt-8`, down from `py-24 md:py-36`. The
    owner asked four times for the gap below the explorer to be shorter. The
    larger part of that gap was *not* padding: the stage is exactly `100svh` and
    the fish is `flex-1` with a `max-height` cap, so the leftover is a thin band
    around the fish rather than a large pad under it.
22. The pin lasts longer via two levers, both purely about duration and neither of
    which breaks the scrub mapping: `md:gap-[26vw]` widens the track, and
    `track.pinPadding: 0.35` adds 35% to the measured overflow.
    `track.minPinDistance: 3200` is the floor. Scaling distance *beyond* the real
    overflow was rejected: the track is translated by exactly that distance, so
    any extra slides the last fish off the right edge.
23. `headingRate` is `0.18` (was `0.35`). With a longer ride the old rate pushed
    the heading off screen almost immediately.
24. **The explorer's empty stage was a sizing bug, not a spacing one.** GSAP
    translates the track element itself, and the track was `w-full` — a box
    exactly one viewport wide. Translating that box ~3000px to the left moved
    its own box off screen, leaving bare navy; the only way to reach the
    remaining catch was to scroll the box sideways by hand. The track is now
    `md:w-max` (as wide as its content), so translating it by exactly its
    overflow keeps it covering the screen while the panels travel through.
25. For the same reason `track.minPinDistance` is a 600px pathology floor and
    nothing more. Because the track is translated by exactly the measured
    distance, inflating it (the previous version multiplied real overflow by
    1.35 with a 3200 floor) pushes the last fish off the left edge and exposes
    background at the right. Duration comes from `md:gap-[30vw]`, which widens
    the track legitimately, never from over-shooting the measurement.
26. The track is `md:snap-none`. CSS scroll snapping was active on desktop
    alongside the GSAP transform, so the browser kept yanking the box back to
    panel boundaries and fighting the scrub. Snapping is for the mobile carousel.
27. `track.scrub` is `0.3` (was `0.6`). At 0.6 the panels lagged half a second
    behind the wheel and it read as the track being disconnected from scroll.
28. `motion-reduce:` on the stage and track is a real fallback, not decoration.
    Brief X1 forbids pinning under reduced motion, and with no pin the reserved
    viewport would leave an empty field. Reduced motion collapses the stage to
    content height and wraps the panels so every fish is visible at once.
29. **Deployment is static Firebase Hosting, not an SSR function.** All three
    routes carry `RenderMode.Prerender`, and the build emits a real HTML document
    for each one (`index.html`, `shop/index.html`, `story/index.html`), so there
    is nothing left for a runtime to render. Serving `dist/9sharti/browser`
    directly avoids provisioning a Cloud Function and a Node runtime for a site
    whose every route is already static. Consequence: a new route must be
    prerendered or it will 404 — there is no SSR fallback behind the CDN.
30. `firebase.json` had no `hosting` target at all, which is why this build was
    not deployable as configured. Added `public: dist/9sharti/browser`,
    `cleanUrls`, and a hosting emulator on :5000.
31. **Cache-Control rule order is load-bearing.** The `**` baseline sets
    `no-cache` for everything and the hashed-asset rules *after* it override with
    `immutable`. The first attempt led with a `**/*.@(html)` rule, which can never
    match anything: with `cleanUrls` the request paths are `/`, `/shop` and
    `/story`, none of which end in `.html`. Every document therefore fell through
    to Firebase's own `max-age=3600`, so deploys stayed invisible for up to an
    hour. Verified: HTML `no-cache`, `main-*.js` / `styles-*.css`
    `max-age=31536000, immutable`, images `max-age=604800`.
32. Deployed with `--only hosting` semantics in mind: `firestore.rules` is
    `allow read, write` for anyone and must not be pushed to a live site. Tighten
    the rules before deploying them.

## Known gaps — not claimed as done

- **Page transitions (`A11`, `S4.4`) are not implemented.** Routes change
  instantly. This is the most conspicuous remaining brief requirement.
- **No photography** for the Story plates or the four Mediterranean depth planes;
  they are colour planes and inline SVG. Listed in `public/fish/ASSETS.md`.
- **No Lighthouse run.** `P1` targets are unverified, and the 1.12 MB initial
  bundle makes the performance target unlikely until Firebase is deferred.
- **No visual review.** The agent has no image input, so nothing was screenshotted.
  Layout, the pinned horizontal scroll, the hero timeline and the cursor are
  verified only insofar as the build prerenders all three routes.
- The WhatsApp number is the placeholder `21600000000`; ordering cannot complete
  until it is replaced.