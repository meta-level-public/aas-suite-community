import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { NotificationService } from '@aas/common-services';
import { ShellResult } from '@aas/model';
import { Component, inject, Input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Fieldset } from 'primeng/fieldset';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3TreeItem } from '../../model/v3-tree-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3ComponentBase } from '../v3-component-base';
type AssetAdministrationShell = aas.types.AssetAdministrationShell;
type Reference = aas.types.Reference;

@Component({
  selector: 'aas-v3-missing-submodel',
  templateUrl: './v3-missing-submodel.component.html',
  imports: [Fieldset, InputText, NullIfEmptyDirective, Button, FormsModule, Textarea, TranslateModule],
})
export class V3MissingSubmodelComponent extends V3ComponentBase {
  @Input({ required: true }) submodelRef: V3TreeItem<any> | undefined;
  @Input({ required: true }) shellResult: ShellResult | undefined;

  importJsonActive = signal(false);
  jsonToImport = model('');
  notificationService = inject(NotificationService);

  constructor(private treeService: V3TreeService) {
    super();
  }

  removeSubmodel() {
    const aasShell = this.submodelRef?.parent?.content as AssetAdministrationShell;
    if (aasShell.submodels != null && this.submodelRef?.id != null) {
      aasShell.submodels = aasShell.submodels.filter((sm: any) => sm !== this.submodelRef?.content.data);
      this.treeService.deleteSmNode(this.submodelRef.id);
    }
  }

  get missingSubmodelReferenceId() {
    return this.submodelRef?.content?.data?.keys[0].value;
  }

  importJson() {
    this.importJsonActive.set(true);
  }

  cancelImportJson() {
    this.importJsonActive.set(false);
  }

  doImportJson() {
    let parsedJson;
    try {
      parsedJson = JSON.parse(this.jsonToImport());
    } catch (_e) {
      this.notificationService.showMessageAlways('ERROR_IMPORTING_JSON', 'ERROR', 'error');
      return;
    }

    const instanceOrErrorPlain = aas.jsonization.submodelFromJsonable(parsedJson);
    if (instanceOrErrorPlain.value != null && this.submodelRef != null) {
      const refId = (this.submodelRef.content.data as Reference).keys[0].value;
      const importId = instanceOrErrorPlain.value.id;

      if (refId !== importId) {
        this.notificationService.showMessageAlways('ERROR_IMPORTING_JSON_ID_DIFFERS', 'ERROR', 'error');
        return;
      }
      if (this.shellResult?.v3Shell != null) {
        if (this.shellResult?.v3Shell?.submodels == null) {
          this.shellResult.v3Shell.submodels = [];
        }
        this.shellResult.v3Shell.submodels.push(instanceOrErrorPlain.value);
        if (instanceOrErrorPlain.value.id != null) {
          (this.submodelRef.content.data as Reference).keys[0].value = instanceOrErrorPlain.value.id;
        }
        this.treeService.refreshWholeTree();
      }
    } else {
      this.notificationService.showMessageAlways('ERROR_IMPORTING_JSON', 'ERROR', 'error');
    }
  }
}
