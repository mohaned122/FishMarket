import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { FishProduct } from './fish-product';
import { QuickAdd } from './quick-add';
import { fish, type Fish } from '../../core/data/fish';
import { copy } from '../../core/data/copy';
import { gsap, ScrollTrigger, prefersReducedMotion, refreshWhenFontsReady } from '../../core/motion/gsap';
import { duration, ease, track } from '../../core/motion/motion';

/**
 * Brief S5-S8 — the signature interaction.
 *
 * Desktop (>=768px): the section pins and the flex track translates on x.
 * Mobile: no pin at all (R3), it becomes a native scroll-snap carousel (S7).
 * `matchMedia` decides which, so exactly one strategy is ever live (A3).
 */
@Component({
  selector: 'app-fish-explorer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FishProduct, QuickAdd],
  templateUrl: './fish-explorer.html',
  host: { class: 'block' },
})
export class FishExplorer {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly trackEl = viewChild.required<ElementRef<HTMLElement>>('track');
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  private readonly progress = viewChild.required<ElementRef<HTMLElement>>('progress');

  protected readonly copy = copy.explorer;
  protected readonly items = fish;

  protected readonly activeIndex = signal(0);
  protected readonly selected = signal<Fish | null>(null);

  protected readonly counter = computed(() => {
    const n = this.activeIndex() + 1;
    return `${String(n).padStart(2, '0')} / ${String(this.items.length).padStart(2, '0')}`;
  });

  constructor() {
    afterNextRender(() => {
      this.setup();
      // A5. The pin measures panel geometry, so it must be re-measured once the
      // display serif swaps in and once the fish photography has decoded.
      // Without this the distance is read from fallback metrics and the pin
      // releases far too early.
      refreshWhenFontsReady();
      this.refreshOnceImagesDecode();
    });
  }

  /** Photographs are 84-156 KB and arrive after first paint; re-measure then. */
  private refreshOnceImagesDecode(): void {
    if (typeof document === 'undefined') return;
    const images = Array.from(document.images);
    if (!images.length) return;
    void Promise.all(images.map((img) => img.decode().catch(() => undefined))).then(() =>
      ScrollTrigger.refresh(),
    );
  }

  private setup(): void {
    const host = this.host.nativeElement;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // ---- Desktop: pin + horizontal scrub -------------------------------
      mm.add(
        { isDesktop: '(min-width: 768px)', reduced: '(prefers-reduced-motion: reduce)' },
        (context) => {
          const { isDesktop, reduced } = context.conditions as Record<string, boolean>;
          if (!isDesktop || reduced) return;

          const root = this.root().nativeElement;
          const t = this.trackEl().nativeElement;

          /**
           * The track is `md:w-max`, so its own width equals the width of its
           * content and `scrollWidth - clientWidth` is always 0. The real
           * distance is therefore measured from the last panel's right edge back
           * to the viewport edge.
           *
           * This is also the *only* distance that is safe. The track is translated
           * by exactly this amount, so anything longer pushes the last fish off
           * the left edge and exposes bare background at the right; that is what
           * made the section look empty. See `track.minPinDistance`.
           *
           * Measured from `offsetLeft` rather than `scrollWidth` because the track
           * is an `overflow-x` box whose content width moves with font metrics, so
           * `scrollWidth` is the value most likely to be read before the display
           * serif has swapped in.
           */
          const distance = (): number => {
            const panels = t.querySelectorAll<HTMLElement>('[data-panel]');
            const last = panels[panels.length - 1];
            const overflow = last
              ? last.offsetLeft + last.offsetWidth - globalThis.innerWidth
              : 0;
            return Math.max(overflow, track.minPinDistance);
          };

          // The track itself.
          const tween = gsap.to(t, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: () => `+=${distance()}`,
              scrub: track.scrub,
              pin: true,
              pinSpacing: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                const total = this.items.length;
                this.activeIndex.set(
                  Math.min(total - 1, Math.round(self.progress * (total - 1))),
                );
              },
            },
          });

          // S5: the heading moves at a different rate than the track.
          gsap.to(this.heading().nativeElement, {
            x: () => -distance() * track.headingRate,
            ease: 'none',
            scrollTrigger: {
              trigger: root,
              start: 'top top',
              end: () => `+=${distance()}`,
              scrub: track.scrub,
              invalidateOnRefresh: true,
            },
          });

          // S5: each product parallaxes inside the moving container, so the
          // fish travels slightly faster than its own label.
          const panels = t.querySelectorAll('[data-panel]');
          panels.forEach((panel) => {
            const fishEl = panel.querySelector('[data-fish]');
            if (!fishEl) return;
            gsap.fromTo(
              fishEl,
              { x: -track.containerParallax },
              {
                x: track.containerParallax,
                ease: 'none',
                scrollTrigger: {
                  trigger: panel,
                  containerAnimation: tween,
                  start: 'left right',
                  end: 'right left',
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              },
            );
          });

          return () => {
            panels.forEach((panel) => gsap.set(panel.querySelector('[data-fish]'), { clearProps: 'all' }));
          };
        },
      );

      // ---- Mobile: native snap carousel, no pin --------------------------
      mm.add('(max-width: 767px)', () => {
        const t = this.trackEl().nativeElement;
        const onScroll = () => {
          const slides = Array.from(t.querySelectorAll<HTMLElement>('[data-panel]'));
          if (!slides.length) return;
          const centre = t.scrollLeft + t.clientWidth / 2;
          let best = 0;
          let bestDistance = Infinity;
          slides.forEach((slide, index) => {
            const slideCentre = slide.offsetLeft + slide.offsetWidth / 2;
            const distance = Math.abs(slideCentre - centre);
            if (distance < bestDistance) {
              bestDistance = distance;
              best = index;
            }
          });
          this.activeIndex.set(best);
        };
        t.addEventListener('scroll', onScroll, { passive: true });
        return () => t.removeEventListener('scroll', onScroll);
      });

      return () => mm.revert();
    }, host);

    this.destroyRef.onDestroy(() => ctx.revert());
  }

  protected open(fishItem: Fish): void {
    if (fishItem.availability === 'sold-out') return;
    this.selected.set(fishItem);
  }

  protected close(): void {
    this.selected.set(null);
  }
}