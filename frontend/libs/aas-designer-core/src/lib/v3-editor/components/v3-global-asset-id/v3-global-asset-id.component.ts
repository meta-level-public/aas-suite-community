import { openShellSelectDialog } from '@aas/common-components';
import { PortalService } from '@aas/common-services';
import { IdGenerationUtil } from '@aas/helpers';
import { Component, inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { DialogService } from 'primeng/dynamicdialog';
import { InputText } from 'primeng/inputtext';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { V3TreeService } from '../../v3-tree/v3-tree.service';

@Component({
  selector: 'aas-v3-global-asset-id',
  templateUrl: './v3-global-asset-id.component.html',
  imports: [FormsModule, InputText, V3UndoDirective, NullIfEmptyDirective, Button, TranslateModule],
})
export class V3GlobalAssetIdComponent {
  @Input({ required: true }) content: any;
  // Offers picking the global asset ID of another AAS from the system (e.g. for entities)
  @Input() shellSelectable: boolean = false;

  private portalService = inject(PortalService);
  private dialogService = inject(DialogService);
  private translateService = inject(TranslateService);
  private treeService = inject(V3TreeService);

  generateIri() {
    if (this.content != null)
      this.content.globalAssetId = IdGenerationUtil.generateIri('asset', this.portalService.iriPrefix);
  }

  async selectShell() {
    const shell = await openShellSelectDialog(this.dialogService, this.translateService.instant('SELECT_SHELL'));
    if (shell?.globalAssetId && this.content != null) {
      this.content.globalAssetId = shell.globalAssetId;
      this.treeService.registerFieldUndoStep();
    }
  }
}
