import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { brand } from '../../core/data/brand';

/**
 * Brief I3 / I4. Every fish on the site renders through here.
 *
 * - `src` is a filename inside `public/fish/`. Pass null and we draw the
 *   hand-built SVG silhouette instead, so a missing photograph never breaks
 *   a build and never leaves a grey box.
 * - width/height are always explicit: these are transparent PNGs with no
 *   intrinsic layout, so without them the page shifts as images land.
 * - Only the hero fish is eager + high priority; everything else is lazy.
 */
@Component({
  selector: 'app-fish-image',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './fish-image.html',
  host: {
    class: 'block',
    '[style.width]': 'width()',
    '[style.height]': 'height()',
  },
})
export class FishImage {
  /** Filename in `public/fish/`, or null to force the SVG fallback. */
  readonly src = input<string | null>(null);
  /** Accessible description. Never empty. */
  readonly alt = input.required<string>();
  readonly width = input('100%');
  readonly height = input('100%');
  /** Hero only: skips lazy loading and hints high priority. */
  readonly eager = input(false);
  /** Intrinsic pixel size, used for width/height attributes against the real file. */
  readonly intrinsic = input<{ w: number; h: number } | null>(null);
  /** Two-tone pairing for the SVG fallback (brief I4). */
  readonly accent = input<'turquoise' | 'peach' | 'coral' | 'ocean' | 'sand'>('turquoise');

  readonly href = computed(() => (this.src() ? `fish/${this.src()}` : null));
  readonly showPhoto = computed(() => this.href() !== null);

  readonly dimensions = computed(() => {
    const size = this.intrinsic();
    return size ? `${size.w} ${size.h}` : null;
  });

  readonly brandName = brand.name;
}