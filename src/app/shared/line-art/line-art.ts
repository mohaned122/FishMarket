import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  viewChild,
} from '@angular/core';

import { gsap, prefersReducedMotion, refreshWhenFontsReady } from '../../core/motion/gsap';
import { duration, ease } from '../../core/motion/motion';

/**
 * Brief I5: organic line graphics — nets, wave lines, contour lines. Stroke
 * only, `vector-effect: non-scaling-stroke`, drawn by animating
 * `strokeDashoffset` (the sanctioned exception to the transform-only rule).
 *
 * Every path carries `pathLength="1"`, which normalises the dash geometry so
 * we never have to measure real path lengths in JS.
 *
 * Self-contained: it owns its ScrollTrigger inside its own gsap.context and
 * reverts on destroy (A3, A4). Hosts that want the draw inside a larger
 * timeline — the hero, brief §4.1 step 1.70 — call `revealIn(timeline)`.
 */
@Component({
  selector: 'app-line-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      #svg
      [attr.viewBox]="viewBox()"
      [attr.aria-hidden]="decorative() ? 'true' : null"
      [attr.role]="decorative() ? null : 'img'"
      [attr.aria-label]="decorative() ? null : label()"
      preserveAspectRatio="none"
      class="h-full w-full overflow-visible"
      fill="none"
      stroke="currentColor"
      [style.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" />
      }
    </svg>
  `,
  host: { class: 'block pointer-events-none' },
})
export class LineArt {
  readonly variant = input.required<'net' | 'waves' | 'contour'>();
  readonly label = input('');
  /** Purely decorative art is hidden from assistive tech (brief X4). */
  readonly decorative = input(true);
  readonly strokeWidth = input(1);
  readonly viewBox = input('0 0 600 400');
  /** Draw once the element scrolls into view. Off for hero art, which is
   *  driven by the master entrance timeline instead. */
  readonly drawOnScroll = input(true);
  /** Multiplies the per-path stagger. */
  readonly stagger = input(0.06);

  private readonly svg = viewChild.required<ElementRef<SVGElement>>('svg');
  private readonly destroyRef = inject(DestroyRef);

  readonly paths = computed<readonly string[]>(() => {
    switch (this.variant()) {
      case 'net':
        return [
          'M0 40 C 150 20 300 60 600 30',
          'M0 90 C 150 70 300 110 600 80',
          'M0 140 C 150 120 300 160 600 130',
          'M0 190 C 150 170 300 210 600 180',
          'M0 240 C 150 220 300 260 600 230',
          'M0 290 C 150 270 300 310 600 280',
          'M0 340 C 150 320 300 360 600 330',
          'M50 0 C 30 150 70 300 40 400',
          'M150 0 C 130 150 170 300 140 400',
          'M250 0 C 230 150 270 300 240 400',
          'M350 0 C 330 150 370 300 340 400',
          'M450 0 C 430 150 470 300 440 400',
          'M550 0 C 530 150 570 300 540 400',
        ];
      case 'waves':
        return [
          'M0 60 C 100 30 200 90 300 60 C 400 30 500 90 600 60',
          'M0 110 C 100 80 200 140 300 110 C 400 80 500 140 600 110',
          'M0 160 C 100 130 200 190 300 160 C 400 130 500 190 600 160',
          'M0 210 C 100 180 200 240 300 210 C 400 180 500 240 600 210',
          'M0 260 C 100 230 200 290 300 260 C 400 230 500 290 600 260',
          'M0 310 C 100 280 200 340 300 310 C 400 280 500 340 600 310',
        ];
      case 'contour':
        return [
          'M20 200 C 60 120 160 100 240 130 C 320 160 380 130 420 170 C 460 210 420 270 340 280 C 250 292 140 300 80 260 C 40 234 10 224 20 200 Z',
          'M70 200 C 100 150 170 140 230 160 C 290 180 330 160 360 185 C 390 210 360 245 300 252 C 235 260 160 262 120 235 C 95 218 62 220 70 200 Z',
          'M130 202 C 150 175 195 170 235 182 C 275 194 300 185 320 200 C 340 215 320 232 285 236 C 245 240 200 240 175 225 C 158 214 124 216 130 202 Z',
        ];
    }
  });

  constructor() {
    afterNextRender(() => {
      const host = this.svg().nativeElement;
      const ctx = gsap.context(() => {
        const paths = host.querySelectorAll('path');
        if (!paths.length) return;

        if (prefersReducedMotion()) {
          // X1: no draw animation, but the art must still be visible.
          gsap.set(paths, { strokeDashoffset: 0 });
          return;
        }

        if (!this.drawOnScroll()) {
          gsap.set(paths, { strokeDashoffset: 0 });
          return;
        }

        gsap.fromTo(
          paths,
          { strokeDashoffset: 1 },
          {
            strokeDashoffset: 0,
            duration: duration.slow,
            ease: ease.reveal,
            stagger: this.stagger(),
            scrollTrigger: {
              trigger: host.closest('section, div') ?? host,
              start: 'top 85%',
              invalidateOnRefresh: true,
            },
          },
        );
      }, host);

      this.destroyRef.onDestroy(() => ctx.revert());
      refreshWhenFontsReady();
    });
  }

  /** Draw inside a host timeline — the hero entrance, brief §4.1 step 1.70. */
  revealIn(tl: gsap.core.Timeline, at = 0): void {
    const paths = this.svg().nativeElement.querySelectorAll('path');
    if (!paths.length) return;
    tl.fromTo(
      paths,
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        duration: duration.slow,
        ease: ease.reveal,
        stagger: this.stagger(),
      },
      at,
    );
  }
}