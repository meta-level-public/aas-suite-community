import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { BaSyxPassport } from './basyx-passport';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-basyx-view',
  standalone: true,
  imports: [IconComponent, NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './basyx-view.component.html',
})
export class BaSyxViewComponent {
  readonly view = input.required<BaSyxPassport>();

  protected scrollTo(id: string): void {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
