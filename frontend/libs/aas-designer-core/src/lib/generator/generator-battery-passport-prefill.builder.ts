import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { MultiLanguagePropertyValue } from '@aas/model';

export interface BatteryPassportTechnicalDataPrefillSource {
  manufacturer?: MultiLanguagePropertyValue[];
  productDesignation?: MultiLanguagePropertyValue[];
}

export function prefillBatteryPassportTechnicalData(
  digitalNameplate: aas.types.Submodel | null | undefined,
  technicalData: aas.types.Submodel,
  source: BatteryPassportTechnicalDataPrefillSource | null | undefined,
) {
  if (digitalNameplate != null) {
    prefillTechnicalDataFromDigitalNameplate(digitalNameplate, technicalData);
  }

  setElementFromPropertyString(technicalData, ['ManufacturerName'], toSingleString(source?.manufacturer));
  setElementFromPropertyString(
    technicalData,
    ['ManufacturerProductDesignation', 'ProductDesignation'],
    toSingleString(source?.productDesignation),
  );
}

function prefillTechnicalDataFromDigitalNameplate(
  digitalNameplate: aas.types.Submodel,
  technicalData: aas.types.Submodel,
) {
  const sourceElementsBySemanticId = new Map<string, aas.types.ISubmodelElement>();

  walkSubmodelElements(digitalNameplate.submodelElements ?? [], (element) => {
    if (!isSemanticPrefillElement(element) || !hasSemanticPrefillValue(element)) {
      return;
    }

    getElementSemanticValues(element).forEach((semanticValue) => {
      if (!sourceElementsBySemanticId.has(semanticValue)) {
        sourceElementsBySemanticId.set(semanticValue, element);
      }
    });
  });

  walkSubmodelElements(technicalData.submodelElements ?? [], (element) => {
    if (!isSemanticPrefillElement(element)) {
      return;
    }

    const sourceElement = getElementSemanticValues(element)
      .map((semanticValue) => sourceElementsBySemanticId.get(semanticValue) ?? null)
      .find((candidate) => candidate != null);

    if (sourceElement != null) {
      copySemanticPrefillValue(sourceElement, element);
    }
  });
}

function setElementFromPropertyString(submodel: aas.types.Submodel, idShortAliases: string[], value: string) {
  walkSubmodelElements(submodel.submodelElements ?? [], (element) => {
    if (!matchesAlias(element.idShort, idShortAliases)) {
      return;
    }

    if (element.modelType.name === 'Property') {
      (element as aas.types.Property).value = value;
    } else if (element.modelType.name === 'MultiLanguageProperty') {
      (element as aas.types.MultiLanguageProperty).value = mlp2LangString([{ language: 'en', text: value }]);
    }
  });
}

function copySemanticPrefillValue(source: aas.types.ISubmodelElement, target: aas.types.ISubmodelElement) {
  if (target.modelType.name === 'Property') {
    (target as aas.types.Property).value = getElementPrefillStringValue(source);
    return;
  }

  if (target.modelType.name === 'MultiLanguageProperty') {
    (target as aas.types.MultiLanguageProperty).value = getElementPrefillMultiLanguageValue(source);
  }
}

function getElementPrefillStringValue(element: aas.types.ISubmodelElement) {
  if (element.modelType.name === 'Property') {
    return (element as aas.types.Property).value ?? '';
  }

  if (element.modelType.name === 'MultiLanguageProperty') {
    return langStringToSingleString((element as aas.types.MultiLanguageProperty).value ?? []);
  }

  return '';
}

function getElementPrefillMultiLanguageValue(element: aas.types.ISubmodelElement) {
  if (element.modelType.name === 'MultiLanguageProperty') {
    return ((element as aas.types.MultiLanguageProperty).value ?? []).map(
      (entry) => new aas.types.LangStringTextType(entry.language, entry.text),
    );
  }

  return mlp2LangString([{ language: 'en', text: getElementPrefillStringValue(element) }]);
}

function hasSemanticPrefillValue(element: aas.types.ISubmodelElement) {
  if (element.modelType.name === 'Property') {
    return `${(element as aas.types.Property).value ?? ''}`.trim() !== '';
  }

  if (element.modelType.name === 'MultiLanguageProperty') {
    return ((element as aas.types.MultiLanguageProperty).value ?? []).some((entry) => entry.text.trim() !== '');
  }

  return false;
}

function isSemanticPrefillElement(element: aas.types.ISubmodelElement) {
  return element.modelType.name === 'Property' || element.modelType.name === 'MultiLanguageProperty';
}

function getElementSemanticValues(element: aas.types.ISubmodelElement) {
  const semanticCarrier = element as aas.types.ISubmodelElement & {
    semanticId?: aas.types.Reference | null;
    supplementalSemanticIds?: aas.types.Reference[] | null;
  };

  return [semanticCarrier.semanticId, ...(semanticCarrier.supplementalSemanticIds ?? [])]
    .flatMap((reference) => reference?.keys ?? [])
    .map((key) => key.value.toLowerCase().trim())
    .filter((value, index, values) => value !== '' && values.indexOf(value) === index);
}

function walkSubmodelElements(
  elements: aas.types.ISubmodelElement[],
  visitor: (element: aas.types.ISubmodelElement) => void,
) {
  elements.forEach((element) => {
    visitor(element);

    if (element.modelType.name === 'SubmodelElementCollection') {
      walkSubmodelElements((element as aas.types.SubmodelElementCollection).value ?? [], visitor);
    }

    if (element.modelType.name === 'SubmodelElementList') {
      walkSubmodelElements((element as aas.types.SubmodelElementList).value ?? [], visitor);
    }
  });
}

function matchesAlias(value: string | null | undefined, aliases: string[]) {
  if (value == null) {
    return false;
  }

  return aliases.some((alias) => alias.toLowerCase() === value.toLowerCase());
}

function toSingleString(value: MultiLanguagePropertyValue[] | undefined) {
  return (
    value?.find((item) => item.language.toLowerCase() === 'de')?.text ??
    value?.find((item) => item.language.toLowerCase() === 'en')?.text ??
    value?.[0]?.text ??
    ''
  );
}

function langStringToSingleString(value: aas.types.LangStringNameType[] | undefined) {
  return (
    value?.find((item) => item.language.toLowerCase() === 'de')?.text ??
    value?.find((item) => item.language.toLowerCase() === 'en')?.text ??
    value?.[0]?.text ??
    ''
  );
}

function mlp2LangString(value: MultiLanguagePropertyValue[] | undefined) {
  const result: aas.types.LangStringTextType[] = [];
  value?.forEach((entry) => {
    if (entry.text != null && entry.text !== '') {
      result.push(new aas.types.LangStringTextType(entry.language, entry.text));
    }
  });
  return result.length > 0 ? result : null;
}
