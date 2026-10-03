import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Hero } from '../../sections/hero/hero';
import { FishExplorer } from '../../sections/fish-explorer/fish-explorer';
import { FreshToday } from '../../sections/fresh-today/fresh-today';
import { StorySection } from '../../sections/story-section/story-section';
import { Mediterranean } from '../../sections/mediterranean/mediterranean';
import { FinalCta } from '../../sections/final-cta/final-cta';

/** D1: this page composes sections only — no section logic lives here. */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Hero, FishExplorer, FreshToday, StorySection, Mediterranean, FinalCta],
  template: `
    <app-hero />
    <app-fish-explorer />
    <app-fresh-today />
    <app-story-section />
    <app-mediterranean />
    <app-final-cta />
  `,
})
export class Home {}