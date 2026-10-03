import { Injectable, computed, effect, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { fishById } from '../data/fish';
import { brand } from '../data/brand';

/** Brief D3: price is `pricePerKg × grams / 1000`, 2 decimals. */
export function linePrice(pricePerKg: number, grams: number): number {
  return Math.round(pricePerKg * (grams / 1000) * 100) / 100;
}

/** Brief S17: `500g` / `1kg` / `1.5kg`. */
export function formatWeight(grams: number): string {
  if (grams % 1000 === 0) return `${grams / 1000}kg`;
  if (grams < 1000) return `${grams}g`;
  return `${Math.round(grams / 100) / 10}kg`;
}

/** Brief D3: `Intl.NumberFormat('fr-TN')` + " TND". */
const money = new Intl.NumberFormat(brand.locale, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number): string {
  return `${money.format(amount)} ${brand.currency}`;
}

export interface CartLine {
  fishId: string;
  grams: number;
  preparation: string;
}

export interface Customer {
  name: string;
  phone: string;
  notes: string;
}

const STORAGE_KEY = '9sharti.cart.v1';
const CUSTOMER_KEY = '9sharti.customer.v1';

const emptyCustomer: Customer = { name: '', phone: '', notes: '' };

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly _lines = signal<readonly CartLine[]>([]);
  private readonly _customer = signal<Customer>(emptyCustomer);
  private readonly _hydrated = signal(false);

  /** Open/closed state of the drawer. */
  readonly open = signal(false);

  readonly lines = this._lines.asReadonly();
  readonly customer = this._customer.asReadonly();

  readonly count = computed(() => this._lines().length);

  /** Detailed lines with the fish record resolved, for rendering. */
  readonly detailed = computed(() =>
    this._lines()
      .map((line) => {
        const item = fishById(line.fishId);
        if (!item) return null;
        return { ...line, fish: item, price: linePrice(item.pricePerKg, line.grams) };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null),
  );

  readonly total = computed(() =>
    this.detailed().reduce((sum, line) => sum + line.price, 0),
  );

  readonly isEmpty = computed(() => this._lines().length === 0);

  constructor() {
    // Brief D3: persistence must never throw (private mode, quota, disabled storage).
    this.hydrate();

    effect(() => {
      if (!this.isBrowser || !this._hydrated()) return;
      this.write(STORAGE_KEY, JSON.stringify(this._lines()));
    });

    effect(() => {
      if (!this.isBrowser || !this._hydrated()) return;
      this.write(CUSTOMER_KEY, JSON.stringify(this._customer()));
    });
  }

  add(fishId: string, grams: number, preparation: string): void {
    const existing = this._lines().find(
      (line) => line.fishId === fishId && line.preparation === preparation,
    );

    if (existing) {
      this._lines.update((lines) =>
        lines.map((line) =>
          line === existing ? { ...line, grams: line.grams + grams } : line,
        ),
      );
    } else {
      this._lines.update((lines) => [...lines, { fishId, grams, preparation }]);
    }
  }

  updateGrams(fishId: string, grams: number, preparation: string): void {
    this._lines.update((lines) =>
      lines.map((line) =>
        line.fishId === fishId && line.preparation === preparation ? { ...line, grams } : line,
      ),
    );
  }

  remove(fishId: string, preparation: string): void {
    this._lines.update((lines) =>
      lines.filter((line) => !(line.fishId === fishId && line.preparation === preparation)),
    );
  }

  clear(): void {
    this._lines.set([]);
  }

  setCustomer(patch: Partial<Customer>): void {
    this._customer.update((current) => ({ ...current, ...patch }));
  }

  toggle(): void {
    this.open.update((value) => !value);
  }

  close(): void {
    this.open.set(false);
  }

  private hydrate(): void {
    if (!this.isBrowser) {
      this._hydrated.set(true);
      return;
    }
    const lines = this.read<CartLine[]>(STORAGE_KEY);
    if (Array.isArray(lines)) {
      this._lines.set(lines.filter((line) => typeof line?.fishId === 'string' && typeof line?.grams === 'number'));
    }
    const customer = this.read<Customer>(CUSTOMER_KEY);
    if (customer && typeof customer === 'object') {
      this._customer.set({ ...emptyCustomer, ...customer });
    }
    this._hydrated.set(true);
  }

  private read<T>(key: string): T | null {
    try {
      const raw = globalThis.localStorage?.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private write(key: string, value: string): void {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      /* storage unavailable — cart stays in memory for this session */
    }
  }
}