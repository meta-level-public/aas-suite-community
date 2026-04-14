import { IdGenerationUtil } from '@aas/helpers';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { NullIfEmptyDirective } from '../../../general/directives/null-if-empty.directive';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { PortalService } from '@aas/common-services';

@Component({
  selector: 'aas-v3-global-asset-id',
  templateUrl: './v3-global-asset-id.component.html',
  imports: [FormsModule, InputText, V3UndoDirective, NullIfEmptyDirective, Button, TranslateModule],
})
export class V3GlobalAssetIdComponent {
  @Input({ required: true }) content: any;

  constructor(private portalService: PortalService) {}

  generateIri() {
    if (this.content != null)
      this.content.globalAssetId = IdGenerationUtil.generateIri('asset', this.portalService.iriPrefix);
  }
}
