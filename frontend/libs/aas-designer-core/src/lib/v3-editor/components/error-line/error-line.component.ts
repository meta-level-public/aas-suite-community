import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { AssetAdministrationShell, KeyTypes, Reference } from '@aas-core-works/aas-core3.1-typescript/types';
import { VerificationError } from '@aas-core-works/aas-core3.1-typescript/verification';

import { Component, Input, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ErrorHandlingAction } from '../v3-component-base';

@Component({
  selector: 'aas-error-line',

  imports: [TranslateModule, ButtonModule, MessageModule],
  templateUrl: './error-line.component.html',
})
export class ErrorLineComponent {
  @Input({ required: true }) parent: any;
  @Input({ required: true }) errorEntry: { error: VerificationError; action: ErrorHandlingAction } | undefined;
  showPath = input(true);

  ErrorHandlingAction = ErrorHandlingAction;

  setNull(error: VerificationError) {
    let path = error.path.toString();
    if (path.startsWith('.')) path = path.substring(1);
    // wenn kein . enthalten ist, dann ist es ein top level attribut
    const parentContent = this.parent;
    if (path.indexOf('.') === -1) {
      if (parentContent != null && (parentContent as any)[path] != null) {
        (parentContent as any)[path] = null;
      }
    } else {
      const pathArray = path.split('.');
      path = pathArray.slice(0, pathArray.length - 1).join('.');
      if (parentContent != null && (parentContent as any)[path] != null) {
        (parentContent as any)[path] = null;
      }
    }
  }

  fixSubmodelReferencesMustBeModelReferences(_error: VerificationError) {
    const parentContent = this.parent;
    if (parentContent != null && parentContent instanceof AssetAdministrationShell) {
      parentContent.submodels?.forEach((submodel) => {
        if (submodel.type !== aas.types.ReferenceTypes.ModelReference) {
          submodel.type = aas.types.ReferenceTypes.ModelReference;
        }

        if ((submodel.keys?.length ?? 0) > 0) {
          // For AAS.submodels the reference must point to a submodel.
          submodel.keys = [submodel.keys![0]];
          submodel.keys[0].type = aas.types.KeyTypes.Submodel;
        }
      });
    }
  }

  fixExternalReferences(error: VerificationError) {
    // eslint-disable-next-line no-console
    console.log('fixExternalRefernces', error);
    const parentContent = this.parent;
    // eslint-disable-next-line no-console
    console.log(parentContent);
    if (parentContent != null && parentContent instanceof Reference) {
      parentContent.type = aas.types.ReferenceTypes.ExternalReference;
      parentContent.keys.forEach((key) => {
        key.type = KeyTypes.GlobalReference;
      });
    }
  }
}
