import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { FishImage } from '../../shared/fish-image/fish-image';
import { CartService, formatPrice, linePrice } from '../../core/cart/cart.service';
import { availabilityLabel, type Fish } from '../../core/data/fish';
import { gsap, prefersReducedMotion } from '../../core/motion/gsap';
import { duration, ease } from '../../core/motion/motion';

/**
 * Brief S8: quick-add sheet — rectangular, minimal, GSAP-animated, no modal
 * library. Weight + preparation + Add. Esc closes, focus moves in and back out.
 */
@Component({
  selector: 'app-quick-add',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FishImage],
  template: `
    <div
      class="fixed inset-0 z-55 bg-navy opacity-40"
      (click)="closed.emit()"
      aria-hidden="true"
    ></div>

    <div
      #panel
      role="dialog"
      aria-modal="true"
      [attr.aria-label]="item().name"
      tabindex="-1"
      class="fixed inset-x-0 bottom-0 z-56 max-h-[85svh] overflow-y-auto bg-cream px-6 pb-8 pt-6 text-ink outline-none md:inset-x-auto md:right-0 md:bottom-0 md:w-[30rem] md:max-h-svh"
    >
      <div class="flex items-start justify-between gap-6">
        <div>
          <h3 class="font-display text-[clamp(2rem,6vw,3.5rem)] leading-[0.9]">
            {{ item().name }}
          </h3>
          <p class="micro-label mt-2 opacity-60">{{ item().latin }}</p>
        </div>
        <button
          type="button"
          class="micro-label py-2"
          (click)="closed.emit()"
          data-cursor="arrow"
        >
          Close
        </button>
      </div>

      <div class="mt-6 h-32 w-full">
        <app-fish-image
          [src]="item().image"
          [alt]="item().name"
          [accent]="item().accent"
          width="100%"
          height="100%"
        />
      </div>

      <div class="hairline mt-6 h-px w-full text-current opacity-30"></div>

      <fieldset class="mt-6">
        <legend class="micro-label opacity-60">Weight</legend>
        <div class="mt-3 flex gap-0">
          @for (weight of item().weights; track weight) {
            <button
              type="button"
              class="hairline px-4 py-3 text-sm"
              [class.bg-ink]="grams() === weight"
              [class.text-cream]="grams() === weight"
              (click)="grams.set(weight)"
              [attr.aria-pressed]="grams() === weight"
              data-cursor="arrow"
            >
              {{ weight }} g
            </button>
          }
        </div>
      </fieldset>

      <fieldset class="mt-6">
        <legend class="micro-label opacity-60">Preparation</legend>
        <div class="mt-3 flex flex-wrap gap-2">
          @for (option of item().preparations; track option) {
            <button
              type="button"
              class="hairline px-4 py-3 text-sm"
              [class.bg-ink]="preparation() === option"
              [class.text-cream]="preparation() === option"
              (click)="preparation.set(option)"
              [attr.aria-pressed]="preparation() === option"
              data-cursor="arrow"
            >
              {{ option }}
            </button>
          }
        </div>
      </fieldset>

      <p class="micro-label mt-6 opacity-60">{{ item().note }}</p>
      <p class="micro-label mt-1 opacity-60">{{ availability[item().availability] }}</p>

      <div class="hairline mt-6 h-px w-full text-current opacity-30"></div>

      <div class="mt-4 flex items-baseline justify-between">
        <span class="micro-label">Line total</span>
        <span class="font-display text-[clamp(1.75rem,4vw,2.5rem)] tabular-nums">
          {{ formatPrice(total()) }}
        </span>
      </div>

      <button
        type="button"
        class="mt-6 flex w-full items-center justify-between bg-ink px-5 py-4 text-cream"
        (click)="add()"
        data-cursor="add"
      >
        <span class="micro-label">Add to cart</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  `,
  host: { class: 'contents' },
})
export class QuickAdd {
  readonly item = input.required<Fish>();
  readonly closed = output<void>();

  private readonly cart = inject(CartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');

  protected readonly availability = availabilityLabel;
  protected readonly formatPrice = formatPrice;

  protected readonly grams = signal(500);
  protected readonly preparation = signal('');

  protected readonly total = computed(() =>
    linePrice(this.item().pricePerKg, this.grams()),
  );

  constructor() {
    // Default to the first real option rather than an empty selection.
    effect(() => {
      const options = this.item().preparations;
      if (!this.preparation() && options.length) this.preparation.set(options[0]);
      if (!this.item().weights.includes(this.grams())) {
        this.grams.set(this.item().weights[0] ?? 500);
      }
    });

    effect((onCleanup) => {
      const doc = globalThis.document;
      if (!doc) return;

      const opener = doc.activeElement as HTMLElement | null;
      const el = this.panel().nativeElement;

      if (!prefersReducedMotion()) {
        gsap.fromTo(
          el,
          { yPercent: 100 },
          { yPercent: 0, duration: duration.base, ease: ease.travel },
        );
      }

      el.focus({ preventScroll: true });

      const onKeydown = (event: KeyboardEvent) => {
        if (event.key !== 'Escape') return;
        event.stopPropagation();
        this.closed.emit();
      };

      doc.addEventListener('keydown', onKeydown);

      onCleanup(() => {
        doc.removeEventListener('keydown', onKeydown);
        gsap.killTweensOf(el);
        opener?.focus?.({ preventScroll: true });
      });
    });

    this.destroyRef.onDestroy(() => gsap.killTweensOf(this.panel().nativeElement));
  }

  protected add(): void {
    this.cart.add(this.item().id, this.grams(), this.preparation());
    this.cart.open.set(true);
    this.closed.emit();
  }
}