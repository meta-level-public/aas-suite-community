import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { VerificationError } from '@aas-core-works/aas-core3.1-typescript/verification';
import { HelpLabelComponent } from '@aas/common-components';
import { ShellResult } from '@aas/model';
import { NgClass } from '@angular/common';
import { Component, input, Input } from '@angular/core';
import { Fieldset } from 'primeng/fieldset';
import { Info } from '../../../general/model/info-item';
import { V3TreeItem } from '../../model/v3-tree-item';
import { EndpointUrlComponent } from '../endpoint-url/endpoint-url.component';
import { ErrorPanelComponent } from '../error-panel/error-panel.component';
import { V3AdministrationComponent } from '../v3-administration/v3-administration.component';
import { V3AssetComponent } from '../v3-asset/v3-asset.component';
import { V3CategoryComponent } from '../v3-category/v3-category.component';
import { ErrorHandlingAction, V3ComponentBase } from '../v3-component-base';
import { V3IdShortComponent } from '../v3-id-short/v3-id-short.component';
import { V3IdComponent } from '../v3-id/v3-id.component';
import { V3LangStringListComponent } from '../v3-lang-string-list/v3-lang-string-list.component';
import { V3ReferenceComponent } from '../v3-reference/v3-reference.component';

@Component({
  selector: 'aas-v3-shell',
  templateUrl: './v3-shell.component.html',
  imports: [
    Fieldset,
    NgClass,
    HelpLabelComponent,
    V3IdComponent,
    V3IdShortComponent,
    V3LangStringListComponent,
    V3CategoryComponent,
    ErrorPanelComponent,
    V3AdministrationComponent,
    V3ReferenceComponent,
    V3AssetComponent,
    EndpointUrlComponent,
  ],
})
export class V3ShellComponent extends V3ComponentBase {
  shell = input<V3TreeItem<aas.types.AssetAdministrationShell> | undefined>();

  @Input() shellResult: ShellResult | undefined;

  info = Info;
  shellType = aas.types.KeyTypes.AssetAdministrationShell;

  constructor() {
    super();
  }

  assetErrors() {
    const errors: { error: VerificationError; action: ErrorHandlingAction }[] = [];
    const assetInfo = this.shell()?.content?.assetInformation;
    if (assetInfo != null) {
      for (const error of aas.verification.verify(assetInfo)) {
        if (error.message.includes('RFC 8089')) continue;
        errors.push({ error: error, action: this.getAction(error) });
      }
    }
    return errors;
  }

  hasAssetErrors() {
    return this.assetErrors().length > 0;
  }

  detailErrors() {
    const errors: { error: VerificationError; action: ErrorHandlingAction }[] = [];
    const details = this.shell()?.content;
    if (details != null) {
      for (const error of aas.verification.verify(details, false)) {
        errors.push({ error: error, action: this.getAction(error) });
      }
    }
    return errors;
  }

  hasDetailErrors() {
    return this.detailErrors().length > 0;
  }
}
