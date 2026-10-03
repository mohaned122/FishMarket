import { describe, expect, it } from 'vitest';

import { formatWeight, linePrice, formatPrice } from './cart.service';
import { buildOrderMessage, messageFromCart, whatsappUrl } from '../data/whatsapp';
import { brand } from '../data/brand';

const customer = { name: 'Amira', phone: '+216 20 000 000', notes: '' };

describe('formatWeight (brief S17)', () => {
  it('formats whole kilograms', () => {
    expect(formatWeight(1000)).toBe('1kg');
    expect(formatWeight(2000)).toBe('2kg');
  });

  it('formats sub-kilo weights in grams', () => {
    expect(formatWeight(500)).toBe('500g');
    expect(formatWeight(250)).toBe('250g');
  });

  it('formats fractional kilograms with one decimal', () => {
    expect(formatWeight(1500)).toBe('1.5kg');
  });
});

describe('linePrice (brief D3)', () => {
  it('is pricePerKg multiplied by grams over 1000, to 2 decimals', () => {
    expect(linePrice(18.9, 1000)).toBe(18.9);
    expect(linePrice(18.9, 500)).toBe(9.45);
    expect(linePrice(24, 1500)).toBe(36);
  });

  it('rounds to 2 decimals rather than floating point noise', () => {
    expect(linePrice(16.5, 750)).toBe(12.38);
    expect(linePrice(7, 333)).toBe(2.33);
  });
});

describe('formatPrice', () => {
  it('uses the brand locale and appends the currency', () => {
    expect(formatPrice(31.8)).toContain('TND');
    expect(formatPrice(31.8)).toMatch(/31[.,]80/);
  });
});

describe('buildOrderMessage (brief S17)', () => {
  const lines = [
    { name: 'Sea Bass', grams: 1000, preparation: 'Cleaned', price: 18.9 },
    { name: 'Salmon', grams: 500, preparation: 'Steaks', price: 12 },
  ];

  it('opens with the greeting and the order statement', () => {
    const message = buildOrderMessage(lines, customer, 30.9);
    expect(message.startsWith('Hello,')).toBe(true);
    expect(message).toContain('I would like to order:');
  });

  it('lists each line with its own preparation', () => {
    const message = buildOrderMessage(lines, customer, 30.9);
    expect(message).toContain('1kg Sea Bass — Cleaned');
    expect(message).toContain('500g Salmon — Steaks');
  });

  it('includes name, phone and the estimated total', () => {
    const message = buildOrderMessage(lines, customer, 30.9);
    expect(message).toContain('Name: Amira');
    expect(message).toContain('Phone: +216 20 000 000');
    expect(message).toContain('Estimated total:');
    expect(message).toContain('TND');
  });

  it('omits the notes block when notes are empty', () => {
    const message = buildOrderMessage(lines, customer, 30.9);
    expect(message).not.toContain('Delivery notes');
  });

  it('includes the notes block when notes are present, trimmed', () => {
    const message = buildOrderMessage(
      lines,
      { ...customer, notes: '  Third floor, no buzzer  ' },
      30.9,
    );
    expect(message).toContain('Delivery notes: Third floor, no buzzer');
  });

  it('falls back to a dash for missing contact details', () => {
    const message = buildOrderMessage(lines, { name: '', phone: '', notes: '' }, 30.9);
    expect(message).toContain('Name: —');
    expect(message).toContain('Phone: —');
  });

  it('ends with the thank you line', () => {
    expect(buildOrderMessage(lines, customer, 30.9).trimEnd().endsWith('Thank you.')).toBe(true);
  });
});

describe('messageFromCart', () => {
  it('resolves fish records, sums the total and skips unknown ids', () => {
    const message = messageFromCart(
      [
        { fishId: 'sea-bass', grams: 1000, preparation: 'Whole' },
        { fishId: 'not-a-fish', grams: 500, preparation: 'Whole' },
        { fishId: 'red-mullet', grams: 500, preparation: 'Cleaned' },
      ],
      customer,
    );
    expect(message).toContain('1kg Sea Bass — Whole');
    expect(message).not.toContain('not-a-fish');
    // Sea Bass 18.90 + Red Mullet 7.25
    expect(message).toMatch(/26[.,]15/);
  });

  it('produces a message with no order lines for an empty cart', () => {
    const message = messageFromCart([], customer);
    expect(message).toContain('I would like to order:');
  });
});

describe('whatsappUrl (brief S17)', () => {
  it('builds a wa.me link with an encoded message', () => {
    const url = whatsappUrl('Hello & welcome');
    expect(url.startsWith('https://wa.me/')).toBe(true);
    expect(url).toContain('text=Hello%20%26%20welcome');
  });

  it('uses the configured number by default', () => {
    // Derived from brand, not hardcoded: the owner replaces this number, and a
    // literal here failed the moment they did.
    expect(whatsappUrl('x')).toContain(`https://wa.me/${brand.whatsappNumber.replace(/\D/g, '')}`);
  });

  it('strips separators from a grouped number, because wa.me rejects spaces', () => {
    const url = whatsappUrl('x', '+216 90 283-798');
    expect(url).toContain('https://wa.me/21690283798');
    expect(url).not.toContain(' ');
  });
});