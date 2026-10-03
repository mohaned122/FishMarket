import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { FishImage } from '../../shared/fish-image/fish-image';
import { fish, freshToday, availabilityLabel } from '../../core/data/fish';
import { copy } from '../../core/data/copy';
import { formatPrice } from '../../core/cart/cart.service';
import { CartService } from '../../core/cart/cart.service';
import { gsap, prefersReducedMotion } from '../../core/motion/gsap';
import { ease } from '../../core/motion/motion';

/**
 * Brief S9. Coral background, gigantic FRESH / TODAY, one word travelling left
 * and the other right on scroll (±8% xPercent, scrubbed).
 *
 * D4: the list is derived from `availability`, never hard-coded. Sold-out
 * entries appear struck through at low contrast so availability is
 * unmistakable in a single glance.
 */
@Component({
  selector: 'app-fresh-today',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FishImage],
  templateUrl: './fresh-today.html',
  host: { class: 'block' },
})
export class FreshToday {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly wordLeft = viewChild.required<ElementRef<HTMLElement>>('wordLeft');
  private readonly wordRight = viewChild.required<ElementRef<HTMLElement>>('wordRight');

  private readonly cart = inject(CartService);

  protected readonly copy = copy.freshToday;
  protected readonly availability = availabilityLabel;
  protected readonly formatPrice = formatPrice;

  protected readonly items = freshToday();
  protected readonly gone = fish.filter((item) => item.availability === 'sold-out');

  protected readonly adding = signal<string | null>(null);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // S9: the two headline words travel in opposite directions.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: this.root().nativeElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(this.wordLeft().nativeElement, { xPercent: -8 }, { xPercent: 8, ease: ease.linear }, 0)
        .fromTo(this.wordRight().nativeElement, { xPercent: 8 }, { xPercent: -8, ease: ease.linear }, 0);
    }, this.host.nativeElement);

    this.destroyRef.onDestroy(() => ctx.revert());
  }

  protected add(id: string): void {
    this.adding.set(id);
    const item = fish.find((entry) => entry.id === id);
    if (!item) return;
    this.cart.add(id, item.weights[0] ?? 500, item.preparations[0] ?? 'Whole');
    this.adding.set(null);
  }
}