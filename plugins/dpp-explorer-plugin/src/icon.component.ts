import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { iconPaths, type IconName } from './icons';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'icon', 'aria-hidden': 'true' },
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
    stroke-linecap="round" stroke-linejoin="round">@for (d of paths(); track $index) {<path [attr.d]="d" />}</svg>`,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  protected readonly paths = computed(() => iconPaths[this.name()] ?? iconPaths.info);
}
