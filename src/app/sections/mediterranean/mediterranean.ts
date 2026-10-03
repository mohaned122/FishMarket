import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';

import { LineArt } from '../../shared/line-art/line-art';
import { copy } from '../../core/data/copy';
import { gsap, prefersReducedMotion } from '../../core/motion/gsap';
import { duration, ease, mediterraneanLayers } from '../../core/motion/motion';

/**
 * Brief S14. Four depth planes on separate transforms at 0.15 / 0.3 / 0.5 /
 * 0.7 of scroll speed, a pinned segment where the line is revealed word by
 * word while the scene scales 1 -> 1.12, and wave line-art drifting sideways.
 *
 * Restrained: elegance over spectacle. The planes are colour + inline SVG
 * because no scenic photography has been supplied — see
 * `public/fish/ASSETS.md`.
 */
@Component({
  selector: 'app-mediterranean',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LineArt],
  templateUrl: './mediterranean.html',
  host: { class: 'block' },
})
export class Mediterranean {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly scene = viewChild.required<ElementRef<HTMLElement>>('scene');
  private readonly wordRefs = viewChildren<ElementRef<HTMLElement>>('word');

  protected readonly copy = copy.mediterranean;
  protected readonly layers = mediterraneanLayers;

  protected readonly words = computed(() =>
    this.copy.words.map((word, index) => ({ word, index })),
  );

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const root = this.root().nativeElement;

      // Each plane on its own transform at a distinct speed (S14).
      const planes = root.querySelectorAll<HTMLElement>('[data-plane]');
      planes.forEach((plane) => {
        const speed = Number(plane.dataset['speed'] ?? '0.2');
        gsap.fromTo(
          plane,
          { yPercent: 8 * (speed * 10) },
          {
            yPercent: -8 * (speed * 10),
            ease: ease.linear,
            scrollTrigger: {
              trigger: root,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );
      });

      // Pinned segment: words reveal while the scene scales.
      const words = this.wordRefs().map((ref) => ref.nativeElement);
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: 'top top',
            end: '+=120%',
            pin: true,
            scrub: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })
        .to(this.scene().nativeElement, { scale: 1.12, ease: ease.linear }, 0)
        .fromTo(
          words,
          { yPercent: 110, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: duration.base,
            stagger: 0.18,
            ease: ease.reveal,
          },
          0,
        );

      // Wave line-art drifting horizontally — transform only (H8).
      const waves = root.querySelectorAll<HTMLElement>('[data-waves]');
      waves.forEach((wave, index) => {
        gsap.fromTo(
          wave,
          { xPercent: index % 2 === 0 ? -4 : 4 },
          { xPercent: index % 2 === 0 ? 4 : -4, ease: ease.linear },
        );
      });
    }, this.host.nativeElement);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}