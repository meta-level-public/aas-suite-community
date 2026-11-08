import { AasInfrastructureSettingsDto, HeaderParameter } from '@aas/webapi-client';
import { NgClass } from '@angular/common';
import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from '@openng/optimus-ui/button';
import { DividerModule } from '@openng/optimus-ui/divider';
import { FileUploadModule } from '@openng/optimus-ui/fileupload';
import { InputTextModule } from '@openng/optimus-ui/inputtext';
import { MessageModule } from '@openng/optimus-ui/message';
import { PasswordModule } from '@openng/optimus-ui/password';
import { TableModule } from '@openng/optimus-ui/table';
import { TagModule } from '@openng/optimus-ui/tag';
import { TextareaModule } from '@openng/optimus-ui/textarea';
import { ToggleSwitchModule } from '@openng/optimus-ui/toggleswitch';
import { ToolbarModule } from '@openng/optimus-ui/toolbar';
import { HasChangesCheckable } from '../../my-organisation/has-changes-checkable';

@Component({
  selector: 'aas-infrastructure-add',
  imports: [
    TableModule,
    TranslateModule,
    TagModule,
    ToolbarModule,
    ButtonModule,
    ToggleSwitchModule,
    FormsModule,
    NgClass,
    InputTextModule,
    TextareaModule,
    MessageModule,
    FileUploadModule,
    PasswordModule,
    DividerModule,
  ],
  templateUrl: './infrastructure-add.component.html',
  styleUrls: ['../../../../host.scss'],
  changeDetection: ChangeDetectionStrategy.Eager,
  providers: [{ provide: HasChangesCheckable, useExisting: InfrastructureAddComponent }],
})
export class InfrastructureAddComponent extends HasChangesCheckable {
  settings = input.required<AasInfrastructureSettingsDto>();
  settingsBackup = computed(() => {
    return JSON.stringify(this.settings());
  });
  loading = input.required();

  addHeaderRow() {
    if (this.settings().headerParameters == null) {
      this.settings().headerParameters = [];
    }
    this.settings().headerParameters?.push(new HeaderParameter());
  }

  removeHeaderRow(headerParameter: HeaderParameter) {
    this.settings().headerParameters = this.settings().headerParameters?.filter((x) => x !== headerParameter);
  }

  async setCertificateFile(event: any) {
    if (event.files.length > 0) {
      const file = event.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const binaryString = String.fromCharCode(...new Uint8Array(arrayBuffer));
        const text = window.btoa(binaryString);
        this.settings().certificate = text;
      };
      reader.readAsArrayBuffer(file);
    }
  }

  override hasChanges(): boolean {
    return JSON.stringify(this.settings() ?? '') !== this.settingsBackup();
  }

  override isInEditMode(): boolean {
    return true;
  }

  override cancelEditing() {
    //nothing to do
  }
}
