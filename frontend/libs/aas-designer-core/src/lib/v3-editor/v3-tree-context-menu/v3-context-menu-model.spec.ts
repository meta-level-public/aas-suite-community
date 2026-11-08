import { MenuItem } from '@openng/optimus-ui/api';
import { vi } from 'vitest';
import { CMTransformOption } from '../model/cm-transform-option';
import { CMTypeOption } from '../model/cm-type-option';
import { buildContextMenuModel, ContextMenuActions, ContextMenuState } from './v3-context-menu-model';

function createActions(calls: string[]): ContextMenuActions {
  const record =
    (name: string) =>
    (...args: unknown[]) => {
      calls.push(args.length > 0 ? `${name}(${args.join(',')})` : name);
    };
  return {
    hideMenu: record('hide'),
    createShell: record('createShell'),
    openInsertSubmodelDialog: record('openInsertSubmodelDialog'),
    showReferrableSubmodels: record('showReferrableSubmodels'),
    openInsertElementDialog: record('openInsertElementDialog'),
    insertSmlChild: vi.fn(async () => record('insertSmlChild')()),
    openInsertSnippetDialog: record('openInsertSnippetDialog'),
    openInsertJsonDialog: record('openInsertJsonDialog'),
    transform: record('transform'),
    copy: record('copy'),
    paste: record('paste'),
    removeTemplateQualifiers: vi.fn(async () => record('removeTemplateQualifiers')()),
    delete: record('delete'),
    saveAsSnippet: record('saveAsSnippet'),
    saveAsJson: record('saveAsJson'),
  };
}

function createState(overrides: Partial<ContextMenuState> = {}): ContextMenuState {
  return {
    isInsertAllowed: () => false,
    isTransformAllowed: () => false,
    canInsertSmlChild: false,
    canCopy: false,
    canPaste: false,
    canRemoveTemplateQualifiers: false,
    canDelete: false,
    canSaveAs: false,
    optionalItems: [],
    missingItems: [],
    addonItems: [],
    ...overrides,
  };
}

function find(items: MenuItem[] | undefined, label: string): MenuItem | undefined {
  return items?.find((item) => item.label === label);
}

describe('buildContextMenuModel', () => {
  it('shows the entries according to the state and uses the loaded sub items', () => {
    const optionalItems = [{ label: 'Optional' }];
    const model = buildContextMenuModel(
      (key) => key,
      createState({
        isInsertAllowed: (type) => type === CMTypeOption.AddGroup || type === CMTypeOption.OptionalElements,
        canCopy: true,
        optionalItems,
      }),
      createActions([]),
    );

    const add = find(model, 'ADD');
    expect(add?.visible).toBe(true);
    expect(find(add?.items, 'OPTIONAL_ELEMENTS')?.visible).toBe(true);
    expect(find(add?.items, 'OPTIONAL_ELEMENTS')?.items).toEqual(optionalItems);
    expect(find(add?.items, 'SUBMODELS')?.visible).toBe(false);
    expect(find(model, 'COPY')?.visible).toBe(true);
    expect(find(model, 'PASTE')?.visible).toBe(false);
    expect(find(model, 'SAVE_AS')?.visible).toBe(false);
  });

  it('shows the add menu for lists because of "add child element"', () => {
    const model = buildContextMenuModel((key) => key, createState({ canInsertSmlChild: true }), createActions([]));

    expect(find(model, 'ADD')?.visible).toBe(true);
    expect(find(find(model, 'ADD')?.items, 'ADD_CHILD_ELEMENT')?.visible).toBe(true);
  });

  it('closes the menu before running copy, paste, delete and the JSON import', async () => {
    const calls: string[] = [];
    const model = buildContextMenuModel((key) => key, createState(), createActions(calls));

    await find(model, 'COPY')?.command?.({});
    await find(model, 'PASTE')?.command?.({});
    await find(model, 'DELETE')?.command?.({});
    await find(find(model, 'ADD')?.items, 'EL_FROM_JSON')?.command?.({});
    await find(find(model, 'ADD')?.items, 'FROM_JSON')?.command?.({});

    expect(calls).toEqual([
      'hide',
      'copy',
      'hide',
      'paste',
      'hide',
      'delete',
      'hide',
      'openInsertJsonDialog(element)',
      'hide',
      'openInsertJsonDialog(cd)',
    ]);
  });

  it('keeps the menu open for the submodel dialogs', async () => {
    const calls: string[] = [];
    const add = find(
      buildContextMenuModel((key) => key, createState(), createActions(calls)),
      'ADD',
    );

    await find(add?.items, 'SUBMODELS')?.command?.({});
    await find(add?.items, 'SUBMODEL_REF')?.command?.({});

    expect(calls).toEqual(['openInsertSubmodelDialog', 'showReferrableSubmodels']);
  });

  it('offers the transformations allowed by the state and runs them', () => {
    const calls: string[] = [];
    const transform = find(
      buildContextMenuModel(
        (key) => key,
        createState({ isTransformAllowed: (option) => option === CMTransformOption.TO_SUBMODEL_ELEMENT_LIST }),
        createActions(calls),
      ),
      'TRANSFORM',
    );

    const visible = transform?.items?.filter((item) => item.visible).map((item) => item.label);
    expect(visible).toEqual(['TRANSFORM_TO_SML']);

    find(transform?.items, 'TRANSFORM_TO_SML')?.command?.({});
    expect(calls).toEqual([`transform(${CMTransformOption.TO_SUBMODEL_ELEMENT_LIST})`, 'hide']);
  });
});
