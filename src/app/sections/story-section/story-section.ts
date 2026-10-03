import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { LineArt } from '../../shared/line-art/line-art';
import { copy } from '../../core/data/copy';
import { gsap, prefersReducedMotion } from '../../core/motion/gsap';
import { duration, ease, storyReveal } from '../../core/motion/motion';

/**
 * Brief S13. Not "About Us". The headline splits across two colour planes,
 * large plates reveal with a clip-path inset, the inner image settles from
 * 1.15 to 1, and the typography drifts at a different speed to the imagery.
 *
 * The plates are flat colour planes because no story photography has been
 * supplied — see `public/fish/ASSETS.md`.
 */
@Component({
  selector: 'app-story-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LineArt],
  templateUrl: './story-section.html',
  host: { class: 'block' },
})
export class StorySection {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly section = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly copyBlock = viewChild.required<ElementRef<HTMLElement>>('copyBlock');

  protected readonly copy = copy.story;

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const root = this.section().nativeElement;

      // Clip-path reveal: inset(100% 0 0 0) -> inset(0). P4 sanctions
      // clip-path because it is compositor-friendly.
      const plates = root.querySelectorAll('[data-plate]');
      plates.forEach((plate) => {
        gsap.fromTo(
          plate,
          { clipPath: storyReveal.from },
          {
            clipPath: storyReveal.to,
            duration: duration.slow,
            ease: ease.reveal,
            scrollTrigger: { trigger: plate, start: 'top 88%', invalidateOnRefresh: true },
          },
        );
      });

      // Typography drifts at a different speed to the imagery.
      gsap.fromTo(
        this.copyBlock().nativeElement,
        { yPercent: 14 },
        {
          yPercent: -8,
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
    }, this.host.nativeElement);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}