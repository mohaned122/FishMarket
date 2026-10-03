import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { CartDrawer } from './layout/cart-drawer/cart-drawer';
import { Cursor } from './shared/cursor/cursor';
import { Grain } from './shared/grain/grain';

/**
 * Shell only (D1): persistent chrome around the routed pages. No section logic,
 * no data fetching.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer, CartDrawer, Cursor, Grain],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}