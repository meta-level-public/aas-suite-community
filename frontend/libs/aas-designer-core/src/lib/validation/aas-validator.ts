import { AppConfigService } from '@aas/common-services';
import { AssetAdministrationShellEnvironment } from '@aas/model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { AasSharedDataService } from '../asset-administration-shell-tree/services/aas-shared-data.service';
import { DatatypeValidatorFactory } from './datatype-validator-factory';
import { EntityAssetReferenceValidator } from './entity-asset-reference-validator';
import { IdentificationIdValidator } from './identification-id-validator';
import { SemanticIdValidator } from './semantic-id-validator';
import { ValidationError } from './validation-error';
import { ValidationService } from './validation.service';
@Injectable({
  providedIn: 'root',
})
export class AasValidatorService {
  constructor(
    private aasSharedDataService: AasSharedDataService,
    private validatorService: ValidationService,
    private http: HttpClient,
    private appConfigService: AppConfigService,
  ) {}

  async validateBasyx(id: number) {
    const params = new HttpParams().append('id', id);
    return lastValueFrom(
      this.http.get<string>(`${this.appConfigService.config.apiPath}/Aas/TryConvertToDotnetBasyxEnv`, { params }),
    );
  }

  async validate() {
    const validationErrors: ValidationError[] = [];
    const aas = this.aasSharedDataService.currentAas.value;

    if (this.aasSharedDataService.shellName == null || this.aasSharedDataService.shellName === '') {
      validationErrors.push({
        message: 'Filename not set',
        severity: 'error',
        uuid: this.aasSharedDataService.currentAasTreeShellRootNodeId,
      } as ValidationError);
    }

    if (aas != null) {
      for (const model of aas.submodels ?? []) {
        await this.validatePropertyDatatypeRecursive(model, validationErrors);
      }
      for (const model of aas?.submodels ?? []) {
        EntityAssetReferenceValidator.validateMissingEntityAssetRefRecursive(model, aas, validationErrors);
      }

      SemanticIdValidator.validate(aas, validationErrors);
      IdentificationIdValidator.validate(aas, validationErrors);
    }

    this.aasSharedDataService.validationErrors = validationErrors;

    return validationErrors;
  }

  async validatePropertyDatatypeRecursive(element: any, validationErrors: ValidationError[]) {
    if (element.modelType?.name === 'Property') {
      if (element.valueType != null) {
        const validator = DatatypeValidatorFactory.getValidator(element.valueType);
        if (validator.validatorType === 'regex') {
          const valid = element.value == null || element.value === '' || validator.filterRegex.test(element.value);
          if (valid === false) {
            const err: ValidationError = {
              message: validator.errorMessage,
              uuid: element.mlGenUuid,

              value: element.value,
              valueType: element.valueType,
              severity: 'error',
            };
            validationErrors.push(err);
          }
        }
        if (validator.validatorType === 'apiCall') {
          const valid = await this.validatorService.validate(element.value, validator.customValidator);
          if (valid === false) {
            const err: ValidationError = {
              message: validator.errorMessage,
              uuid: element.mlGenUuid,
              value: element.value,
              valueType: element.valueType,
              severity: 'error',
            };
            validationErrors.push(err);
          }
        }
      }
    } else {
      if (element.modelType?.name === 'SubmodelElementCollection' && element.value != null) {
        for (const smce of element.value) {
          await this.validatePropertyDatatypeRecursive(smce, validationErrors);
        }
      } else if (element.modelType?.name === 'Submodel' && element.submodelElements != null) {
        for (const sme of element.submodelElements) {
          await this.validatePropertyDatatypeRecursive(sme, validationErrors);
        }
      } else if (element.modelType?.name === 'Entity' && element.statements != null) {
        for (const sme of element.statements) {
          await this.validatePropertyDatatypeRecursive(sme, validationErrors);
        }
      }
    }
  }

  searchRecursive(element: any, idToFind: string, idTypeToFind: string): any {
    if (element.identification?.id === idToFind && element.identification?.idType === idTypeToFind) {
      return element;
    } else {
      if (element.modelType?.name === 'SubmodelElementCollection' && element.value != null) {
        for (const smce of element.value) {
          const res = this.searchRecursive(smce, idToFind, idTypeToFind);
          if (res) return res;
        }
      } else if (element.modelType?.name === 'Submodel' && element.submodelElements != null) {
        for (const sme of element.submodelElements) {
          const res = this.searchRecursive(sme, idToFind, idTypeToFind);
          if (res) return res;
        }
      } else if (element.modelType?.name === 'Entity' && element.statements != null) {
        for (const sme of element.statements) {
          const res = this.searchRecursive(sme, idToFind, idTypeToFind);
          if (res) return res;
        }
      } else if (element instanceof AssetAdministrationShellEnvironment && element.submodels != null) {
        for (const sm of element.submodels) {
          const res = this.searchRecursive(sm, idToFind, idTypeToFind);
          if (res) return res;
        }

        for (const sm of element.assetAdministrationShells) {
          const res = this.searchRecursive(sm, idToFind, idTypeToFind);
          if (res) return res;
        }
      }
    }

    return null;
  }
}
