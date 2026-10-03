import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StorySection } from '../../sections/story-section/story-section';
import { FinalCta } from '../../sections/final-cta/final-cta';
import { copy } from '../../core/data/copy';

/** Brief §5 lists Home / Shop / Story. This is the Story page. */
@Component({
  selector: 'app-story-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StorySection, FinalCta],
  template: `
    <app-story-section />
    <app-final-cta />
  `,
})
export class StoryPage {
  protected readonly copy = copy.story;
}