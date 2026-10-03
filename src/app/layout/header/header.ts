import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { brand } from '../../core/data/brand';
import { copy } from '../../core/data/copy';
import { CartService } from '../../core/cart/cart.service';

/**
 * Brief S1: floating, part of the artwork. No background bar, hairline only,
 * colour inverts per section via `mix-blend-difference` so it stays legible
 * over cream, navy, coral and peach without any section-specific styling.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  host: { class: 'fixed inset-x-0 top-0 z-40 mix-blend-difference text-cream' },
})
export class Header {
  protected readonly copy = copy.nav;
  protected readonly brand = brand;

  private readonly cart = inject(CartService);
  protected readonly count = computed(() => this.cart.count());

  protected readonly menuOpen = signal(false);

  protected readonly links = [
    { label: copy.nav.shop, path: '/shop' },
    { label: copy.nav.about, path: '/story' },
  ] as const;

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected openCart(): void {
    this.closeMenu();
    this.cart.open.set(true);
  }
}