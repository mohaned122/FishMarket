/**
 * Brief D2 — `cuts.js`. Ordered segments of the salmon, head to tail.
 * The fillet itself is inline SVG (brief S10), so no photograph is needed
 * for this section.
 */

export interface Cut {
  id: string;
  label: string;
  /** Percentage of the fillet length this segment occupies, 0-100. */
  span: number;
  price: number;
  suggestion: string;
  weightHint: string;
}

export const cuts: readonly Cut[] = [
  {
    id: 'head',
    label: 'Head',
    span: 18,
    price: 6.5,
    suggestion: 'For the broth. Rich and bony.',
    weightHint: '≈ 200 g',
  },
  {
    id: 'center',
    label: 'Center cut',
    span: 34,
    price: 14.5,
    suggestion: 'Perfect for grilling.',
    weightHint: '≈ 400 g',
  },
  {
    id: 'fillet',
    label: 'Fillet',
    span: 30,
    price: 19.0,
    suggestion: 'The cleanest slice, no bones.',
    weightHint: '≈ 350 g',
  },
  {
    id: 'tail',
    label: 'Tail',
    span: 18,
    price: 9.0,
    suggestion: 'Cured, or fried crisp.',
    weightHint: '≈ 200 g',
  },
];

/** Cumulative [start, end] percentages, head to tail, for the SVG overlays. */
export function cutSegments(): { cut: Cut; start: number; end: number }[] {
  let cursor = 0;
  return cuts.map((cut) => {
    const start = cursor;
    cursor += cut.span;
    return { cut, start, end: cursor };
  });
}