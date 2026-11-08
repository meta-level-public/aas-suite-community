import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TreeNode } from '@openng/optimus-ui/api';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import {
  createTemplatePath,
  getModelReferenceKeysOfItem,
  getSubmodelIdOfItem,
  getSubmodelIdShort,
  getSubmodelSemanticId,
} from './v3-template-path';

function node(
  content: aas.types.Class,
  editorType: EditorTypeOption,
  parent?: TreeNode<V3TreeItem<unknown>>,
): TreeNode<V3TreeItem<unknown>> {
  const data = new V3TreeItem<unknown>();
  data.content = content;
  data.editorType = editorType;
  data.parent = parent?.data;
  return { data, parent };
}

function buildTree() {
  const shell = node(
    new aas.types.AssetAdministrationShell('urn:aas', new aas.types.AssetInformation(aas.types.AssetKind.Instance)),
    EditorTypeOption.AssetAdministrationShell,
  );
  const submodel = new aas.types.Submodel('urn:sm');
  submodel.idShort = 'Nameplate';
  submodel.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.Submodel, 'urn:ignored'),
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, 'https://admin-shell.io/nameplate'),
  ]);
  const submodelNode = node(submodel, EditorTypeOption.Submodel, shell);
  const collection = new aas.types.SubmodelElementCollection();
  collection.idShort = 'Address';
  const collectionNode = node(collection, EditorTypeOption.SubmodelElementCollection, submodelNode);
  const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.SubmodelElementCollection);
  list.idShort = 'Phones';
  const listNode = node(list, EditorTypeOption.SubmodelElementList, collectionNode);
  return { shell, submodelNode, collectionNode, listNode };
}

describe('v3 template path', () => {
  it('builds the JSONPath of a node inside its submodel', () => {
    const { submodelNode, collectionNode, listNode } = buildTree();

    expect(createTemplatePath(submodelNode, '')).toBe('$');
    expect(createTemplatePath(collectionNode, '')).toBe('$.submodelElements[?(@.idShort=="Address")]');
    expect(createTemplatePath(listNode, '')).toBe(
      '$.submodelElements[?(@.idShort=="Address")].value[?(@.idShort=="Phones")]',
    );
  });

  it('finds idShort, global semantic id and id of the enclosing submodel', () => {
    const { shell, listNode } = buildTree();

    expect(getSubmodelIdShort(listNode)).toBe('Nameplate');
    expect(getSubmodelSemanticId(listNode)).toBe('https://admin-shell.io/nameplate');
    expect(getSubmodelIdOfItem(listNode.data)).toBe('urn:sm');

    expect(getSubmodelIdShort(shell)).toBe('');
    expect(getSubmodelSemanticId(shell)).toBe('');
    expect(getSubmodelIdOfItem(shell.data)).toBe('');
  });

  it('builds the model reference keys of an item, list children by index', () => {
    const { shell, listNode } = buildTree();
    const entry = new aas.types.SubmodelElementCollection();
    entry.idShort = 'Phone';
    const list = listNode.data?.content as aas.types.SubmodelElementList;
    list.value = [new aas.types.SubmodelElementCollection(), entry];
    const entryNode = node(entry, EditorTypeOption.SubmodelElementCollection, listNode);

    expect(getModelReferenceKeysOfItem(entryNode.data).map((key) => [aas.types.KeyTypes[key.type], key.value])).toEqual(
      [
        ['Submodel', 'urn:sm'],
        ['SubmodelElementCollection', 'Address'],
        ['SubmodelElementList', 'Phones'],
        ['SubmodelElementCollection', '1'],
      ],
    );
    expect(getModelReferenceKeysOfItem(shell.data)).toEqual([]);
  });
});
