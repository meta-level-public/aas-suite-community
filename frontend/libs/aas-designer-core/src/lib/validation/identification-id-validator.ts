import { AssetAdministrationShellEnvironment } from '@aas/model';
import { Injectable } from '@angular/core';
import { ValidationError } from './validation-error';

@Injectable({
  providedIn: 'root',
})
export class IdentificationIdValidator {
  static validate(fullAasx: AssetAdministrationShellEnvironment, validationErrors: ValidationError[]) {
    for (const model of fullAasx?.submodels ?? []) {
      this.validateSubmodelId(model, fullAasx.submodels, validationErrors);
    }
    for (const model of fullAasx?.assetAdministrationShells ?? []) {
      this.validateShellId(model, fullAasx.assetAdministrationShells, validationErrors);
    }
  }

  static validateSubmodelId(submodel: any, allSubmodels: any[], validationErrors: ValidationError[]) {
    if (submodel.identification.id == null || submodel.identification.id === '')
      this.addMessage(submodel, 'SUBMODEL_ID_EMPTY', 'error', validationErrors);

    for (const sm of allSubmodels) {
      if (sm.identification.id === submodel.identification.id && sm !== submodel) {
        this.addMessage(submodel, 'SUBMODEL_ID_NOT_UNIQUE', 'error', validationErrors);
        return;
      }
    }
  }

  static validateShellId(shell: any, allShells: any[], validationErrors: ValidationError[]) {
    if (shell.identification.id == null || shell.identification.id === '') {
      this.addMessage(shell, 'SHELL_ID_EMPTY', 'error', validationErrors);
      return;
    }
    for (const s of allShells) {
      if (s.identification.id === shell.identification.id && s !== shell) {
        this.addMessage(shell, 'SHELL_ID_NOT_UNIQUE', 'error', validationErrors);
        return;
      }
    }
  }

  static addMessage(element: any, message: string, severity: 'hint' | 'error', validationErrors: ValidationError[]) {
    validationErrors.push({
      message,
      severity,
      uuid: element.mlGenUuid,
      value: element.identification.id,
      valueType: '',
    });
  }
}
