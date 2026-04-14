import { VerificationError } from '@aas-core-works/aas-core3.1-typescript/verification';

import { Component, inject, Input, input, linkedSignal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { V3EditorUiStateStoreService } from '../../v3-editor-ui-state-store.service';
import { ErrorLineComponent } from '../error-line/error-line.component';
import { ErrorHandlingAction } from '../v3-component-base';

@Component({
  selector: 'aas-error-panel',

  imports: [TranslateModule, ButtonModule, PanelModule, MessageModule, ErrorLineComponent],
  templateUrl: './error-panel.component.html',
})
export class ErrorPanelComponent {
  uiStateStore = inject(V3EditorUiStateStoreService);
  @Input() parent: any;
  errorArr = input.required<{ error: VerificationError; action: ErrorHandlingAction }[]>();
  ErrorHandlingAction = ErrorHandlingAction;

  hasErrors = linkedSignal(() => this.errorArr().length > 0);
}
