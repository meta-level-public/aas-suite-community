import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EditorTypeOption } from '../model/editor-type-option';
import { getNodeLabel, getTypeTag } from './v3-tree-labels';
import { MissingSubmodelPlaceholder } from './v3-tree-node';
import { createTestNode } from './v3-tree-test-nodes';

describe('v3 tree labels', () => {
  it('uses the idShort and marks submodel templates', () => {
    const submodel = new aas.types.Submodel('urn:sm');
    submodel.idShort = 'Nameplate';
    submodel.kind = aas.types.ModellingKind.Template;

    expect(getNodeLabel(createTestNode('sm', submodel, EditorTypeOption.Submodel), 'de')).toBe('<T> Nameplate');
  });

  it('uses translation keys for root nodes and missing submodels', () => {
    const missing: MissingSubmodelPlaceholder = {
      managedType: 'MissingSubmodel',
      modelType: { name: 'MissingSubmodel' },
      managedItem: 'MissingSubmodel',
      data: new aas.types.Reference(aas.types.ReferenceTypes.ModelReference, []),
      editorType: EditorTypeOption.MissingSubmodel,
      label: 'Missing',
    };

    expect(getNodeLabel(createTestNode('cds', undefined, EditorTypeOption.ConceptDescriptions), 'de')).toBe(
      'CONCEPT_DESCRIPTIONS',
    );
    expect(getNodeLabel(createTestNode('missing', missing, EditorTypeOption.MissingSubmodel), 'de')).toBe(
      'MISSING_SUBMODEL',
    );
  });

  it('shows the type tag of the content, environment nodes and missing submodels', () => {
    const tag = (content: aas.types.Class | undefined, editorType = EditorTypeOption.Undefined) =>
      getTypeTag(createTestNode('n', content, editorType));

    expect(tag(new aas.types.MultiLanguageProperty())).toBe('MLP');
    expect(tag(new aas.types.Property(aas.types.DataTypeDefXsd.String))).toBe('Prop');
    expect(tag(new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property))).toBe('SML');
    expect(tag(new aas.types.ConceptDescription('urn:cd'))).toBe('CD');
    expect(tag(undefined, EditorTypeOption.MissingSubmodel)).toBe('SM');
    expect(tag(undefined, EditorTypeOption.SupplementalFile)).toBe('F');
    expect(tag(undefined, EditorTypeOption.SupplementalFiles)).toBe('Env');
    expect(tag(undefined)).toBe('?');
  });
});
