import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { EditorTypeOption } from '../model/editor-type-option';
import {
  buildVisibleFlatNodes,
  collectFilteredNodeIds,
  expandParents,
  findNodeById,
  findNodeByIdShortPath,
  withExpandedState,
} from './v3-tree-navigation';
import { appendChildTreeNode } from './v3-tree-node';
import { createTestNode } from './v3-tree-test-nodes';

function referable<T extends aas.types.IReferable>(element: T, idShort: string): T {
  element.idShort = idShort;
  return element;
}

function buildTree() {
  const submodelNode = createTestNode(
    'sm',
    referable(new aas.types.Submodel('urn:sm'), 'Nameplate'),
    EditorTypeOption.Submodel,
  );
  const addressNode = createTestNode(
    'address',
    referable(new aas.types.SubmodelElementCollection(), 'Address'),
    EditorTypeOption.SubmodelElementCollection,
    submodelNode,
  );
  const streetNode = createTestNode(
    'street',
    referable(new aas.types.Property(aas.types.DataTypeDefXsd.String), 'Street'),
    EditorTypeOption.Property,
    addressNode,
  );
  const serialNode = createTestNode(
    'serial',
    referable(new aas.types.Property(aas.types.DataTypeDefXsd.String), 'Serial'),
    EditorTypeOption.Property,
    submodelNode,
  );
  const cdsNode = createTestNode('cds', undefined, EditorTypeOption.ConceptDescriptions);
  return { submodelNode, addressNode, streetNode, serialNode, roots: [submodelNode, cdsNode] };
}

describe('v3 tree navigation', () => {
  it('flattens only expanded nodes when no filter is active', () => {
    const { roots, submodelNode } = buildTree();
    expect(buildVisibleFlatNodes(roots, null).map((x) => x.node.key)).toEqual(['sm', 'cds']);

    submodelNode.expanded = true;
    const flat = buildVisibleFlatNodes(roots, null);
    expect(flat.map((x) => `${x.node.key}@${x.depth}`)).toEqual(['sm@0', 'address@1', 'serial@1', 'cds@0']);
    expect(flat[1].parent).toBe(submodelNode);
  });

  it('filters by label and keeps the ancestors of matches, independent of the expanded state', () => {
    const { roots } = buildTree();

    const ids = collectFilteredNodeIds(roots, '  STREET ', (node) => node.label ?? '');

    expect([...(ids ?? [])].sort()).toEqual(['address', 'sm', 'street']);
    expect(buildVisibleFlatNodes(roots, ids).map((x) => x.node.key)).toEqual(['sm', 'address', 'street']);
    expect(collectFilteredNodeIds(roots, ' ', () => '')).toBeNull();
  });

  it('also matches the fallback label', () => {
    const { roots } = buildTree();

    const ids = collectFilteredNodeIds(roots, 'concept', (node) =>
      node.data?.editorType === EditorTypeOption.ConceptDescriptions ? 'CONCEPT_DESCRIPTIONS' : '',
    );

    expect([...(ids ?? [])]).toEqual(['cds']);
  });

  it('finds nodes by id and by idShort path', () => {
    const { roots, submodelNode, streetNode } = buildTree();

    expect(findNodeById(roots, 'street')).toBe(streetNode);
    expect(findNodeById(roots, 'unknown')).toBeNull();

    const shellNode = createTestNode('shell', undefined, EditorTypeOption.AssetAdministrationShell);
    shellNode.children = [submodelNode];
    expect(findNodeByIdShortPath(shellNode, 'Nameplate.Address.Street')).toBe(streetNode);
    expect(findNodeByIdShortPath(shellNode, 'Nameplate.Missing')).toBeNull();
    expect(findNodeByIdShortPath(shellNode, '')).toBeNull();
  });

  it('expands all ancestors and copies the tree with a new expanded state', () => {
    const { submodelNode, addressNode, streetNode } = buildTree();

    expandParents(streetNode);
    expect([submodelNode.expanded, addressNode.expanded, streetNode.expanded]).toEqual([true, true, true]);

    const collapsed = withExpandedState(submodelNode, false);
    expect(collapsed).not.toBe(submodelNode);
    expect(collapsed.expanded).toBe(false);
    expect(collapsed.children?.[0].expanded).toBe(false);
    expect(submodelNode.expanded).toBe(true);
  });

  it('appends a collapsed child node linked to its parent', () => {
    const { addressNode } = buildTree();
    const property = referable(new aas.types.Property(aas.types.DataTypeDefXsd.String), 'Zip');

    const { id, node } = appendChildTreeNode(addressNode, property, EditorTypeOption.Property, 'Zip');

    expect(addressNode.children?.at(-1)).toBe(node);
    expect(node.key).toBe(id);
    expect(node.data?.id).toBe(id);
    expect(node.parent).toBe(addressNode);
    expect(node.data?.parent).toBe(addressNode.data);
    expect(node.expanded).toBe(false);
  });
});
