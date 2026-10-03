export const brand = {
  name: 'MARIANA',
  tagline: 'Fresh from the Mediterranean, delivered to your door.',
  // EDIT: replace with the owner's real WhatsApp number, international format, digits only.
  // Falls back to a clearly-marked placeholder until then (brief B2).
  whatsappNumber: '216 90 283 798',
  whatsappNumberIsPlaceholder: true,
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