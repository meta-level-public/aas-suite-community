import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Injectable } from '@angular/core';
import {
  DppAssistantDefinition,
  DppAssistantFieldDefinition,
  DppPcfEntryDefinition,
  DppPcfEntryType,
} from './dpp-assistant.models';

@Injectable({
  providedIn: 'root',
})
export class DppAssistantService {
  private readonly pcfSubmodelSemanticIds = ['https://admin-shell.io/idta/CarbonFootprint/1/0'];

  getCoreAssistantDefinition(): DppAssistantDefinition {
    return {
      id: 'dpp-core',
      titleKey: 'DPP_CORE_ASSISTANT',
      descriptionKey: 'DPP_CORE_ASSISTANT_EXPL',
      steps: [],
    };
  }

  getPcfEntryDefinition(type: DppPcfEntryType): DppPcfEntryDefinition {
    return type === 'product-carbon-footprint'
      ? this.getProductCarbonFootprintDefinition()
      : this.getProductOrSectorSpecificDefinition();
  }

  getFieldValueOptions(
    field: DppAssistantFieldDefinition,
    submodels: aas.types.Submodel[],
    conceptDescriptions: aas.types.ConceptDescription[],
  ): string[] {
    if (field.templatePath == null || field.templatePath.length === 0) {
      return [];
    }

    const pcfSubmodel = submodels.find((submodel) => this.isPcfSubmodel(submodel));
    if (pcfSubmodel?.submodelElements == null) {
      return [];
    }

    const templateElement = this.findElementByPath(pcfSubmodel.submodelElements, field.templatePath);
    if (templateElement == null) {
      return [];
    }

    const valueCarrier = this.findValueListCarrier(templateElement);
    return this.getValueListEntries(valueCarrier, conceptDescriptions);
  }

  private getProductCarbonFootprintDefinition(): DppPcfEntryDefinition {
    return {
      type: 'product-carbon-footprint',
      titleKey: 'DPP_PCF_TYPE_PRODUCT',
      descriptionKey: 'DPP_PCF_TYPE_PRODUCT_EXPL',
      groups: [
        {
          id: 'methodology',
          labelKey: 'DPP_PCF_GROUP_METHODS_PHASES',
          descriptionKey: 'DPP_PCF_GROUP_METHODS_PHASES_EXPL',
          fields: [
            {
              id: 'pcf-calculation-methods',
              labelKey: 'DPP_CORE_FIELD_PCF_CALCULATION_METHODS',
              descriptionKey: 'DPP_PCF_FIELD_PCF_CALCULATION_METHODS_LIST_EXPL',
              fieldType: 'select',
              multiple: true,
              templatePath: ['ProductCarbonFootprints', 'PcfCalculationMethods'],
            },
            {
              id: 'pcf-life-cycle-phases',
              labelKey: 'DPP_PCF_FIELD_LIFE_CYCLE_PHASES',
              descriptionKey: 'DPP_PCF_FIELD_LIFE_CYCLE_PHASES_EXPL',
              fieldType: 'select',
              multiple: true,
              templatePath: ['ProductCarbonFootprints', 'LifeCyclePhases'],
            },
          ],
        },
        {
          id: 'declaration',
          labelKey: 'DPP_PCF_GROUP_DECLARATION',
          descriptionKey: 'DPP_PCF_GROUP_DECLARATION_EXPL',
          fields: [
            {
              id: 'pcf-co2eq',
              labelKey: 'DPP_CORE_FIELD_PCF_CO2EQ',
              descriptionKey: 'DPP_CORE_FIELD_PCF_CO2EQ_EXPL',
              fieldType: 'number',
              templatePath: ['ProductCarbonFootprints', 'PcfCo2eq'],
            },
            {
              id: 'pcf-reference-impact-unit',
              labelKey: 'DPP_CORE_FIELD_PCF_REFERENCE_IMPACT_UNIT',
              descriptionKey: 'DPP_CORE_FIELD_PCF_REFERENCE_IMPACT_UNIT_EXPL',
              fieldType: 'text',
              templatePath: ['ProductCarbonFootprints', 'ReferenceImpactUnitForCalculation'],
            },
            {
              id: 'pcf-quantity-of-measure',
              labelKey: 'DPP_CORE_FIELD_PCF_QUANTITY_OF_MEASURE',
              descriptionKey: 'DPP_CORE_FIELD_PCF_QUANTITY_OF_MEASURE_EXPL',
              fieldType: 'number',
              templatePath: ['ProductCarbonFootprints', 'QuantityOfMeasureForCalculation'],
            },
          ],
        },
        {
          id: 'evidence',
          labelKey: 'DPP_PCF_GROUP_EVIDENCE_VALIDITY',
          descriptionKey: 'DPP_PCF_GROUP_EVIDENCE_VALIDITY_EXPL',
          fields: [
            {
              id: 'pcf-explanatory-statement',
              labelKey: 'DPP_PCF_FIELD_EXPLANATORY_STATEMENT_REFERENCE',
              descriptionKey: 'DPP_PCF_FIELD_EXPLANATORY_STATEMENT_REFERENCE_EXPL',
              fieldType: 'text',
              templatePath: ['ProductCarbonFootprints', 'ExplanatoryStatement'],
            },
            {
              id: 'goods-handover-address',
              labelKey: 'DPP_PCF_FIELD_GOODS_HANDOVER_ADDRESS',
              descriptionKey: 'DPP_PCF_FIELD_GOODS_HANDOVER_ADDRESS_EXPL',
              fieldType: 'textarea',
              templatePath: ['ProductCarbonFootprints', 'GoodsHandoverAddress', 'Address'],
            },
            {
              id: 'pcf-publication-date',
              labelKey: 'DPP_CORE_FIELD_PCF_PUBLICATION_DATE',
              descriptionKey: 'DPP_CORE_FIELD_PCF_PUBLICATION_DATE_EXPL',
              fieldType: 'text',
              templatePath: ['ProductCarbonFootprints', 'PublicationDate'],
            },
            {
              id: 'pcf-expiration-date',
              labelKey: 'DPP_PCF_FIELD_EXPIRATION_DATE',
              descriptionKey: 'DPP_PCF_FIELD_EXPIRATION_DATE_EXPL',
              fieldType: 'text',
              templatePath: ['ProductCarbonFootprints', 'ExpirationDate'],
            },
          ],
        },
      ],
    };
  }

  private getProductOrSectorSpecificDefinition(): DppPcfEntryDefinition {
    return {
      type: 'product-or-sector-specific-carbon-footprint',
      titleKey: 'DPP_PCF_TYPE_PRODUCT_OR_SECTOR',
      descriptionKey: 'DPP_PCF_TYPE_PRODUCT_OR_SECTOR_EXPL',
      groups: [
        {
          id: 'methods',
          labelKey: 'DPP_PCF_GROUP_METHODS',
          descriptionKey: 'DPP_PCF_GROUP_METHODS_EXPL',
          fields: [
            {
              id: 'pcf-calculation-methods',
              labelKey: 'DPP_CORE_FIELD_PCF_CALCULATION_METHODS',
              descriptionKey: 'DPP_PCF_FIELD_PCF_CALCULATION_METHODS_LIST_EXPL',
              fieldType: 'select',
              multiple: true,
              templatePath: ['ProductOrSectorSpecificCarbonFootprints', 'PcfCalculationMethods'],
            },
          ],
        },
        {
          id: 'rules',
          labelKey: 'DPP_PCF_GROUP_RULE_SET',
          descriptionKey: 'DPP_PCF_GROUP_RULE_SET_EXPL',
          fields: [
            {
              id: 'pcf-rule-operator',
              labelKey: 'DPP_PCF_FIELD_RULE_OPERATOR',
              descriptionKey: 'DPP_PCF_FIELD_RULE_OPERATOR_EXPL',
              fieldType: 'text',
              templatePath: [
                'ProductOrSectorSpecificCarbonFootprints',
                'ProductOrSectorSpecificRule',
                'PcfRuleOperator',
              ],
            },
            {
              id: 'pcf-rule-name',
              labelKey: 'DPP_PCF_FIELD_RULE_NAME',
              descriptionKey: 'DPP_PCF_FIELD_RULE_NAME_EXPL',
              fieldType: 'text',
              templatePath: ['ProductOrSectorSpecificCarbonFootprints', 'ProductOrSectorSpecificRule', 'PcfRuleName'],
            },
            {
              id: 'pcf-rule-version',
              labelKey: 'DPP_PCF_FIELD_RULE_VERSION',
              descriptionKey: 'DPP_PCF_FIELD_RULE_VERSION_EXPL',
              fieldType: 'text',
              templatePath: [
                'ProductOrSectorSpecificCarbonFootprints',
                'ProductOrSectorSpecificRule',
                'PcfRuleVersion',
              ],
            },
            {
              id: 'pcf-rule-online-reference',
              labelKey: 'DPP_PCF_FIELD_RULE_ONLINE_REFERENCE',
              descriptionKey: 'DPP_PCF_FIELD_RULE_ONLINE_REFERENCE_EXPL',
              fieldType: 'text',
              templatePath: [
                'ProductOrSectorSpecificCarbonFootprints',
                'ProductOrSectorSpecificRule',
                'PcfRuleOnlineReference',
              ],
            },
          ],
        },
        {
          id: 'external-api',
          labelKey: 'DPP_PCF_GROUP_EXTERNAL_API',
          descriptionKey: 'DPP_PCF_GROUP_EXTERNAL_API_EXPL',
          fields: [
            {
              id: 'pcf-api-endpoint',
              labelKey: 'DPP_PCF_FIELD_API_ENDPOINT',
              descriptionKey: 'DPP_PCF_FIELD_API_ENDPOINT_EXPL',
              fieldType: 'text',
              templatePath: ['ProductOrSectorSpecificCarbonFootprints', 'ExternalPcfApi', 'PcfApiEndpoint'],
            },
            {
              id: 'pcf-api-query',
              labelKey: 'DPP_PCF_FIELD_API_QUERY',
              descriptionKey: 'DPP_PCF_FIELD_API_QUERY_EXPL',
              fieldType: 'textarea',
              templatePath: ['ProductOrSectorSpecificCarbonFootprints', 'ExternalPcfApi', 'PcfApiQuery'],
            },
          ],
        },
        {
          id: 'additional-info',
          labelKey: 'DPP_PCF_GROUP_INFORMATION',
          descriptionKey: 'DPP_PCF_GROUP_INFORMATION_EXPL',
          fields: [
            {
              id: 'pcf-arbitrary-content',
              labelKey: 'DPP_PCF_FIELD_ARBITRARY_CONTENT',
              descriptionKey: 'DPP_PCF_FIELD_ARBITRARY_CONTENT_EXPL',
              fieldType: 'textarea',
              templatePath: ['ProductOrSectorSpecificCarbonFootprints', 'PcfInformation', 'ArbitraryContent'],
            },
          ],
        },
      ],
    };
  }

  private isPcfSubmodel(submodel: aas.types.Submodel): boolean {
    const semanticValues = submodel.semanticId?.keys?.map((key) => key.value.toLowerCase()) ?? [];
    return (
      this.pcfSubmodelSemanticIds.some((semanticId) => semanticValues.includes(semanticId.toLowerCase())) ||
      [submodel.idShort ?? '', ...semanticValues].some((candidate) =>
        candidate.toLowerCase().includes('carbonfootprint'),
      )
    );
  }

  private findElementByPath(
    elements: aas.types.ISubmodelElement[],
    path: string[],
  ): aas.types.ISubmodelElement | undefined {
    let currentElements = elements;
    let current: aas.types.ISubmodelElement | undefined;

    for (const segment of path) {
      current = this.findElementInBranch(currentElements, segment);
      if (current == null) {
        return undefined;
      }
      currentElements = this.getChildElements(current);
    }

    return current;
  }

  private findElementInBranch(
    elements: aas.types.ISubmodelElement[],
    idShort: string,
  ): aas.types.ISubmodelElement | undefined {
    const directMatch = elements.find((element) => element.idShort === idShort);
    if (directMatch != null) {
      return directMatch;
    }

    for (const element of elements) {
      const nestedMatch = this.findElementInBranch(this.getChildElements(element), idShort);
      if (nestedMatch != null) {
        return nestedMatch;
      }
    }

    return undefined;
  }

  private getChildElements(element: aas.types.ISubmodelElement): aas.types.ISubmodelElement[] {
    if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
      return element.value ?? [];
    }
    return [];
  }

  private findValueListCarrier(
    element: aas.types.ISubmodelElement,
  ): aas.types.Property | aas.types.MultiLanguageProperty | undefined {
    if (element instanceof aas.types.Property || element instanceof aas.types.MultiLanguageProperty) {
      return element;
    }

    const childElements = this.getChildElements(element);
    for (const childElement of childElements) {
      const carrier = this.findValueListCarrier(childElement);
      if (carrier != null) {
        return carrier;
      }
    }

    return undefined;
  }

  private getValueListEntries(
    element: aas.types.Property | aas.types.MultiLanguageProperty | undefined,
    conceptDescriptions: aas.types.ConceptDescription[],
  ): string[] {
    if (element == null) {
      return [];
    }

    const embeddedEntries = this.readValueListEntries(element.embeddedDataSpecifications);
    if (embeddedEntries.length > 0) {
      return embeddedEntries;
    }

    const semanticId = element.semanticId?.keys?.[0]?.value;
    if (semanticId == null) {
      return [];
    }

    const conceptDescription = conceptDescriptions.find((cd) => cd.id === semanticId);
    return this.readValueListEntries(conceptDescription?.embeddedDataSpecifications);
  }

  private readValueListEntries(
    embeddedDataSpecifications: aas.types.EmbeddedDataSpecification[] | null | undefined,
  ): string[] {
    const entries = embeddedDataSpecifications
      ?.flatMap((embeddedDataSpecification) => {
        const valueList = (embeddedDataSpecification.dataSpecificationContent as any)?.valueList;
        return valueList?.valueReferencePairs?.map((pair: any) => `${pair?.value ?? ''}`.trim()) ?? [];
      })
      .filter((entry) => entry !== '');

    return entries == null ? [] : [...new Set(entries)];
  }
}
