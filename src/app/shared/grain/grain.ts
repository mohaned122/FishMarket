import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Brief I6: one fixed, static grain overlay. An inline SVG `feTurbulence`
 * data-URI as a Tailwind arbitrary background, `mix-blend-multiply`, barely
 * visible. No animation, no pointer events, and it must not create a
 * containing block that would break the fixed cursor.
 */
@Component({
  selector: 'app-grain',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      aria-hidden="true"
      class="pointer-events-none fixed inset-0 z-50 opacity-[0.055] mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter%20id=%27n%27%3E%3CfeTurbulence%20type=%27fractalNoise%27%20baseFrequency=%270.8%27%20numOctaves=%274%27%20stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect%20width=%27100%25%27%20height=%27100%25%27%20filter=%27url(%23n)%27/%3E%3C/svg%3E')]"
    ></div>
  `,
})
export class Grain {}