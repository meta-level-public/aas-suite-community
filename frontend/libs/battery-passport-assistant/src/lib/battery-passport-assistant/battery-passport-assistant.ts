import { SelectionCardComponent } from '@aas/aas-designer-shared';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'lib-battery-passport-assistant',
  imports: [TranslateModule, SelectionCardComponent],
  templateUrl: './battery-passport-assistant.html',
  styleUrl: './battery-passport-assistant.scss',
  host: {
    class: 'block h-full w-full',
  },
})
export class BatteryPassportAssistant {
  @Input() loading: boolean = false;
  @Output() chooseAssistant = new EventEmitter<void>();

  onChoose() {
    if (this.loading) {
      return;
    }

    this.chooseAssistant.emit();
  }
}
