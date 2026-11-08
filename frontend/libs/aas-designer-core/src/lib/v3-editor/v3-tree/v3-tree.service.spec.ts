import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { TreeNode } from '@openng/optimus-ui/api';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3TreeComponent } from './v3-tree.component';
import { V3TreeService } from './v3-tree.service';

const T = aas.types;

function node<C>(
  id: string,
  editorType: EditorTypeOption,
  content: C,
  parent?: TreeNode<V3TreeItem<any>>,
): TreeNode<V3TreeItem<any>> {
  const item = new V3TreeItem<C>();
  item.id = id;
  item.editorType = editorType;
  item.content = content;
  const treeNode: TreeNode<V3TreeItem<any>> = { key: id, label: id, data: item, parent, children: [] };
  parent?.children?.push(treeNode);
  return treeNode;
}

/** Builds AAS -> Submodel "Nameplate" -> SMC "ContactInformation" -> Property "Phone". */
function createTree() {
  const shell = new T.AssetAdministrationShell(
    'https://example.com/ids/aas/pump_4711',
    new T.AssetInformation(T.AssetKind.Instance, 'https://example.com/ids/asset/pump_4711'),
  );
  shell.idShort = 'Pump4711';
  const nameplate = new T.Submodel('https://example.com/ids/sm/nameplate_4711');
  nameplate.idShort = 'Nameplate';
  const contact = new T.SubmodelElementCollection(null, null, 'ContactInformation');
  const phone = new T.Property(T.DataTypeDefXsd.String, null, null, 'Phone');

  const shellNode = node('aas', EditorTypeOption.AssetAdministrationShell, shell);
  const submodelNode = node('sm', EditorTypeOption.Submodel, nameplate, shellNode);
  const contactNode = node('smc', EditorTypeOption.SubmodelElementCollection, contact, submodelNode);
  const phoneNode = node('prop', EditorTypeOption.Property, phone, contactNode);

  return { shell, nameplate, contact, phone, shellNode, submodelNode, contactNode, phoneNode };
}

describe('V3TreeService', () => {
  let service: V3TreeService;
  let treeComponent: {
    selectById: ReturnType<typeof vi.fn>;
    applyState: ReturnType<typeof vi.fn>;
    findNodeByElementRecursive: ReturnType<typeof vi.fn>;
    findNodeById: ReturnType<typeof vi.fn>;
    getNodeLabel: ReturnType<typeof vi.fn>;
    buildSubmodelChildren: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: TranslateService, useValue: { instant: (key: string) => `translated:${key}` } }],
    });
    service = TestBed.inject(V3TreeService);
    treeComponent = {
      selectById: vi.fn(),
      applyState: vi.fn(),
      findNodeByElementRecursive: vi.fn(),
      findNodeById: vi.fn(),
      getNodeLabel: vi.fn(),
      buildSubmodelChildren: vi.fn(() => []),
    };
    service.treeComponent = treeComponent as unknown as V3TreeComponent;
  });

  describe('navigation history', () => {
    it('records visited nodes and navigates back and forward', () => {
      service.addVisitedNode('sm');
      service.addVisitedNode('smc');
      service.addVisitedNode('prop');

      expect(service.hasNextNode()).toBe(false);

      service.previousNode();
      expect(treeComponent.selectById).toHaveBeenLastCalledWith('smc');
      expect(service.hasNextNode()).toBe(true);

      service.nextNode();
      expect(treeComponent.selectById).toHaveBeenLastCalledWith('prop');
      expect(service.hasNextNode()).toBe(false);
    });

    it('ignores empty ids and consecutive duplicates', () => {
      service.addVisitedNode('sm');
      service.addVisitedNode('sm');
      service.addVisitedNode('');

      expect(service.visitedNodes).toEqual(['sm']);
    });

    it('drops the forward history when a new node is visited after going back', () => {
      service.addVisitedNode('sm');
      service.addVisitedNode('smc');
      service.addVisitedNode('prop');
      service.previousNode();
      service.previousNode();

      service.addVisitedNode('cd');

      expect(service.visitedNodes).toEqual(['sm', 'cd']);
      expect(service.hasNextNode()).toBe(false);
    });

    it('starts over after a reset', () => {
      service.addVisitedNode('sm');
      service.addVisitedNode('smc');

      service.resetVisited();

      expect(service.visitedNodes).toEqual([]);
      expect(service.currentIndex).toBe(0);
    });
  });

  describe('undo and redo', () => {
    const state = (label: string): TreeNode[] => [{ key: label, label }];

    it('restores the previous state and keeps the selection of the undone step', () => {
      service.registerUndoStep(state('initial'), 'sm');
      service.registerUndoStep(state('renamed'), 'prop');

      expect(service.hasUndoStep()).toBe(true);
      expect(service.hasRedoStep()).toBe(false);

      service.undo();

      expect(treeComponent.applyState).toHaveBeenLastCalledWith(state('initial'), 'prop');
      expect(service.hasUndoStep()).toBe(false);
      expect(service.hasRedoStep()).toBe(true);

      service.redo();

      expect(treeComponent.applyState).toHaveBeenLastCalledWith(state('renamed'), 'prop');
      expect(service.hasRedoStep()).toBe(false);
    });

    it('stores a snapshot that is not affected by later changes of the tree', () => {
      const tree = state('initial');
      service.registerUndoStep(tree, 'sm');

      tree[0].label = 'changed afterwards';

      expect(service.undoStack[0].state[0].label).toBe('initial');
    });

    it('discards redo steps when a new step is registered after undo', () => {
      service.registerUndoStep(state('a'), 'sm');
      service.registerUndoStep(state('b'), 'sm');
      service.registerUndoStep(state('c'), 'sm');
      service.undo();

      service.registerUndoStep(state('d'), 'sm');

      expect(service.undoStack.map((step) => step.state[0].label)).toEqual(['a', 'b', 'd']);
      expect(service.hasRedoStep()).toBe(false);
    });

    it('ignores steps without selected node', () => {
      service.registerUndoStep(state('a'), '');

      expect(service.undoStack).toEqual([]);
      expect(service.hasUndoStep()).toBe(false);
    });

    it('records field changes with the currently selected node', () => {
      const { phoneNode } = createTree();
      service.aasTreeData = [{ key: 'root', label: 'root' }];
      service.selectedTreeNode = phoneNode;

      service.registerFieldUndoStep();

      expect(service.undoStack).toHaveLength(1);
      expect(service.undoStack[0].selectedId).toBe('prop');
      expect(service.undoStack[0].state).toEqual([{ key: 'root', label: 'root' }]);
    });

    it('clears the history on reset', () => {
      service.registerUndoStep(state('a'), 'sm');
      service.registerUndoStep(state('b'), 'sm');

      service.resetUndo();

      expect(service.undoStack).toEqual([]);
      expect(service.hasUndoStep()).toBe(false);
      expect(service.hasRedoStep()).toBe(false);
    });
  });

  describe('context of the selected node', () => {
    it('resolves the surrounding shell and submodel of a nested element', () => {
      const { shell, nameplate, phoneNode } = createTree();
      service.selectedTreeNode = phoneNode;

      expect(service.getCurrentAasId()).toBe('https://example.com/ids/aas/pump_4711');
      expect(service.getIdShort()).toBe('Pump4711');
      expect(service.getAssetInformation()).toBe(shell.assetInformation);
      expect(service.getCurrentSubmodel()).toBe(nameplate);
    });

    it('builds the idShort path relative to the submodel', () => {
      const { phoneNode, submodelNode } = createTree();

      service.selectedTreeNode = phoneNode;
      expect(service.getCurrentIdShortPath()).toBe('ContactInformation.Phone');

      service.selectedTreeNode = submodelNode;
      expect(service.getCurrentIdShortPath()).toBe('');
    });

    it('returns nothing when the selection has no parent shell or submodel', () => {
      const orphan = node('cd', EditorTypeOption.ConceptDescription, new T.ConceptDescription('urn:example:cd:1'));
      service.selectedTreeNode = orphan;

      expect(service.getCurrentAasId()).toBeUndefined();
      expect(service.getCurrentSubmodel()).toBeUndefined();
    });
  });

  describe('tree component delegation', () => {
    it('selects the node that contains a given element', () => {
      const { phone, phoneNode, shellNode } = createTree();
      service.aasTreeData = [shellNode];
      treeComponent.findNodeByElementRecursive.mockReturnValue(phoneNode);

      service.selectNodeByElement(phone);

      expect(treeComponent.findNodeByElementRecursive).toHaveBeenCalledWith(shellNode, phone);
      expect(treeComponent.selectById).toHaveBeenCalledWith('prop');
    });

    it('does not change the selection when the element is not in the tree', () => {
      treeComponent.findNodeByElementRecursive.mockReturnValue(null);

      service.selectNodeByElement({});

      expect(treeComponent.selectById).not.toHaveBeenCalled();
    });

    it('updates a node label with the translated label key', () => {
      const { phoneNode } = createTree();
      treeComponent.findNodeById.mockReturnValue(phoneNode);
      treeComponent.getNodeLabel.mockReturnValue('PHONE');

      service.updateLabel('prop');

      expect(phoneNode.label).toBe('translated:PHONE');
    });

    it('keeps the label when no label key is available', () => {
      const { phoneNode } = createTree();
      treeComponent.findNodeById.mockReturnValue(phoneNode);
      treeComponent.getNodeLabel.mockReturnValue('');

      service.updateLabel('prop');

      expect(phoneNode.label).toBe('prop');
    });

    it('appends built children to a node', () => {
      const { contactNode } = createTree();
      const child: TreeNode = { key: 'new', label: 'new' };
      treeComponent.buildSubmodelChildren.mockReturnValue([child]);

      service.buildChildTree({ idShort: 'Email' }, contactNode);

      expect(contactNode.children?.at(-1)).toBe(child);
    });

    it('does not fail without a registered tree component', () => {
      service.treeComponent = undefined;

      expect(() => {
        service.selectById('sm');
        service.refreshWholeTree();
        service.selectNodeByElement({});
        service.updateLabel('sm');
      }).not.toThrow();
    });
  });
});
