import { SelectionCardComponent } from '@aas/aas-designer-shared';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'lib-dpp-core-assistant',
  imports: [TranslateModule, SelectionCardComponent],
  templateUrl: './dpp-core-assistant.html',
  styleUrl: './dpp-core-assistant.scss',
  host: {
    class: 'block h-full w-full',
  },
})
export class DppCoreAssistant {
  @Input() loading: boolean = false;
  @Output() chooseAssistant = new EventEmitter<void>();

  onChoose() {
    if (this.loading) {
      return;
    }

    this.chooseAssistant.emit();
  }
}
