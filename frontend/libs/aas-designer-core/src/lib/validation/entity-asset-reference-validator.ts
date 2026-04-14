import { AssetAdministrationShellEnvironment } from '@aas/model';
import { ValidationError } from './validation-error';

export class EntityAssetReferenceValidator {
  static validateMissingEntityAssetRefRecursive(element: any, fullAasx: any, validationErrors: ValidationError[]) {
    if (element.modelType?.name === 'Entity') {
      if (element.entityType === 'SelfManagedEntity') {
        const ref = this.searchAssetRecursive(fullAasx, element.asset.keys[0].value, element.asset.keys[0].idType);
        if (ref == null) {
          const err: ValidationError = {
            message: 'MISSING_ENTITY_ASSET_REF',
            uuid: element.mlGenUuid,
            value: element.asset.keys[0].value,
            valueType: '',
            severity: 'error',
          };
          validationErrors.push(err);
        }
      }
    } else {
      if (element.modelType?.name === 'SubmodelElementCollection' && element.value != null) {
        for (const smce of element.value) {
          this.validateMissingEntityAssetRefRecursive(smce, fullAasx, validationErrors);
        }
      } else if (element.modelType?.name === 'Submodel' && element.submodelElements != null) {
        for (const sme of element.submodelElements) {
          this.validateMissingEntityAssetRefRecursive(sme, fullAasx, validationErrors);
        }
      } else if (element.modelType?.name === 'Entity' && element.statements != null) {
        for (const sme of element.statements) {
          this.validateMissingEntityAssetRefRecursive(sme, fullAasx, validationErrors);
        }
      }
    }
  }

  static searchAssetRecursive(element: any, idToFind: string, idTypeToFind: string): any {
    if (
      element.modelType?.name === 'Asset' &&
      element.identification?.id === idToFind &&
      element.identification?.idType === idTypeToFind
    ) {
      return element;
    } else {
      if (element instanceof AssetAdministrationShellEnvironment) {
        for (const asset of element.assets) {
          const res = this.searchAssetRecursive(asset, idToFind, idTypeToFind);
          if (res) return res;
        }
      }
    }

    return null;
  }
}
