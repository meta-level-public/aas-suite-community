import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EditorTypeOption } from '../model/editor-type-option';
import { canReorderInParent, isDropAllowed, moveAcrossParents, reorderWithinParent } from './v3-tree-drag-drop';
import { createTestNode } from './v3-tree-test-nodes';

function property(idShort: string) {
  const prop = new aas.types.Property(aas.types.DataTypeDefXsd.String);
  prop.idShort = idShort;
  return prop;
}

function buildTree() {
  const a = property('A');
  const b = property('B');
  const c = property('C');
  const submodel = new aas.types.Submodel('urn:sm');
  const collection = new aas.types.SubmodelElementCollection();
  collection.value = [c];
  submodel.submodelElements = [a, b, collection];

  const submodelNode = createTestNode('sm', submodel, EditorTypeOption.Submodel);
  const aNode = createTestNode('a', a, EditorTypeOption.Property, submodelNode);
  const bNode = createTestNode('b', b, EditorTypeOption.Property, submodelNode);
  const collectionNode = createTestNode('smc', collection, EditorTypeOption.SubmodelElementCollection, submodelNode);
  const cNode = createTestNode('c', c, EditorTypeOption.Property, collectionNode);

  const environment = new aas.types.Environment(null, null, [
    new aas.types.ConceptDescription('urn:cd1'),
    new aas.types.ConceptDescription('urn:cd2'),
  ]);
  const cdsNode = createTestNode('cds', environment, EditorTypeOption.ConceptDescriptions);
  const cd1Node = createTestNode(
    'cd1',
    environment.conceptDescriptions![0],
    EditorTypeOption.ConceptDescription,
    cdsNode,
  );
  const cd2Node = createTestNode(
    'cd2',
    environment.conceptDescriptions![1],
    EditorTypeOption.ConceptDescription,
    cdsNode,
  );

  return {
    submodel,
    collection,
    environment,
    submodelNode,
    aNode,
    bNode,
    collectionNode,
    cNode,
    cdsNode,
    cd1Node,
    cd2Node,
  };
}

describe('v3 tree drag & drop', () => {
  it('allows reordering below submodels, collections, lists and the concept descriptions node only', () => {
    const { submodelNode, collectionNode, cdsNode, aNode } = buildTree();

    expect(canReorderInParent(submodelNode)).toBe(true);
    expect(canReorderInParent(collectionNode)).toBe(true);
    expect(canReorderInParent(cdsNode)).toBe(true);
    expect(canReorderInParent(aNode)).toBe(false);
    expect(canReorderInParent(undefined)).toBe(false);
  });

  it('allows drops on siblings and on containers that accept the element', () => {
    const { aNode, bNode, cNode, collectionNode, cd1Node, submodelNode } = buildTree();

    expect(isDropAllowed(aNode, bNode)).toBe(true);
    expect(isDropAllowed(aNode, collectionNode)).toBe(true);
    expect(isDropAllowed(aNode, cNode)).toBe(true);
    expect(isDropAllowed(cd1Node, collectionNode)).toBe(false);
    expect(isDropAllowed(aNode, aNode)).toBe(false);
    expect(isDropAllowed(null, submodelNode)).toBe(false);
  });

  it('reorders by the model positions of dragged and target node', () => {
    const { submodel, submodelNode, aNode, collectionNode } = buildTree();
    const [a, b, collection] = submodel.submodelElements!;

    // flat indices differ from model positions (the submodel node itself is part of the flat list)
    expect(reorderWithinParent(submodelNode, 1, 3, aNode, collectionNode)).toBe('moved');
    expect(submodel.submodelElements).toEqual([b, collection, a]);
  });

  it('reorders concept descriptions and reports unchanged and forbidden moves', () => {
    const { environment, cdsNode, cd1Node, cd2Node, aNode } = buildTree();
    const [cd1, cd2] = environment.conceptDescriptions!;

    expect(reorderWithinParent(cdsNode, 0, 1, cd1Node, cd2Node)).toBe('moved');
    expect(environment.conceptDescriptions).toEqual([cd2, cd1]);
    expect(reorderWithinParent(cdsNode, 2, 2)).toBe('unchanged');
    expect(reorderWithinParent(aNode, 0, 1)).toBe('not-allowed');
  });

  it('moves an element into another container and returns it', () => {
    const { submodel, collection, aNode, cNode } = buildTree();
    const a = submodel.submodelElements![0];

    expect(moveAcrossParents(aNode, cNode)).toBe(a);
    expect(submodel.submodelElements).not.toContain(a);
    expect(collection.value).toEqual([cNode.data!.content, a]);
  });

  it('does not move concept descriptions into submodel element containers', () => {
    const { environment, cd1Node, collectionNode, collection } = buildTree();

    expect(moveAcrossParents(cd1Node, collectionNode)).toBeNull();
    expect(environment.conceptDescriptions).toHaveLength(2);
    expect(collection.value).toHaveLength(1);
  });
});
