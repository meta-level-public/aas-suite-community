import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Injectable } from '@angular/core';
import { DppPcfEntry, DppPcfEntryType } from 'battery-passport-assistant';

@Injectable({
  providedIn: 'root',
})
export class PcfEntryMapperService {
  createEmptyEntry(type: DppPcfEntryType): DppPcfEntry {
    return {
      id: `${type}-${Date.now()}-${Math.round(Math.random() * 1000)}`,
      type,
      values: {},
    };
  }

  readEntry(type: DppPcfEntryType, collection: aas.types.SubmodelElementCollection, index: number): DppPcfEntry {
    return type === 'product-carbon-footprint'
      ? this.readProductEntry(collection, index)
      : this.readSectorEntry(collection, index);
  }

  createEntryElement(entry: DppPcfEntry, index: number): aas.types.SubmodelElementCollection {
    return entry.type === 'product-carbon-footprint'
      ? this.createProductCarbonFootprintEntry(entry, index)
      : this.createProductOrSectorSpecificCarbonFootprintEntry(entry, index);
  }

  private readProductEntry(collection: aas.types.SubmodelElementCollection, index: number): DppPcfEntry {
    return {
      id: collection.idShort?.trim() || `product-carbon-footprint-${index}`,
      type: 'product-carbon-footprint',
      values: {
        'pcf-calculation-methods': this.readStringList(collection, 'PcfCalculationMethods'),
        'pcf-co2eq': this.readStringValue(collection, 'PcfCo2eq'),
        'pcf-reference-impact-unit': this.readStringValue(collection, 'ReferenceImpactUnitForCalculation'),
        'pcf-quantity-of-measure': this.readStringValue(collection, 'QuantityOfMeasureForCalculation'),
        'pcf-life-cycle-phases': this.readStringList(collection, 'LifeCyclePhases'),
        'pcf-explanatory-statement': this.readStringValue(collection, 'ExplanatoryStatement'),
        'goods-handover-address': this.readNestedStringValue(collection, ['GoodsHandoverAddress', 'Address']),
        'pcf-publication-date': this.readStringValue(collection, 'PublicationDate'),
        'pcf-expiration-date': this.readStringValue(collection, 'ExpirationDate'),
      },
    };
  }

  private readSectorEntry(collection: aas.types.SubmodelElementCollection, index: number): DppPcfEntry {
    return {
      id: collection.idShort?.trim() || `product-or-sector-specific-carbon-footprint-${index}`,
      type: 'product-or-sector-specific-carbon-footprint',
      values: {
        'pcf-calculation-methods': this.readStringList(collection, 'PcfCalculationMethods'),
        'pcf-rule-operator': this.readNestedStringValue(collection, ['ProductOrSectorSpecificRule', 'PcfRuleOperator']),
        'pcf-rule-name': this.readNestedStringValue(collection, ['ProductOrSectorSpecificRule', 'PcfRuleName']),
        'pcf-rule-version': this.readNestedStringValue(collection, ['ProductOrSectorSpecificRule', 'PcfRuleVersion']),
        'pcf-rule-online-reference': this.readNestedStringValue(collection, [
          'ProductOrSectorSpecificRule',
          'PcfRuleOnlineReference',
        ]),
        'pcf-api-endpoint': this.readNestedStringValue(collection, ['ExternalPcfApi', 'PcfApiEndpoint']),
        'pcf-api-query': this.readNestedStringValue(collection, ['ExternalPcfApi', 'PcfApiQuery']),
        'pcf-arbitrary-content': this.readNestedStringValue(collection, ['PcfInformation', 'ArbitraryContent']),
      },
    };
  }

  private createProductCarbonFootprintEntry(entry: DppPcfEntry, index: number) {
    const collection = new aas.types.SubmodelElementCollection(null, null, `Element ${index}`);
    collection.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
      new aas.types.Key(
        aas.types.KeyTypes.GlobalReference,
        'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprint/0/9',
      ),
    ]);
    collection.value = [
      this.createStringPropertyList('PcfCalculationMethods', this.toLineItems(entry.values['pcf-calculation-methods'])),
      this.createProperty(
        'PcfCo2eq',
        aas.types.DataTypeDefXsd.Decimal,
        '0173-1#02-ABG855#003',
        this.toStringValue(entry.values['pcf-co2eq']),
      ),
      this.createProperty(
        'ReferenceImpactUnitForCalculation',
        aas.types.DataTypeDefXsd.String,
        '0173-1#02-ABG856#003',
        this.toStringValue(entry.values['pcf-reference-impact-unit']),
      ),
      this.createProperty(
        'QuantityOfMeasureForCalculation',
        aas.types.DataTypeDefXsd.Decimal,
        '0173-1#02-ABG857#001',
        this.toStringValue(entry.values['pcf-quantity-of-measure']),
      ),
      this.createStringPropertyList('LifeCyclePhases', this.toLineItems(entry.values['pcf-life-cycle-phases'])),
      this.createProperty(
        'ExplanatoryStatement',
        aas.types.DataTypeDefXsd.String,
        'https://admin-shell.io/idta/CarbonFootprint/ExplanatoryStatement/1/0',
        this.toStringValue(entry.values['pcf-explanatory-statement']),
      ),
      this.createStringCollection(
        'GoodsHandoverAddress',
        'Address',
        this.toStringValue(entry.values['goods-handover-address']),
      ),
      this.createProperty(
        'PublicationDate',
        aas.types.DataTypeDefXsd.DateTime,
        'https://admin-shell.io/idta/CarbonFootprint/PublicationDate/1/0',
        this.toStringValue(entry.values['pcf-publication-date']),
      ),
      this.createProperty(
        'ExpirationDate',
        aas.types.DataTypeDefXsd.DateTime,
        '',
        this.toStringValue(entry.values['pcf-expiration-date']),
      ),
    ];
    return collection;
  }

  private createProductOrSectorSpecificCarbonFootprintEntry(entry: DppPcfEntry, index: number) {
    const collection = new aas.types.SubmodelElementCollection(null, null, `Element ${index}`);
    collection.value = [
      this.createStringPropertyList('PcfCalculationMethods', this.toLineItems(entry.values['pcf-calculation-methods'])),
      this.createNamedCollection('ProductOrSectorSpecificRule', [
        this.createProperty(
          'PcfRuleOperator',
          aas.types.DataTypeDefXsd.String,
          '',
          this.toStringValue(entry.values['pcf-rule-operator']),
        ),
        this.createProperty(
          'PcfRuleName',
          aas.types.DataTypeDefXsd.String,
          '',
          this.toStringValue(entry.values['pcf-rule-name']),
        ),
        this.createProperty(
          'PcfRuleVersion',
          aas.types.DataTypeDefXsd.String,
          '',
          this.toStringValue(entry.values['pcf-rule-version']),
        ),
        this.createProperty(
          'PcfRuleOnlineReference',
          aas.types.DataTypeDefXsd.String,
          '',
          this.toStringValue(entry.values['pcf-rule-online-reference']),
        ),
      ]),
      this.createNamedCollection('ExternalPcfApi', [
        this.createProperty(
          'PcfApiEndpoint',
          aas.types.DataTypeDefXsd.String,
          '',
          this.toStringValue(entry.values['pcf-api-endpoint']),
        ),
        this.createProperty(
          'PcfApiQuery',
          aas.types.DataTypeDefXsd.String,
          '',
          this.toStringValue(entry.values['pcf-api-query']),
        ),
      ]),
      this.createNamedCollection('PcfInformation', [
        this.createProperty(
          'ArbitraryContent',
          aas.types.DataTypeDefXsd.String,
          '',
          this.toStringValue(entry.values['pcf-arbitrary-content']),
        ),
      ]),
    ];
    return collection;
  }

  private readStringList(parent: aas.types.SubmodelElementCollection, idShort: string): string[] {
    const list = this.findChildByIdShort(parent, idShort);
    if (!(list instanceof aas.types.SubmodelElementList)) {
      return [];
    }

    return (list.value ?? [])
      .filter((element): element is aas.types.Property => element instanceof aas.types.Property)
      .map((element) => `${element.value ?? ''}`.trim())
      .filter((value) => value !== '');
  }

  private readStringValue(parent: aas.types.SubmodelElementCollection, idShort: string): string {
    const property = this.findChildByIdShort(parent, idShort);
    if (property instanceof aas.types.Property) {
      return `${property.value ?? ''}`.trim();
    }
    return '';
  }

  private readNestedStringValue(parent: aas.types.SubmodelElementCollection, path: string[]): string {
    let current: aas.types.ISubmodelElement | undefined = parent;

    for (const segment of path) {
      if (!(current instanceof aas.types.SubmodelElementCollection)) {
        return '';
      }

      current = this.findChildByIdShort(current, segment);
      if (current == null) {
        return '';
      }
    }

    if (current instanceof aas.types.Property) {
      return `${current.value ?? ''}`.trim();
    }

    return '';
  }

  private findChildByIdShort(
    parent: aas.types.SubmodelElementCollection,
    idShort: string,
  ): aas.types.ISubmodelElement | undefined {
    return (parent.value ?? []).find((child) => child.idShort === idShort);
  }

  private createProperty(idShort: string, valueType: aas.types.DataTypeDefXsd, semanticId: string, value: string) {
    const property = new aas.types.Property(valueType, null, null, idShort);
    property.value = value;
    if (semanticId !== '') {
      property.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
        new aas.types.Key(aas.types.KeyTypes.GlobalReference, semanticId),
      ]);
    }
    return property;
  }

  private createStringPropertyList(idShort: string, values: string[]) {
    const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property, null, null, idShort);
    list.valueTypeListElement = aas.types.DataTypeDefXsd.String;
    list.value = values.map((value, index) => {
      const property = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, `Element ${index}`);
      property.value = value;
      return property;
    });
    return list;
  }

  private createStringCollection(idShort: string, propertyIdShort: string, value: string) {
    return this.createNamedCollection(idShort, [
      this.createProperty(propertyIdShort, aas.types.DataTypeDefXsd.String, '', value),
    ]);
  }

  private createNamedCollection(idShort: string, elements: aas.types.ISubmodelElement[]) {
    const collection = new aas.types.SubmodelElementCollection(null, null, idShort);
    collection.value = elements;
    return collection;
  }

  private toLineItems(value: unknown): string[] {
    if (Array.isArray(value)) {
      return value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter((item) => item !== '');
    }

    if (typeof value === 'string') {
      return value
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter((item) => item !== '');
    }

    return [];
  }

  private toStringValue(value: unknown): string {
    if (typeof value === 'number') {
      return `${value}`;
    }

    if (typeof value === 'string') {
      return value;
    }

    return '';
  }
}
