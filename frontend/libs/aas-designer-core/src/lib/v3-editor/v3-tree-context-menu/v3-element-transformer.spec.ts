import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  replaceElementInParent,
  transformToMultiLanguageProperty,
  transformToProperty,
  transformToSubmodelElementCollection,
  transformToSubmodelElementList,
} from './v3-element-transformer';

function semanticId(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

describe('v3 element transformer', () => {
  it('turns a multi language property into a property with the text of the given language', () => {
    const mlp = new aas.types.MultiLanguageProperty();
    mlp.idShort = 'Name';
    mlp.semanticId = semanticId('urn:name');
    mlp.value = [new aas.types.LangStringTextType('en', 'Pump'), new aas.types.LangStringTextType('de', 'Pumpe')];

    const property = transformToProperty(mlp, 'de');

    expect(property).toBeInstanceOf(aas.types.Property);
    expect(property.idShort).toBe('Name');
    expect(property.semanticId).toBe(mlp.semanticId);
    expect(property.valueType).toBe(aas.types.DataTypeDefXsd.String);
    expect(property.value).toBe('Pumpe');
    expect(transformToProperty(mlp, 'fr').value).toBe('Pump');
  });

  it('turns a property into a multi language property, an empty value stays empty', () => {
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.Int);
    property.idShort = 'Count';
    property.value = '42';

    const mlp = transformToMultiLanguageProperty(property, 'en');
    expect(mlp.idShort).toBe('Count');
    expect(mlp.value).toHaveLength(1);
    expect(mlp.value?.[0].language).toBe('en');
    expect(mlp.value?.[0].text).toBe('42');

    property.value = null;
    expect(transformToMultiLanguageProperty(property, 'en').value).toBeNull();
  });

  it('turns a collection into a list typed by its first child and back, keeping the children', () => {
    const child = new aas.types.Range(aas.types.DataTypeDefXsd.Int);
    const smc = new aas.types.SubmodelElementCollection();
    smc.idShort = 'Ranges';
    smc.value = [child];

    const sml = transformToSubmodelElementList(smc);
    expect(sml.typeValueListElement).toBe(aas.types.AasSubmodelElements.Range);
    expect(sml.orderRelevant).toBe(false);
    expect(sml.idShort).toBe('Ranges');
    expect(sml.value).toEqual([child]);

    const back = transformToSubmodelElementCollection(sml);
    expect(back).toBeInstanceOf(aas.types.SubmodelElementCollection);
    expect(back.value).toEqual([child]);
  });

  it('types a list from an empty collection as property list', () => {
    expect(transformToSubmodelElementList(new aas.types.SubmodelElementCollection()).typeValueListElement).toBe(
      aas.types.AasSubmodelElements.Property,
    );
  });

  it('replaces the element at its position in the parent container', () => {
    const first = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    const second = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    const replacement = new aas.types.MultiLanguageProperty();
    const entity = new aas.types.Entity();
    entity.statements = [first, second];

    replaceElementInParent(entity, second, replacement);
    expect(entity.statements).toEqual([first, replacement]);

    replaceElementInParent(entity, new aas.types.Blob(), first);
    expect(entity.statements).toEqual([first, replacement]);
  });
});
