import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { CMTypeOption } from '../model/cm-type-option';
import { EditorTypeOption } from '../model/editor-type-option';
import {
  buildCopiedIdShort,
  buildPastedIdShort,
  clearSubmodelElementValuesRecursive,
  createDefaultSubmodelElement,
  getAasSubmodelElementType,
  getCreateTypeForAasSubmodelElement,
  getEditorTypeForSubmodelElement,
  removeTemplateQualifiersRecursive,
} from './v3-submodel-element-utils';

function property(idShort: string | null, value: string | null = null) {
  const prop = new aas.types.Property(aas.types.DataTypeDefXsd.String);
  prop.idShort = idShort;
  prop.value = value;
  return prop;
}

function qualifier(kind: aas.types.QualifierKind) {
  const q = new aas.types.Qualifier('type', aas.types.DataTypeDefXsd.String);
  q.kind = kind;
  return q;
}

describe('v3 submodel element utils', () => {
  it('maps elements to their AAS and editor types with Property as fallback', () => {
    const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);

    expect(getAasSubmodelElementType(list)).toBe(aas.types.AasSubmodelElements.SubmodelElementList);
    expect(getAasSubmodelElementType(undefined)).toBe(aas.types.AasSubmodelElements.Property);
    expect(getEditorTypeForSubmodelElement(new aas.types.Blob())).toBe(EditorTypeOption.Blob);
    expect(
      getEditorTypeForSubmodelElement(
        new aas.types.BasicEventElement(
          new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, []),
          aas.types.Direction.Input,
          aas.types.StateOfEvent.On,
        ),
      ),
    ).toBe(EditorTypeOption.Property);
  });

  it('knows which create option belongs to the type of list children', () => {
    expect(getCreateTypeForAasSubmodelElement(aas.types.AasSubmodelElements.Range)).toBe(CMTypeOption.Range);
    expect(getCreateTypeForAasSubmodelElement(aas.types.AasSubmodelElements.BasicEventElement)).toBeUndefined();
    expect(getCreateTypeForAasSubmodelElement(null)).toBeUndefined();
  });

  it('creates default elements with idShort and required attributes', () => {
    const relationship = createDefaultSubmodelElement(CMTypeOption.RelationshipElement);
    const rel = relationship?.element as aas.types.RelationshipElement;
    expect(relationship?.editorType).toBe(EditorTypeOption.RelationshipElement);
    expect(rel.idShort).toBe('newRelationshipElement');
    expect(rel.first).toBeInstanceOf(aas.types.Reference);
    expect(rel.second).toBeInstanceOf(aas.types.Reference);

    const file = createDefaultSubmodelElement(CMTypeOption.File)?.element as aas.types.File;
    expect(file.contentType).toBe('application/unknown');

    const entity = createDefaultSubmodelElement(CMTypeOption.Entity)?.element as aas.types.Entity;
    expect(entity.entityType).toBe(aas.types.EntityType.SelfManagedEntity);

    expect(createDefaultSubmodelElement(CMTypeOption.Submodel)).toBeUndefined();
    expect(createDefaultSubmodelElement(CMTypeOption.AssetAdministrationShell)).toBeUndefined();
  });

  describe('idShort of copies', () => {
    it('adds a numeric suffix until the idShort is unique among the siblings', () => {
      const siblings = [property('copy_of_Name'), property('copy_of_Name_1')];
      expect(buildCopiedIdShort(property('Name'), siblings)).toBe('copy_of_Name_2');
    });

    it('derives the idShort from the type when the element has none', () => {
      expect(buildCopiedIdShort(new aas.types.SubmodelElementCollection(), [])).toBe(
        'copy_of_newSubmodelElementCollection',
      );
    });

    it('keeps pasted list children and submodels without idShort', () => {
      const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
      expect(buildPastedIdShort(property(null), list)).toBeNull();
      expect(
        buildPastedIdShort(
          new aas.types.Submodel('urn:sm'),
          new aas.types.AssetAdministrationShell(
            'urn:aas',
            new aas.types.AssetInformation(aas.types.AssetKind.Instance),
          ),
        ),
      ).toBeNull();
    });

    it('generates a unique idShort for elements without idShort pasted into a collection', () => {
      const collection = new aas.types.SubmodelElementCollection();
      collection.value = [property('copy_of_newProperty')];
      expect(buildPastedIdShort(property('  '), collection)).toBe('copy_of_newProperty_1');
      expect(buildPastedIdShort(property('Name'), collection)).toBe('copy_of_Name');
    });
  });

  it('clears values recursively but keeps the structure', () => {
    const range = new aas.types.Range(
      aas.types.DataTypeDefXsd.Int,
      null,
      null,
      'Range',
      null,
      null,
      null,
      null,
      null,
      null,
      '1',
      '5',
    );
    const operation = new aas.types.Operation();
    operation.inputVariables = [new aas.types.OperationVariable(property('Input', 'in'))];
    const entity = new aas.types.Entity();
    entity.statements = [property('Statement', 'stmt')];
    const collection = new aas.types.SubmodelElementCollection();
    collection.value = [property('Name', 'value'), range, operation, entity];

    clearSubmodelElementValuesRecursive(collection);

    expect(collection.value).toHaveLength(4);
    expect((collection.value[0] as aas.types.Property).value).toBeNull();
    expect(range.min).toBeNull();
    expect(range.max).toBeNull();
    expect((operation.inputVariables[0].value as aas.types.Property).value).toBeNull();
    expect((entity.statements[0] as aas.types.Property).value).toBeNull();
  });

  it('removes only template qualifiers recursively and counts them', () => {
    const nested = property('Nested');
    nested.qualifiers = [qualifier(aas.types.QualifierKind.TemplateQualifier)];
    const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
    list.qualifiers = [
      qualifier(aas.types.QualifierKind.TemplateQualifier),
      qualifier(aas.types.QualifierKind.ValueQualifier),
    ];
    list.value = [nested];

    expect(removeTemplateQualifiersRecursive(list)).toBe(2);
    expect(list.qualifiers).toHaveLength(1);
    expect(list.qualifiers?.[0].kind).toBe(aas.types.QualifierKind.ValueQualifier);
    expect(nested.qualifiers).toBeNull();
    expect(removeTemplateQualifiersRecursive(list)).toBe(0);
  });
});
