import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { FishProduct } from '../../sections/fish-explorer/fish-product';
import { QuickAdd } from '../../sections/fish-explorer/quick-add';
import { fish, type Availability, type Fish } from '../../core/data/fish';
import { copy } from '../../core/data/copy';

type Filter = 'all' | 'fresh-today' | 'on-order';

/** Brief §5 lists Home / Shop / Story. This is the Shop page. */
@Component({
  selector: 'app-shop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FishProduct, QuickAdd],
  templateUrl: './shop.html',
  host: { class: 'block' },
})
export class Shop {
  protected readonly copy = copy.shop;

  protected readonly filters: { id: Filter; label: string }[] = [
    { id: 'all', label: copy.shop.filterAll },
    { id: 'fresh-today', label: copy.shop.filterFresh },
    { id: 'on-order', label: copy.shop.filterOnOrder },
  ];

  protected readonly active = signal<Filter>('all');
  protected readonly selected = signal<Fish | null>(null);

  protected readonly items = computed(() => {
    const filter = this.active();
    if (filter === 'all') return fish;
    return fish.filter((item) => item.availability === (filter as Availability));
  });

  protected setFilter(filter: Filter): void {
    this.active.set(filter);
  }

  protected open(item: Fish): void {
    if (item.availability === 'sold-out') return;
    this.selected.set(item);
  }
}