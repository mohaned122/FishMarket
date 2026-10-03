/**
 * Brief §4: the ONLY allowed eases and durations. Import these; never inline
 * a duration or ease anywhere else in the codebase.
 *
 * A1: slow, weighted, "like water". No elastic / back / bounce.
 */
export const ease = {
  /** Type entrances, fish entrances. */
  reveal: 'expo.out',
  /** Route transitions, drawer. */
  travel: 'power3.inOut',
  /** Hovers. */
  settle: 'power2.out',
  /** Scrubbed scroll only. */
  linear: 'none',
} as const;

export const duration = {
  micro: 0.35,
  base: 0.8,
  slow: 1.4,
  epic: 2.2,
} as const;

/** §4.1 hero entrance — one master timeline, ~3.2 s. */
export const heroCue = {
  plane: 0.0,
  circle: 0.3,
  headline: 0.55,
  fish: 1.05,
  shadow: 1.4,
  lineArt: 1.7,
  labels: 2.0,
  header: 2.4,
  total: 3.2,
  lineStagger: 0.12,
  charStagger: 0.02,
} as const;

/** A9 / §4.2 mouse parallax — max displacement per layer. */
export const parallax = {
  fish: { x: 24, y: 14, rotate: 1.5 },
  circle: { x: 10, y: 10, rotate: 0 },
  headline: { x: 5, y: 5, rotate: 0 },
  background: { x: 1, y: 1, rotate: 0 },
  followDuration: 0.9,
} as const;

/** S4 hero scroll behaviour. */
export const heroScroll = {
  fishScaleTo: 1.08,
  circleScaleTo: 1.15,
  fishYPercent: -18,
  headlineYPercent: 12,
} as const;

/** S5 horizontal track. */
export const track = {
  /**
   * Small, not a float. At 0.6 the panels lagged half a second behind the scroll
   * and it read as the track not being connected to the wheel.
   */
  scrub: 0.3,
  /** S5: the heading drifts away slower than the track travels. */
  headingRate: 0.18,
  containerParallax: 60,
  /**
   * Pathology floor only, in px — it keeps the pin from collapsing if the panels
   * somehow measure narrower than the viewport.
   *
   * There is deliberately no way to make the ride longer by inflating this. The
   * track is translated by exactly this distance and the track is only as wide as
   * its own content (`md:w-max`), so any distance beyond the real overflow slides
   * the last fish off the left edge and leaves bare background at the right. A
   * previous version multiplied the measured overflow by 1.35 with a 3200 floor;
   * that over-shot by ~350px and was the cause of the "empty" section. A longer
   * ride has to come from a wider gap between panels instead.
   */
  minPinDistance: 600,
} as const;

/** S14 Mediterranean depth layers — 4 planes at distinct speeds. */
export const mediterraneanLayers = [
  { id: 'sea', speed: 0.15 },
  { id: 'coast', speed: 0.3 },
  { id: 'boat', speed: 0.5 },
  { id: 'sun', speed: 0.7 },
] as const;

/**
 * S18 custom cursor - one soft circle, nothing else.
 *
 * The first build of this had a text label and a second trailing "wake" ring on a
 * slower ease. The owner called both of them wrong: the label was clutter, and the
 * lag between two elements read as the cursor being slow rather than as water.
 * Both are gone, so what is left is a single element on a tight follow.
 *
 * The circle is `mix-blend-difference` against white, so it darkens on cream and
 * coral and lightens on navy - one rule, all five section backgrounds. The soft
 * edge is a radial gradient rather than `filter: blur`, which the brief forbids
 * animating and which would be the most expensive thing on the page.
 */
export const cursor = {
  /**
   * Follow. Short on purpose: at 0.9 the circle trailed the pointer by a visible
   * distance and was described as sluggish. This is quickSetter smoothing, not a
   * transition, so a fast flick still lands on the pointer.
   */
  followDuration: 0.12,
  /** Growth over an interactive target. The only per-mode behaviour left. */
  scaleInteractive: 1.45,
  /** Growth over photography, so it reads as a lens rather than a dot. */
  scaleMedia: 2.4,
} as const;

/** S13 story clip-path reveal. */
export const storyReveal = {
  from: 'inset(100% 0 0 0)',
  to: 'inset(0% 0 0 0)',
  innerScaleFrom: 1.15,
} as const;

/** A11 page transition budget. */
export const pageTransition = { total: 1.1 } as const;

export type EaseName = keyof typeof ease;
export type DurationName = keyof typeof duration;