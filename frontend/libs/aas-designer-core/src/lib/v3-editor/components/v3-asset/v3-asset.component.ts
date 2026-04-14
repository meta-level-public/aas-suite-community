import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { AasResultListComponent } from '@aas/bom-diagram';
import { SearchForAssetComponent } from '@aas/bom-diagram';
import { HelpLabelComponent } from '@aas/common-components';
import { AppConfigService } from '@aas/common-services';
import { FilenameHelper } from '@aas/helpers';
import { ShellResult } from '@aas/model';
import { Component, inject, Input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputGroup } from 'primeng/inputgroup';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { V3UndoDirective } from '../../../general/directives/v3-undo.directive';
import { Info } from '../../../general/model/info-item';
import { V3TreeService } from '../../v3-tree/v3-tree.service';
import { V3ComponentBase } from '../v3-component-base';
import { V3GlobalAssetIdComponent } from '../v3-global-asset-id/v3-global-asset-id.component';
import { V3ResourceComponent } from '../v3-resource/v3-resource.component';
import { V3SpecificAssetIdsComponent } from '../v3-specific-asset-ids/v3-specific-asset-ids.component';
type VerificationError = aas.verification.VerificationError;

@Component({
  selector: 'aas-v3-asset',
  templateUrl: './v3-asset.component.html',
  styleUrls: ['../../../../host.scss'],
  imports: [
    Button,
    HelpLabelComponent,
    Select,
    V3UndoDirective,
    FormsModule,
    InputGroup,
    InputText,
    Dialog,
    AasResultListComponent,
    V3ResourceComponent,
    Message,
    V3GlobalAssetIdComponent,
    V3SpecificAssetIdsComponent,
    TranslateModule,
  ],
})
export class V3AssetComponent extends V3ComponentBase {
  @Input() asset: aas.types.AssetInformation | undefined | null;
  @Input() assetParent: aas.types.AssetAdministrationShell | undefined | null;
  @Input() shellResult: ShellResult | undefined;
  dialogService = inject(DialogService);
  translate = inject(TranslateService);
  appConfigService = inject(AppConfigService);
  info = Info;
  assetKind = aas.types.AssetKind;

  showTypeAsset = signal(false);

  constructor(private treeService: V3TreeService) {
    super();
  }

  addAsset() {
    if (this.asset == null && this.assetParent != null) {
      this.assetParent.assetInformation = new aas.types.AssetInformation(aas.types.AssetKind.Instance);
      this.asset = this.assetParent.assetInformation;
      this.treeService.registerFieldUndoStep();
    }
  }

  getValueError() {
    const errors: VerificationError[] = [];
    if (this.asset != null) {
      for (const error of aas.verification.verify(this.asset)) {
        errors.push(error);
      }
    }
    return errors.filter(
      (e) =>
        (e.path.segments[0] as any)?.name === 'value' ||
        e.message ===
          'Constraint AASd-131: Either the global asset ID shall be defined or at least one specific asset ID.',
    );
  }
  hasValueErrors() {
    const errors = [];
    if (this.asset != null) {
      for (const error of aas.verification.verify(this.asset)) {
        errors.push(error);
      }
    }
    return (
      errors.filter((e) => (e.path.segments[0] as any)?.name === 'value').length > 0 ||
      errors.filter(
        (e) =>
          e.message ===
          'Constraint AASd-131: Either the global asset ID shall be defined or at least one specific asset ID.',
      ).length > 0
    );
  }

  get thumbnailContentTypeError() {
    if (this.asset != null && this.asset.defaultThumbnail != null) {
      if (this.asset.defaultThumbnail.contentType == null) {
        return true;
      }
      if (!FilenameHelper.isImageContentType(this.asset.defaultThumbnail.contentType)) {
        return true;
      }
    }
    return false;
  }

  search() {
    const ref = this.dialogService.open(SearchForAssetComponent, {
      header: this.translate.instant('SEARCH_FOR_ASSET'),
      width: '50%',
      data: {
        apiUrl: this.appConfigService.config.apiPath,
      },
      closable: true,
    });

    ref?.onClose.subscribe((foundAsset: any) => {
      if (foundAsset == null) return;
      if (this.asset != null) {
        this.asset.assetType = foundAsset.globalAssetId;
      }
    });
  }
}
