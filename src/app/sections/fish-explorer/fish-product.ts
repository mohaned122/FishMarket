import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { FishImage } from '../../shared/fish-image/fish-image';
import { availabilityLabel, type Fish } from '../../core/data/fish';
import { formatPrice } from '../../core/cart/cart.service';
import { gsap, hasFinePointer, prefersReducedMotion } from '../../core/motion/gsap';
import { duration, ease } from '../../core/motion/motion';

/**
 * Brief S6: an editorial object, not a card. The fish is enormous and breaks
 * out of the panel; the name sits huge in the serif behind/overlapping it;
 * metadata is micro-sized. Panels alternate width and vertical alignment so
 * no two are identical.
 *
 * A10 hover: one reversible timeline per product, `settle` ease, `micro`
 * duration. The fish shifts 12px toward the cursor side.
 */
@Component({
  selector: 'app-fish-product',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FishImage],
  templateUrl: './fish-product.html',
  host: { class: 'block' },
})
export class FishProduct {
  readonly fish = input.required<Fish>();
  /** Index in the track, for the catch-number metadata. */
  readonly position = input(1);

  readonly quickAdd = output<Fish>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly availability = availabilityLabel;
  protected readonly formatPrice = formatPrice;
  protected readonly soldOut = computed(() => this.fish().availability === 'sold-out');
  protected readonly fresh = computed(() => this.fish().availability === 'fresh-today');

  constructor() {
    afterNextRender(() => this.setupHover());
  }

  private setupHover(): void {
    if (prefersReducedMotion() || !hasFinePointer()) return;

    const host = this.host.nativeElement;

    const ctx = gsap.context(() => {
      const fish = host.querySelector('[data-fish]');
      const name = host.querySelector('[data-name]');
      const arrow = host.querySelector('[data-arrow]');
      const meta = host.querySelector('[data-meta]');
      if (!fish || !name || !arrow) return;

      // A2 "Weight" + "Respond": subtle, reversible, one timeline per product.
      const tl = gsap
        .timeline({ paused: true, defaults: { ease: ease.settle, duration: duration.micro } })
        .to(fish, { scale: 1.04 }, 0)
        .to(name, { x: 16 }, 0)
        .to(arrow, { x: 10 }, 0);

      if (meta) tl.fromTo(meta, { yPercent: 110 }, { yPercent: 0 }, 0);

      // Keyboard focus reuses the same timeline so focus and hover look alike (X2).
      const onEnter = (event: Event) => {
        const pointer = event as PointerEvent;
        const rect = host.getBoundingClientRect();
        const dir = pointer.clientX ? pointer.clientX < rect.left + rect.width / 2 ? -1 : 1 : 1;
        gsap.to(fish, { x: 12 * dir, duration: duration.micro, ease: ease.settle, overwrite: 'auto' });
        tl.play();
      };

      const onLeave = () => {
        gsap.to(fish, { x: 0, scale: 1, duration: duration.micro, ease: ease.settle, overwrite: 'auto' });
        tl.reverse();
      };

      host.addEventListener('pointerenter', onEnter);
      host.addEventListener('pointerleave', onLeave);
      host.addEventListener('focusin', onEnter);
      host.addEventListener('focusout', onLeave);

      ctx.add(() => {
        host.removeEventListener('pointerenter', onEnter);
        host.removeEventListener('pointerleave', onLeave);
        host.removeEventListener('focusin', onEnter);
        host.removeEventListener('focusout', onLeave);
      });
    }, host);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}