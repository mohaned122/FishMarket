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

import { gsap, hasFinePointer, prefersReducedMotion } from '../../core/motion/gsap';
import { cursor, duration, ease } from '../../core/motion/motion';

type CursorMode = 'view' | 'arrow' | 'add' | 'drag' | null;

/** Slight growth over interactive things. Nothing else — no label, no trailing ring. */
const SCALES: Record<string, number> = {
  view: cursor.scaleMedia,
  arrow: 1.15,
  add: cursor.scaleInteractive,
  drag: 1.45,
  rest: 1,
};

/**
 * Brief S18, reduced to what actually works: one soft circle.
 *
 * Earlier versions had a text label and a second "wake" ring trailing behind on
 * a slower ease. Both were cut — the label was noise, and the lag between the two
 * elements read as sluggishness rather than as water. There is now exactly one
 * element, and it follows tightly.
 *
 * The softness is a radial gradient, not `filter: blur`. The brief forbids
 * animating blur, a blur filter here would also be the single most expensive
 * thing on the page, and a gradient gives the same falloff for free. It is
 * `mix-blend-difference` against white so the circle reads on all five section
 * backgrounds: it darkens on cream and coral, lightens on navy.
 *
 * Nothing about visibility is decided by a CSS breakpoint, and nothing decides it
 * from a gate that can silently fail — see the note in `setup()`.
 */
@Component({
  selector: 'app-cursor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      #dot
      data-cursor-dot
      aria-hidden="true"
      class="pointer-events-none fixed left-0 top-0 z-60 hidden size-10 -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
    >
      <div
        #lens
        data-cursor-lens
        class="circle size-full"
        style="background: radial-gradient(circle, #fff 0%, rgba(255, 255, 255, 0.5) 42%, rgba(255, 255, 255, 0) 72%)"
      ></div>
    </div>
  `,
})
export class Cursor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly dot = viewChild.required<ElementRef<HTMLElement>>('dot');
  private readonly lens = viewChild.required<ElementRef<HTMLElement>>('lens');

  readonly mode = signal<CursorMode>(null);

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const doc = this.host.nativeElement.ownerDocument;
    const root = doc.documentElement;
    if (!root) return;

    const dot = this.dot().nativeElement;
    const lens = this.lens().nativeElement;

    /**
     * Mounted unconditionally. This used to sit behind
     * `hasFinePointer() && !prefersReducedMotion()`, so an OS setting could
     * disable the feature with nothing on screen and nothing logged. Reduced
     * motion now only removes the follow easing.
     */
    dot.style.display = 'block';

    const follow = prefersReducedMotion() ? 0 : cursor.followDuration;

    /** The native pointer goes away only where a real mouse drives the circle. */
    if (hasFinePointer()) root.classList.add('hidden-cursor');

    // Park it mid-screen rather than at 0,0 so it is never stuck in a corner.
    gsap.set(dot, {
      x: doc.defaultView?.innerWidth ? doc.defaultView.innerWidth / 2 : 0,
      y: doc.defaultView?.innerHeight ? doc.defaultView.innerHeight / 2 : 0,
    });

    const xTo = gsap.quickTo(dot, 'x', { duration: follow, ease: ease.settle });
    const yTo = gsap.quickTo(dot, 'y', { duration: follow, ease: ease.settle });

    const onMove = (event: MouseEvent | PointerEvent): void => {
      dot.style.display = 'block';
      xTo(event.clientX);
      yTo(event.clientY);
    };

    /** One delegated listener for the whole document — no per-element wiring. */
    const onOver = (event: Event): void => {
      const target = (event.target as Element | null)?.closest?.('[data-cursor]') as
        | HTMLElement
        | null;
      const next = (target?.dataset['cursor'] as CursorMode | undefined) ?? null;
      if (this.mode() === next) return;
      this.mode.set(next);

      gsap.to(lens, {
        scale: SCALES[next ?? 'rest'],
        duration: duration.micro,
        ease: ease.settle,
        overwrite: true,
      });
    };

    const onLeaveWindow = (): void => {
      dot.style.display = 'none';
    };

    doc.addEventListener('pointermove', onMove, { passive: true });
    doc.addEventListener('mousemove', onMove, { passive: true });
    doc.addEventListener('mouseover', onOver, { passive: true });
    doc.addEventListener('pointerover', onOver, { passive: true });
    doc.addEventListener('mouseleave', onLeaveWindow, { passive: true });

    this.destroyRef.onDestroy(() => {
      doc.removeEventListener('pointermove', onMove);
      doc.removeEventListener('mousemove', onMove);
      doc.removeEventListener('mouseover', onOver);
      doc.removeEventListener('pointerover', onOver);
      doc.removeEventListener('mouseleave', onLeaveWindow);
      gsap.killTweensOf([dot, lens]);
      dot.style.display = '';
      root.classList.remove('hidden-cursor');
    });
  }
}