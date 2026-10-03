/**
 * Brief C2: all copy lives here.
 *
 * C3 / H12: anything we could not verify is marked `// EDIT:`. No founding
 * year, no certification, no boat name, no awards. Placeholder text stays
 * plausible and visibly provisional.
 */

export const nav = {
  menu: 'Menu',
  close: 'Close',
  shop: 'Shop',
  about: 'About',
  cart: 'Cart',
  skipToContent: 'Skip to content',
} as const;

export const hero = {
  // S2: stacked, left-weighted, *FROM* indented and italic.
  lines: ['Fresh', 'From', 'the sea'],
  italicIndex: 1,
  labelTop: ['Mediterranean', 'Catch 001'],
  labelRight: 'Fresh today',
  scrollCue: 'Scroll to explore',
  fishId: 'sea-bass',
} as const;

export const explorer = {
  heading: ['Explore', 'the catch'],
  // S5: counter reflects real position, not a decorative constant.
  counterPrefix: 'Catch',
  progressLabel: 'Position in the catch',
} as const;

export const freshToday = {
  heading: ['Fresh', 'Today'],
  empty: 'Nothing on ice right now. Check back after the morning landing.',
  add: 'Add to cart',
  soldOut: 'Gone for today',
} as const;

export const story = {
  heading: ['From the sea', 'to your table.'],
  // EDIT: replace with the owner's real story. Currently placeholder.
  body: [
    'The boat comes in before the light does. By the time the city wakes up we have already sorted the day: what came over the rails whole, what needs cleaning before noon, and what we are keeping for ourselves.',
    'I buy from the same two boats I have bought from for years. They fish the way this coast has always fished — close in, out again before the heat — and the catch is small because the sea is small. That is the whole argument.',
    'A sea bass with firm, glassy flesh. A mullet small enough to eat with your hands. Sardines that are gone by ten in the morning and not worth apologising for.',
    'We cut to order, we weigh honestly, and we tell you where it came from. If something is not good enough we say so and we do not put it in the box.',
  ],
  plates: ['The quay, first light', 'Sorting the day catch'],
} as const;

export const mediterranean = {
  words: ['Taste', 'the', 'Mediterranean.'],
  body: 'Shallow water, short nights, and fish that has never travelled further than a few kilometres from the net to your ice.',
} as const;

export const finalCta = {
  heading: ['Order', 'fresh.'],
  body: 'Send your order through WhatsApp. We confirm weight, cut and a delivery window, then it lands the same morning.',
  button: 'Order on WhatsApp',
  opensInNewTab: 'Opens WhatsApp in a new tab',
} as const;

export const cart = {
  title: 'Your catch',
  empty: 'No fish yet. Pick something from the catch above.',
  emptyAction: 'Browse the catch',
  total: 'Total',
  remove: 'Remove',
  close: 'Close cart',
  notesLabel: 'Delivery notes',
  notesPlaceholder: 'Gate, floor, when to come by',
  nameLabel: 'Name',
  phoneLabel: 'Phone',
  checkout: 'Send order on WhatsApp',
  estimated: 'Estimated total',
} as const;

export const shop = {
  heading: ['The whole', 'catch.'],
  body: 'Everything on ice today, and everything we expect this week.',
  filterAll: 'All',
  filterFresh: 'Fresh today',
  filterOnOrder: 'On order',
} as const;

export const footer = {
  // EDIT: placeholder contact details.
  line: 'Fishmongers since before we had a logo.',
  contactLabel: 'Find us',
  hoursLabel: 'When we are open',
  deliveryLabel: 'Where we deliver',
  rights: 'All rights reserved.',
} as const;

export const copy = {
  nav,
  hero,
  explorer,
  freshToday,
  story,
  mediterranean,
  finalCta,
  cart,
  shop,
  footer,
};