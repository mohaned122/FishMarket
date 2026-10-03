import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { brand, deliveryZones, openingHours } from '../../core/data/brand';
import { copy } from '../../core/data/copy';

/** Brief K3: Footer is ink on cream with sand accents. */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <footer class="bg-ink px-5 pt-20 pb-10 text-cream md:px-8">
      <div class="grid gap-12 md:grid-cols-3">
        <div>
          <p class="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.85]">
            {{ brand.name }}
          </p>
          <p class="mt-4 max-w-[34ch] text-[0.95rem] leading-relaxed opacity-70">
            {{ copy.line }}
          </p>
        </div>

        <div>
          <h2 class="micro-label opacity-50">{{ copy.hoursLabel }}</h2>
          <ul class="mt-4 space-y-2">
            @for (slot of hours; track slot.day) {
              <li class="flex justify-between gap-4 text-[0.95rem]">
                <span class="opacity-70">{{ slot.day }}</span>
                <span class="tabular-nums">{{ slot.hours }}</span>
              </li>
            }
          </ul>
        </div>

        <div>
          <h2 class="micro-label opacity-50">{{ copy.deliveryLabel }}</h2>
          <ul class="mt-4 space-y-2">
            @for (zone of zones; track zone) {
              <li class="text-[0.95rem] opacity-70">{{ zone }}</li>
            }
          </ul>
          <nav class="mt-8 flex flex-col items-start gap-2">
            <a routerLink="/shop" class="micro-label underline underline-offset-4">{{ nav.shop }}</a>
            <a routerLink="/story" class="micro-label underline underline-offset-4">{{ nav.about }}</a>
          </nav>
        </div>
      </div>

      <div class="hairline mt-16 h-px w-full text-current opacity-25"></div>

      <div class="mt-6 flex flex-wrap justify-between gap-4">
        <p class="micro-label opacity-50">© {{ year }} {{ brand.name }}</p>
        <p class="micro-label opacity-50">{{ copy.rights }}</p>
      </div>
    </footer>
  `,
})
export class Footer {
  protected readonly brand = brand;
  protected readonly copy = copy.footer;
  protected readonly nav = copy.nav;
  protected readonly hours = openingHours;
  protected readonly zones = deliveryZones;
  protected readonly year = new Date().getFullYear();
}