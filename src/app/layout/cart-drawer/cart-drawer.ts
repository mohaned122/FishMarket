import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartService, formatPrice } from '../../core/cart/cart.service';
import { copy } from '../../core/data/copy';
import { brand } from '../../core/data/brand';
import { messageFromCart, whatsappUrl } from '../../core/data/whatsapp';
import { gsap, prefersReducedMotion } from '../../core/motion/gsap';
import { duration, ease } from '../../core/motion/motion';

/**
 * Brief S16. Right-side drawer, full height, ink on cream, `travel` ease.
 * Focus trapped, Esc closes, `aria-modal`, focus restored to the opener.
 * The dim behind is opacity only (H8 — never animate a filter).
 */
@Component({
  selector: 'app-cart-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './cart-drawer.html',
  host: { class: 'contents' },
})
export class CartDrawer {
  protected readonly copy = copy.cart;
  protected readonly brand = brand;
  protected readonly formatPrice = formatPrice;

  protected readonly cart = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  protected readonly lines = computed(() => this.cart.detailed());
  protected readonly total = computed(() => this.cart.total());
  protected readonly isEmpty = computed(() => this.cart.isEmpty());

  protected readonly whatsappLink = computed(() =>
    whatsappUrl(messageFromCart(this.cart.lines(), this.cart.customer())),
  );

  private lastFocused: HTMLElement | null = null;

  constructor() {
    // Keep focus inside the drawer while it is open, and hand it back on close.
    effect((onCleanup) => {
      const open = this.cart.open();
      const doc = globalThis.document;
      if (!open || !doc) {
        onCleanup(() => undefined);
        return;
      }

      this.lastFocused = doc.activeElement as HTMLElement | null;

      const el = this.panel().nativeElement;
      this.animateIn(el);
      el.focus({ preventScroll: true });

      const onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          this.cart.close();
          return;
        }
        if (event.key !== 'Tab') return;

        const focusable = el.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable.length) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && doc.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && doc.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      };

      doc.addEventListener('keydown', onKeydown);

      onCleanup(() => {
        doc.removeEventListener('keydown', onKeydown);
        gsap.to(el, { xPercent: 100, duration: duration.base, ease: ease.travel });
        this.lastFocused?.focus?.({ preventScroll: true });
      });
    });
  }

  private animateIn(el: HTMLElement): void {
    if (prefersReducedMotion()) {
      gsap.set(el, { xPercent: 0 });
      return;
    }
    gsap.fromTo(
      el,
      { xPercent: 100 },
      { xPercent: 0, duration: duration.base, ease: ease.travel },
    );
  }

  protected updateNotes(value: string): void {
    this.cart.setCustomer({ notes: value });
  }

  protected updateName(value: string): void {
    this.cart.setCustomer({ name: value });
  }

  protected updatePhone(value: string): void {
    this.cart.setCustomer({ phone: value });
  }

  protected changeGrams(fishId: string, grams: number, preparation: string): void {
    this.cart.updateGrams(fishId, grams, preparation);
  }

  protected decrement(line: { fishId: string; grams: number; preparation: string }): void {
    const step = line.grams >= 1000 ? 500 : 250;
    const next = line.grams - step;
    if (next <= 0) {
      this.cart.remove(line.fishId, line.preparation);
    } else {
      this.changeGrams(line.fishId, next, line.preparation);
    }
  }

  protected increment(line: { fishId: string; grams: number; preparation: string }): void {
    this.changeGrams(line.fishId, line.grams + (line.grams >= 1000 ? 500 : 250), line.preparation);
  }

  protected remove(fishId: string, preparation: string): void {
    this.cart.remove(fishId, preparation);
  }
}