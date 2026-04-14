import { AasInfrastructureSettingsDto, HeaderParameter } from '@aas/webapi-client';
import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToolbarModule } from 'primeng/toolbar';
import { HasChangesCheckable } from '../../my-organisation/has-changes-checkable';

@Component({
  selector: 'aas-infrastructure-edit',
  imports: [
    TableModule,
    FieldsetModule,
    TranslateModule,
    TagModule,
    ToolbarModule,
    ButtonModule,
    ToggleSwitchModule,
    FormsModule,
    InputTextModule,
    TextareaModule,
    MessageModule,
    FileUploadModule,
    PasswordModule,
    DividerModule,
  ],
  templateUrl: './infrastructure-edit.component.html',
  styleUrls: ['../../../../host.scss'],
  providers: [{ provide: HasChangesCheckable, useExisting: InfrastructureEditComponent }],
})
export class InfrastructureEditComponent extends HasChangesCheckable {
  settings = input.required<AasInfrastructureSettingsDto>();
  settingsBackup = computed(() => {
    return JSON.stringify(this.settings());
  });
  loading = input.required();

  editDisabled = computed(() => {
    if (this.settings()) {
      return this.settings().isInternal !== false;
    }
    return true;
  });

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

  override cancelEditing(): void {
    // nothing to do
  }
}
