/**
 * Brief D2. UI renders only from this data.
 *
 * `image` points at a file in `public/fish/`. When the file is absent,
 * `FishImage` renders its inline-SVG fallback instead — so a missing asset
 * never breaks a build. See `public/fish/ASSETS.md` for what is real and
 * what is still a placeholder.
 */

export type Availability = 'fresh-today' | 'on-order' | 'sold-out';

export interface Fish {
  id: string;
  name: string;
  latin: string;
  pricePerKg: number;
  unit: 'kg';
  origin: string;
  availability: Availability;
  catchNo: string;
  /** Filename inside `public/fish/`, or null to force the SVG fallback. */
  image: string | null;
  /** Accent used for this product's editorial object (brief S6). */
  accent: 'turquoise' | 'peach' | 'coral' | 'ocean' | 'sand';
  note: string;
  preparations: readonly string[];
  weights: readonly number[];
  /** Panel width in the horizontal track; alternates so no two panels match (S6). */
  panelWidth: 'narrow' | 'wide' | 'tall';
  /** Vertical alignment inside the pinned track (S6). */
  align: 'top' | 'center' | 'bottom';
}

export const fish: readonly Fish[] = [
  {
    id: 'sea-bass',
    name: 'Sea Bass',
    latin: 'Dicentrarchus labrax',
    pricePerKg: 18.9,
    unit: 'kg',
    origin: 'Mediterranean',
    availability: 'fresh-today',
    catchNo: '001',
    image: 'seabass.png',
    accent: 'turquoise',
    note: 'Landed this morning. Firm, glassy flesh.',
    preparations: ['Whole', 'Cleaned', 'Filleted'],
    weights: [500, 1000, 2000],
    panelWidth: 'wide',
    align: 'center',
  },
  {
    id: 'gilt-head-bream',
    name: 'Gilt-head Bream',
    latin: 'Sparus aurata',
    pricePerKg: 16.5,
    unit: 'kg',
    origin: 'Mediterranean',
    availability: 'fresh-today',
    catchNo: '002',
    // No photograph supplied yet — renders the SVG silhouette (brief I4).
    image: null,
    accent: 'peach',
    note: 'Golden skin, sweet and fine-grained.',
    preparations: ['Whole', 'Cleaned', 'Filleted'],
    weights: [500, 1000, 2000],
    panelWidth: 'narrow',
    align: 'top',
  },
  {
    id: 'salmon',
    name: 'Salmon',
    latin: 'Salmo salar',
    pricePerKg: 24.0,
    unit: 'kg',
    origin: 'North Atlantic',
    availability: 'on-order',
    catchNo: '003',
    image: 'salmon.png',
    accent: 'coral',
    note: 'Ordered Thursday, on ice by Saturday.',
    preparations: ['Whole', 'Steaks', 'Filleted'],
    weights: [500, 1000, 1500],
    panelWidth: 'tall',
    align: 'bottom',
  },
  {
    id: 'red-mullet',
    name: 'Red Mullet',
    latin: 'Mullus surmuletus',
    pricePerKg: 14.5,
    unit: 'kg',
    origin: 'Mediterranean',
    availability: 'fresh-today',
    catchNo: '004',
    image: 'red-mullet.png',
    accent: 'coral',
    note: 'Small, bright, best eaten whole.',
    preparations: ['Whole', 'Cleaned'],
    weights: [250, 500, 1000],
    panelWidth: 'narrow',
    align: 'center',
  },
  {
    id: 'sardines',
    name: 'Sardines',
    latin: 'Sardina pilchardus',
    pricePerKg: 7.0,
    unit: 'kg',
    origin: 'Mediterranean',
    availability: 'sold-out',
    catchNo: '005',
    image: 'sardines.png',
    accent: 'ocean',
    note: 'Gone by ten. Next landing Monday.',
    preparations: ['Whole', 'Cleaned'],
    weights: [500, 1000],
    panelWidth: 'wide',
    align: 'top',
  },
  {
    id: 'tuna',
    name: 'Tuna',
    latin: 'Thunnus thynnus',
    pricePerKg: 29.5,
    unit: 'kg',
    origin: 'Mediterranean',
    availability: 'on-order',
    catchNo: '006',
    image: 'tuna.png',
    accent: 'ocean',
    note: 'Cut from the loin. Deep colour, clean flavour.',
    preparations: ['Steaks', 'Filleted'],
    weights: [500, 1000, 2000],
    panelWidth: 'tall',
    align: 'center',
  },
];

export function fishById(id: string): Fish | undefined {
  return fish.find((item) => item.id === id);
}

/** Brief D4: "Fresh today" is derived, never hard-coded. */
export function isFreshToday(item: Fish): boolean {
  return item.availability === 'fresh-today';
}

export function freshToday(): readonly Fish[] {
  return fish.filter(isFreshToday);
}

export const availabilityLabel: Record<Availability, string> = {
  'fresh-today': 'Fresh today',
  'on-order': 'On order',
  'sold-out': 'Sold out',
};