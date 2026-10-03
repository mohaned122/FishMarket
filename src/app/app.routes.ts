import { Routes } from '@angular/router';

import { Home } from './pages/home/home';
import { Shop } from './pages/shop/shop';
import { StoryPage } from './pages/story/story';

/**
 * These routes are prerendered (see `app.routes.server.ts`), so every component
 * must render on the server with no request-time data and no `window` access
 * outside a platform check.
 */
export const routes: Routes = [
  { path: '', component: Home, title: 'MARÉA — Fresh from the Mediterranean' },
  { path: 'shop', component: Shop, title: 'Shop — MARÉA' },
  { path: 'story', component: StoryPage, title: 'About — MARÉA' },
  { path: '**', redirectTo: '' },
];