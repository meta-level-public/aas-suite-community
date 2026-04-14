import { AssetAdministrationShellEnvironment } from '@aas/model';
import { Injectable } from '@angular/core';
import { find } from 'lodash-es';
import { ValidationError } from './validation-error';

@Injectable({
  providedIn: 'root',
})
export class SemanticIdValidator {
  static validate(fullAasx: AssetAdministrationShellEnvironment, validationErrors: ValidationError[]) {
    for (const model of fullAasx?.submodels ?? []) {
      this.validateSemanticIdRecursive(model, validationErrors);
    }
  }

  static validateSemanticIdRecursive(element: any, validationErrors: ValidationError[]) {
    switch (element.modelType?.name) {
      case 'Property':
      case 'File':
      case 'MultiLanguageProperty':
      case 'Operation':
      case 'Entity':
      case 'RelationElement':
      case 'ReferenceElement':
      case 'SubmodelElementCollection':
      case 'Capability':
        if (!this.hasConceptDescription(element)) {
          this.addMessage(element, 'CONCEPT_DESCRIPTION_MISSING', 'hint', validationErrors);
        }
        for (const key of element.semanticId?.keys ?? []) {
          // prüfen ob alle elemente vorhanden
          if (!this.isSemanticIdValid(key)) {
            this.addMessage(element, 'SEMANTIC_ID_INVALID', 'error', validationErrors);
          }
        }
        break;
      case 'Submodel':
        for (const key of element.semanticId?.keys ?? []) {
          // prüfen ob alle elemente vorhanden
          if (!this.isSemanticIdValid(key)) {
            this.addMessage(element, 'SEMANTIC_ID_INVALID', 'error', validationErrors);
          }
        }
        break;
    }

    if (element.modelType?.name === 'SubmodelElementCollection' && element.value != null) {
      for (const smce of element.value) {
        this.validateSemanticIdRecursive(smce, validationErrors);
      }
    } else if (element.modelType?.name === 'Submodel' && element.submodelElements != null) {
      for (const sme of element.submodelElements) {
        this.validateSemanticIdRecursive(sme, validationErrors);
      }
    } else if (element.modelType?.name === 'Entity' && element.statements != null) {
      for (const sme of element.statements) {
        this.validateSemanticIdRecursive(sme, validationErrors);
      }
    }
  }

  static isSemanticIdValid(semId: any) {
    return !(semId.idType == null || semId.type == null || semId.local == null || semId.value == null);
  }

  static getConceptDescription(element: any) {
    return find(element.semanticId.keys, { type: 'ConceptDescription' });
  }

  static hasConceptDescription(element: any) {
    if (element.semanticId?.keys == null) {
      return false;
    }
    return find(element.semanticId.keys, { type: 'ConceptDescription' }) != null;
  }

  static addMessage(element: any, message: string, severity: 'hint' | 'error', validationErrors: ValidationError[]) {
    validationErrors.push({
      message,
      severity,
      uuid: element.mlGenUuid,
      value: element.idShort,
      valueType: '',
    });
  }
}
