export const brand = {
  name: 'MARIANA',
  tagline: 'Fresh from the Mediterranean, delivered to your door.',
  // Owner-confirmed on 2026-10-03, international format. Spaces are stripped by
  // `whatsappUrl()`, so they are kept here for legibility.
  whatsappNumber: '216 90 283 798',
  whatsappNumberIsPlaceholder: false,
  city: 'Djerba',
  currency: 'TND',
  locale: 'fr-TN',
} as const;

export const openingHours = [
  { day: 'Tuesday — Friday', hours: '07:00 — 13:00' },
  { day: 'Saturday', hours: '06:30 — 14:00' },
  { day: 'Sunday', hours: 'Closed — we are on the boat' },
] as const;

export const deliveryZones = ['Tunis centre', 'La Marsa', 'Carthage', 'Sidi Bou Said'] as const;