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

import { FishImage } from '../../shared/fish-image/fish-image';
import { LineArt } from '../../shared/line-art/line-art';
import { fishById } from '../../core/data/fish';
import { copy } from '../../core/data/copy';
import { gsap, ScrollTrigger, hasFinePointer, prefersReducedMotion } from '../../core/motion/gsap';
import { duration, ease, heroCue, heroScroll, parallax } from '../../core/motion/motion';

/** One headline line split into characters for the per-character stagger. */
interface SplitLine {
  text: string;
  chars: string[];
  indent: boolean;
  italic: boolean;
}

/**
 * Brief S2-S4 plus §4.1 (entrance timeline) and §4.2 (mouse parallax).
 * Background plane: cream. Type: navy. Accents: ocean circle, coral labels (K3).
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FishImage, LineArt],
  templateUrl: './hero.html',
  host: { class: 'block' },
})
export class Hero {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private readonly root = viewChild.required<ElementRef<HTMLElement>>('root');
  private readonly plane = viewChild.required<ElementRef<HTMLElement>>('plane');
  private readonly circle = viewChild.required<ElementRef<HTMLElement>>('circle');
  private readonly headline = viewChild.required<ElementRef<HTMLElement>>('headline');
  private readonly fish = viewChild.required<ElementRef<HTMLElement>>('fish');
  private readonly shadow = viewChild.required<ElementRef<HTMLElement>>('shadow');
  private readonly lineArt = viewChild.required(LineArt);
  private readonly lineRefs = viewChildren<ElementRef<HTMLElement>>('lineEl');

  protected readonly copy = copy.hero;

  protected readonly item = computed(() => fishById(this.copy.fishId)!);

  protected readonly lines = computed<SplitLine[]>(() =>
    this.copy.lines.map((text, index) => ({
      text,
      chars: [...text],
      // S2: the middle word is indented; S2/T3: set in italic.
      indent: index === 1,
      italic: index === this.copy.italicIndex,
    })),
  );

  constructor() {
    afterNextRender(() => this.setup());
  }

  private setup(): void {
    const host = this.host.nativeElement;
    const ctx = gsap.context(() => {
      const reduced = prefersReducedMotion();

      if (!reduced) this.buildEntrance();
      this.buildScroll();

      if (!reduced && hasFinePointer()) this.buildParallax();
    }, host);

    this.destroyRef.onDestroy(() => ctx.revert());
  }

  /** §4.1 — one master timeline, ~3.2 s. */
  private buildEntrance(): void {
    const tl = gsap.timeline({ defaults: { ease: ease.reveal } });

    tl.fromTo(
      this.plane().nativeElement,
      { scale: 1.04 },
      { scale: 1, duration: duration.epic },
      heroCue.plane,
    );

    tl.fromTo(
      this.circle().nativeElement,
      { scale: 0.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: duration.slow },
      heroCue.circle,
    );

    // Headline lines rise from their masks, characters staggered inside each line.
    const lineEls = this.lineRefs().map((ref) => ref.nativeElement);
    const charGroups = lineEls.map((line) => Array.from(line.querySelectorAll('[data-char]')));
    const fullLabel = this.copy.lines.join(' ');

    this.headline().nativeElement.setAttribute('aria-label', fullLabel);

    charGroups.forEach((chars, lineIndex) => {
      tl.fromTo(
        chars,
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: duration.slow,
          stagger: heroCue.charStagger,
        },
        heroCue.headline + lineIndex * heroCue.lineStagger,
      );
    });

    // S2 + L4: a single soft contact shadow, animated with transforms only.
    tl.fromTo(
      this.fish().nativeElement,
      { x: 120, y: 40, scale: 0.85, rotation: -3 },
      { x: 0, y: 0, scale: 1, rotation: 0, duration: duration.epic },
      heroCue.fish,
    );

    tl.fromTo(
      this.shadow().nativeElement,
      { scaleX: 0.7, opacity: 0 },
      { scaleX: 1, opacity: 1, duration: duration.base },
      heroCue.shadow,
    );

    // Line art draws inside the master timeline, not on its own trigger.
    this.lineArt().revealIn(tl, heroCue.lineArt);

    const labels = this.host.nativeElement.querySelectorAll('[data-hero-label]');
    tl.fromTo(
      labels,
      { yPercent: 110, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: duration.base, stagger: 0.08 },
      heroCue.labels,
    );

    // Scroll cue: a looping nudge that starts once everything else has landed.
    tl.fromTo(
      '[data-scroll-cue]',
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: duration.base },
      heroCue.header,
    );

    tl.to('[data-scroll-cue] > span', {
      y: 8,
      duration: 0.8,
      repeat: -1,
      yoyo: true,
      ease: ease.linear,
    });
  }

  /** S4 — scrubbed: the fish drifts up slower than the page, type drifts the other way. */
  private buildScroll(): void {
    gsap.timeline({
      scrollTrigger: {
        trigger: this.root().nativeElement,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
      },
    })
      .to(this.fish().nativeElement, {
        yPercent: heroScroll.fishYPercent,
        scale: heroScroll.fishScaleTo,
        ease: ease.linear,
      })
      .to(this.headline().nativeElement, {
        yPercent: heroScroll.headlineYPercent,
        ease: ease.linear,
      }, 0)
      .to(this.circle().nativeElement, {
        scale: heroScroll.circleScaleTo,
        ease: ease.linear,
      }, 0);
  }

  /** §4.2 — one listener, quickTo per layer, live only while the hero is in view. */
  private buildParallax(): void {
    const layers = [
      { el: this.fish().nativeElement, ...parallax.fish },
      { el: this.circle().nativeElement, ...parallax.circle },
      { el: this.headline().nativeElement, ...parallax.headline },
      { el: this.plane().nativeElement, ...parallax.background },
    ];

    const setters = layers.map(({ el, x, y, rotate }) => ({
      xTo: gsap.quickTo(el, 'x', { duration: parallax.followDuration, ease: 'power3' }),
      yTo: gsap.quickTo(el, 'y', { duration: parallax.followDuration, ease: 'power3' }),
      rTo: gsap.quickTo(el, 'rotation', { duration: parallax.followDuration, ease: 'power3' }),
      x,
      y,
      rotate,
    }));

    let enabled = false;

    const onMove = (event: MouseEvent) => {
      if (!enabled) return;
      const cx = event.clientX / globalThis.innerWidth - 0.5;
      const cy = event.clientY / globalThis.innerHeight - 0.5;
      for (const layer of setters) {
        layer.xTo(cx * layer.x * 2);
        layer.yTo(cy * layer.y * 2);
        if (layer.rotate) layer.rTo(cx * layer.rotate * 2);
      }
    };

    globalThis.addEventListener('mousemove', onMove, { passive: true });

    ScrollTrigger.create({
      trigger: this.root().nativeElement,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (enabled = self.isActive),
    });

    this.host.nativeElement.addEventListener('mouseleave', () => (enabled = false));
  }
}