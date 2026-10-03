import { brand } from '../data/brand';
import { fishById } from '../data/fish';
import { formatPrice, formatWeight, linePrice, type CartLine, type Customer } from '../cart/cart.service';

export interface OrderLine {
  name: string;
  grams: number;
  preparation: string;
  price: number;
}

/**
 * Brief S17. Pure function so it can be unit tested without TestBed.
 * `lines` is passed already resolved from fish records.
 */
export function buildOrderMessage(
  lines: readonly OrderLine[],
  customer: Customer,
  total: number,
): string {
  const parts: string[] = ['Hello,', '', 'I would like to order:', ''];

  for (const line of lines) {
    // Preparation is listed per line: `Sea Bass — Cleaned`.
    parts.push(`${formatWeight(line.grams)} ${line.name} — ${line.preparation}`);
  }

  parts.push('', `Name: ${customer.name || '—'}`, `Phone: ${customer.phone || '—'}`);

  if (customer.notes.trim()) {
    parts.push('', `Delivery notes: ${customer.notes.trim()}`);
  }

  parts.push('', `Estimated total: ${formatPrice(total)}`, '', 'Thank you.');

  return parts.join('\n');
}

/** Convenience wrapper for the cart service's computed state. */
export function messageFromCart(
  lines: readonly CartLine[],
  customer: Customer,
): string {
  const resolved: OrderLine[] = [];
  let total = 0;

  for (const line of lines) {
    const fish = fishById(line.fishId);
    if (!fish) continue;
    const price = linePrice(fish.pricePerKg, line.grams);
    total += price;
    resolved.push({ name: fish.name, grams: line.grams, preparation: line.preparation, price });
  }

  return buildOrderMessage(resolved, customer, Math.round(total * 100) / 100);
}

/**
 * Brief S17: opens in a new tab, so the caller must add rel="noopener noreferrer".
 *
 * The number is normalised to bare digits first. `wa.me` accepts digits and
 * nothing else, and the owner's number is stored in a readable grouped form
 * (`216 90 283 798`), which would otherwise produce a link with literal spaces
 * and WhatsApp would reject it. A leading `+` is accepted and dropped, since
 * wa.me expects the country code without it.
 */
export function whatsappUrl(message: string, number: string = brand.whatsappNumber): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}