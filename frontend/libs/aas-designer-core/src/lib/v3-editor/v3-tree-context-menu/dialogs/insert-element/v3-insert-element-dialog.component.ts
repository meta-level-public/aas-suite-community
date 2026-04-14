import { Component, input, model } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { HelpLabelComponent } from '@aas/common-components';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CMTypeOption } from '../../../model/cm-type-option';

export interface AvailableElementItem {
  label: string;
  translatedLabel: string;
  description: string;
  createElement: CMTypeOption;
}

@Component({
  selector: 'aas-v3-insert-element-dialog',
  templateUrl: './v3-insert-element-dialog.component.html',

  imports: [TranslateModule, DialogModule, TableModule, ButtonModule, InputTextModule, HelpLabelComponent],
})
export class V3InsertElementDialogComponent {
  // Two-way bound input for dialog visibility
  visible = model<boolean>(false);
  // Input list of elements
  availableElements = input<AvailableElementItem[]>([]);
  // Signal-based result for signal-friendly consumption
  selectedElement = model<AvailableElementItem | null>(null);

  onHide() {
    this.visible.set(false);
  }

  onApply(element: AvailableElementItem) {
    // set signal result (parent can react via two-way binding and effects)
    this.selectedElement.set(element);
  }

  getEventValue(event: any): string {
    return event?.target?.value ?? '';
  }
}
