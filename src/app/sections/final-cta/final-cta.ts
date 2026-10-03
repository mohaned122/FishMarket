import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';

import { brand, deliveryZones, openingHours } from '../../core/data/brand';
import { copy } from '../../core/data/copy';
import { whatsappUrl } from '../../core/data/whatsapp';
import { gsap, prefersReducedMotion } from '../../core/motion/gsap';
import { duration, ease } from '../../core/motion/motion';

/**
 * Brief S15. Navy. Giant type revealed with a line mask on enter, a large
 * rectangular WhatsApp button in peach whose arrow travels on hover, and
 * delivery zones / hours as micro-labels.
 */
@Component({
  selector: 'app-final-cta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './final-cta.html',
  host: { class: 'block' },
})
export class FinalCta {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly lines = viewChildren<ElementRef<HTMLElement>>('line');
  private readonly arrow = viewChild.required<ElementRef<HTMLElement>>('arrow');

  protected readonly copy = copy.finalCta;
  protected readonly hours = openingHours;
  protected readonly zones = deliveryZones;
  protected readonly isPlaceholderNumber = brand.whatsappNumberIsPlaceholder;

  protected readonly whatsappLink = whatsappUrl(
    [
      'Hello,',
      '',
      'I would like to order fresh fish.',
      '',
      'Name:',
      'Phone:',
      '',
      'Thank you.',
    ].join('\n'),
  );

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const lineEls = this.lines().map((ref) => ref.nativeElement);

      // S15: line-mask reveal on enter.
      gsap.fromTo(
        lineEls,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: duration.slow,
          stagger: 0.12,
          ease: ease.reveal,
          scrollTrigger: { trigger: this.host.nativeElement, start: 'top 75%' },
        },
      );

      // The arrow travels on hover — transform only (H8). Real hover, not a
      // scroll trigger: the button is used well below the fold.
      const link = this.host.nativeElement.querySelector('a[href]');
      const arrowEl = this.arrow().nativeElement;
      if (link) {
        const onEnter = () => gsap.to(arrowEl, { x: 18, duration: duration.micro, ease: ease.settle });
        const onLeave = () => gsap.to(arrowEl, { x: 0, duration: duration.micro, ease: ease.settle });
        link.addEventListener('pointerenter', onEnter);
        link.addEventListener('pointerleave', onLeave);
        link.addEventListener('focus', onEnter);
        link.addEventListener('blur', onLeave);
        ctx.add(() => {
          link.removeEventListener('pointerenter', onEnter);
          link.removeEventListener('pointerleave', onLeave);
          link.removeEventListener('focus', onEnter);
          link.removeEventListener('blur', onLeave);
        });
      }
    }, this.host.nativeElement);

    this.destroyRef.onDestroy(() => ctx.revert());
  }
}