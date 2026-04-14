import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { Clipboard } from '@angular/cdk/clipboard';
import { TestBed } from '@angular/core/testing';
import { TreeNode } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { vi } from 'vitest';

import { NotificationService, PortalService } from '@aas/common-services';
import { TranslateService } from '@ngx-translate/core';
import { GeneratorService } from '../../generator/generator.service';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { V3EditorService } from '../v3-editor.service';
import { V3TreeService } from '../v3-tree/v3-tree.service';
import { V3OptionalElementsFinder } from './v3-optional-elements-finder';
import { V3TreeContextMenuComponent } from './v3-tree-context-menu.component';

function createComponent(confirmResult: boolean) {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [
      { provide: GeneratorService, useValue: {} },
      { provide: DialogService, useValue: { open: vi.fn() } },
    ],
  });

  const treeService = {
    aasTreeData: [],
    buildChildTree: vi.fn(),
    registerFieldUndoStep: vi.fn(),
    selectById: vi.fn(),
  };

  const component = TestBed.runInInjectionContext(
    () =>
      new V3TreeContextMenuComponent(
        { instant: vi.fn((key: string) => key) } as unknown as TranslateService,
        { confirm: vi.fn().mockResolvedValue(confirmResult) } as any,
        {} as V3EditorService,
        treeService as unknown as V3TreeService,
        { showMessageAlways: vi.fn() } as unknown as NotificationService,
        { copy: vi.fn() } as unknown as Clipboard,
        {} as V3OptionalElementsFinder,
        {} as PortalService,
      ),
  );

  return {
    component,
    treeService,
  };
}

function createListNode(template: aas.types.ISubmodelElement): TreeNode<V3TreeItem<any>> {
  const list = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.SubmodelElementCollection);
  list.idShort = 'Rows';
  list.value = [template];

  const listItem = new V3TreeItem<aas.types.SubmodelElementList>();
  listItem.id = 'rows';
  listItem.content = list;
  listItem.editorType = EditorTypeOption.SubmodelElementList;

  return {
    key: 'rows',
    label: 'Rows',
    data: listItem,
    children: [],
    expanded: false,
  };
}

function createSubmodelNode(
  kind: aas.types.ModellingKind = aas.types.ModellingKind.Instance,
): TreeNode<V3TreeItem<any>> {
  const submodel = new aas.types.Submodel('urn:test:submodel');
  submodel.idShort = 'TestSubmodel';
  submodel.kind = kind;

  const submodelItem = new V3TreeItem<aas.types.Submodel>();
  submodelItem.id = 'submodel';
  submodelItem.content = submodel;
  submodelItem.editorType = EditorTypeOption.Submodel;

  return {
    key: 'submodel',
    label: 'TestSubmodel',
    data: submodelItem,
    children: [],
    expanded: false,
  };
}

function createQualifier(kind: aas.types.QualifierKind, type: string): aas.types.Qualifier {
  const qualifier = new aas.types.Qualifier(type, aas.types.DataTypeDefXsd.String);
  qualifier.kind = kind;
  return qualifier;
}

function findMenuItem(items: { label?: string; visible?: boolean }[] | undefined, label: string) {
  return items?.find((item) => item.label === label);
}

describe('V3TreeContextMenuComponent', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('stops the trigger event before opening the actions popover', async () => {
    const { component } = createComponent(true);
    const stopPropagation = vi.fn();
    const preventDefault = vi.fn();
    const toggle = vi.fn();

    await component.onShowActions(
      {
        stopPropagation,
        preventDefault,
      } as unknown as Event,
      { toggle } as unknown as any,
    );

    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(toggle).toHaveBeenCalledTimes(1);
  });

  it('copies the first SML child and keeps its values when confirmed', async () => {
    vi.useFakeTimers();

    const row = new aas.types.SubmodelElementCollection();
    row.idShort = 'Row';

    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    property.idShort = 'Name';
    property.value = 'template value';
    row.value = [property];

    const { component, treeService } = createComponent(true);
    component.node = createListNode(row);

    await component.insertSubmodelElementlistChild();
    vi.runAllTimers();

    const list = component.node.data.content as aas.types.SubmodelElementList;
    const inserted = list.value?.[1] as aas.types.SubmodelElementCollection;
    const insertedProperty = inserted.value?.[0] as aas.types.Property;

    expect(list.value).toHaveLength(2);
    expect(inserted).toBeInstanceOf(aas.types.SubmodelElementCollection);
    expect(inserted.idShort).toBe('copy_of_Row');
    expect(insertedProperty.value).toBe('template value');
    expect(treeService.registerFieldUndoStep).toHaveBeenCalledTimes(1);
  });

  it('clears copied values recursively when template values are not kept', async () => {
    vi.useFakeTimers();

    const row = new aas.types.SubmodelElementCollection();
    row.idShort = 'Row';

    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    property.idShort = 'Name';
    property.value = 'template value';

    const mlp = new aas.types.MultiLanguageProperty();
    mlp.idShort = 'Description';
    mlp.value = [new aas.types.LangStringTextType('de', 'Vorlage')];

    const nestedList = new aas.types.SubmodelElementList(aas.types.AasSubmodelElements.Property);
    nestedList.idShort = 'Nested';
    const nestedProperty = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    nestedProperty.idShort = 'NestedName';
    nestedProperty.value = 'nested template value';
    nestedList.value = [nestedProperty];

    row.value = [property, mlp, nestedList];

    const { component, treeService } = createComponent(false);
    component.node = createListNode(row);

    await component.insertSubmodelElementlistChild();
    vi.runAllTimers();

    const list = component.node.data.content as aas.types.SubmodelElementList;
    const inserted = list.value?.[1] as aas.types.SubmodelElementCollection;
    const insertedProperty = inserted.value?.[0] as aas.types.Property;
    const insertedMlp = inserted.value?.[1] as aas.types.MultiLanguageProperty;
    const insertedNestedList = inserted.value?.[2] as aas.types.SubmodelElementList;
    const insertedNestedProperty = insertedNestedList.value?.[0] as aas.types.Property;

    expect(inserted.idShort).toBe('copy_of_Row');
    expect(insertedProperty.value).toBeNull();
    expect(insertedMlp.value).toBeNull();
    expect(insertedNestedProperty.value).toBeNull();
    expect(property.value).toBe('template value');
    expect(mlp.value?.[0].text).toBe('Vorlage');
    expect(nestedProperty.value).toBe('nested template value');
    expect(treeService.registerFieldUndoStep).toHaveBeenCalledTimes(1);
  });

  it('shows template qualifier removal only for non-template submodels', async () => {
    const stopPropagation = vi.fn();
    const preventDefault = vi.fn();
    const toggle = vi.fn();

    const { component: instanceComponent } = createComponent(true);
    instanceComponent.node = createSubmodelNode(aas.types.ModellingKind.Instance);

    await instanceComponent.onShowActions(
      {
        stopPropagation,
        preventDefault,
      } as unknown as Event,
      { toggle } as unknown as any,
    );

    expect(findMenuItem(instanceComponent.menuItems, 'REMOVE_TEMPLATE_QUALIFIERS')?.visible).toBe(true);

    const { component: templateComponent } = createComponent(true);
    templateComponent.node = createSubmodelNode(aas.types.ModellingKind.Template);

    await templateComponent.onShowActions(
      {
        stopPropagation: vi.fn(),
        preventDefault: vi.fn(),
      } as unknown as Event,
      { toggle: vi.fn() } as unknown as any,
    );

    expect(findMenuItem(templateComponent.menuItems, 'REMOVE_TEMPLATE_QUALIFIERS')?.visible).toBe(false);
  });

  it('removes template qualifiers recursively from a confirmed submodel action', async () => {
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    property.idShort = 'Property';
    property.qualifiers = [
      createQualifier(aas.types.QualifierKind.TemplateQualifier, 'TemplateOne'),
      createQualifier(aas.types.QualifierKind.ConceptQualifier, 'ConceptOne'),
    ];

    const nestedProperty = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    nestedProperty.idShort = 'NestedProperty';
    nestedProperty.qualifiers = [createQualifier(aas.types.QualifierKind.TemplateQualifier, 'NestedTemplate')];

    const collection = new aas.types.SubmodelElementCollection();
    collection.idShort = 'Collection';
    collection.qualifiers = [createQualifier(aas.types.QualifierKind.TemplateQualifier, 'CollectionTemplate')];
    collection.value = [nestedProperty];

    const entityProperty = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    entityProperty.idShort = 'EntityProperty';
    entityProperty.qualifiers = [createQualifier(aas.types.QualifierKind.TemplateQualifier, 'EntityTemplate')];

    const entity = new aas.types.Entity(aas.types.EntityType.CoManagedEntity);
    entity.idShort = 'Entity';
    entity.statements = [entityProperty];

    const operationProperty = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    operationProperty.idShort = 'OperationProperty';
    operationProperty.qualifiers = [createQualifier(aas.types.QualifierKind.TemplateQualifier, 'OperationTemplate')];

    const operation = new aas.types.Operation();
    operation.idShort = 'Operation';
    operation.inputVariables = [new aas.types.OperationVariable(operationProperty)];

    const submodelNode = createSubmodelNode();
    const submodel = submodelNode.data?.content as aas.types.Submodel;
    submodel.submodelElements = [property, collection, entity, operation];

    const { component, treeService } = createComponent(true);
    treeService.aasTreeData = [submodelNode];
    const initialTreeReference = treeService.aasTreeData;
    component.node = submodelNode;

    await component.removeTemplateQualifiers();

    expect(property.qualifiers).toHaveLength(1);
    expect(property.qualifiers?.[0].kind).toBe(aas.types.QualifierKind.ConceptQualifier);
    expect(collection.qualifiers).toBeNull();
    expect(nestedProperty.qualifiers).toBeNull();
    expect(entityProperty.qualifiers).toBeNull();
    expect(operationProperty.qualifiers).toBeNull();
    expect(treeService.registerFieldUndoStep).toHaveBeenCalledTimes(1);
    expect(treeService.aasTreeData).not.toBe(initialTreeReference);
  });

  it('does not change qualifiers when template qualifier removal is cancelled', async () => {
    const property = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    property.idShort = 'Property';
    property.qualifiers = [createQualifier(aas.types.QualifierKind.TemplateQualifier, 'TemplateOne')];

    const submodelNode = createSubmodelNode();
    const submodel = submodelNode.data?.content as aas.types.Submodel;
    submodel.submodelElements = [property];

    const { component, treeService } = createComponent(false);
    component.node = submodelNode;

    await component.removeTemplateQualifiers();

    expect(property.qualifiers).toHaveLength(1);
    expect(property.qualifiers?.[0].kind).toBe(aas.types.QualifierKind.TemplateQualifier);
    expect(treeService.registerFieldUndoStep).not.toHaveBeenCalled();
  });
});
