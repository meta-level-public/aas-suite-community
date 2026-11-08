import { MenuItem } from '@openng/optimus-ui/api';
import { CMTransformOption } from '../model/cm-transform-option';
import { CMTypeOption } from '../model/cm-type-option';

/** Which entries of the context menu are visible, plus the sub items that were loaded beforehand. */
export interface ContextMenuState {
  isInsertAllowed: (type: CMTypeOption) => boolean;
  isTransformAllowed: (option: CMTransformOption) => boolean;
  canInsertSmlChild: boolean;
  canCopy: boolean;
  canPaste: boolean;
  canRemoveTemplateQualifiers: boolean;
  canDelete: boolean;
  canSaveAs: boolean;
  optionalItems: MenuItem[];
  missingItems: MenuItem[];
  addonItems: MenuItem[];
}

/** Callbacks of the context menu entries. */
export interface ContextMenuActions {
  hideMenu: () => void;
  createShell: () => void;
  openInsertSubmodelDialog: () => void;
  showReferrableSubmodels: () => void;
  openInsertElementDialog: () => void;
  insertSmlChild: () => Promise<void>;
  openInsertSnippetDialog: () => void;
  openInsertJsonDialog: (type: 'submodel' | 'element' | 'cd') => void;
  transform: (option: CMTransformOption) => void;
  copy: () => void;
  paste: () => void;
  removeTemplateQualifiers: () => Promise<void>;
  delete: () => void;
  saveAsSnippet: () => void;
  saveAsJson: () => void;
}

const TRANSFORM_ENTRIES: { label: string; option: CMTransformOption }[] = [
  { label: 'TRANSFORM_TO_PROPERTY', option: CMTransformOption.TO_PROPERTY },
  { label: 'TRANSFORM_TO_MLP', option: CMTransformOption.TO_MULTILANGUAGE_PROPERTY },
  { label: 'TRANSFORM_TO_SML', option: CMTransformOption.TO_SUBMODEL_ELEMENT_LIST },
  { label: 'TRANSFORM_TO_SMC', option: CMTransformOption.TO_SUBMODEL_ELEMENT_COLLECTION },
];

/** Builds the model of the tree context menu (add, transform, copy/paste, delete, save as). */
export function buildContextMenuModel(
  translate: (key: string) => string,
  state: ContextMenuState,
  actions: ContextMenuActions,
): MenuItem[] {
  const { hideMenu } = actions;
  /** Runs the action after closing the menu. */
  const hideThen = (action: () => void | Promise<void>) => async () => {
    hideMenu();
    await action();
  };
  const jsonImport = (label: string, type: 'submodel' | 'element' | 'cd', allowedFor: CMTypeOption): MenuItem => ({
    label: translate(label),
    icon: 'fa-solid fa-code',
    command: hideThen(() => actions.openInsertJsonDialog(type)),
    visible: state.isInsertAllowed(allowedFor),
  });

  return [
    {
      label: translate('ADD'),
      icon: 'pi pi-plus',
      items: [
        {
          label: translate('SHELLS'),
          icon: 'fa-solid fa-gear',
          command: hideThen(actions.createShell),
          visible: state.isInsertAllowed(CMTypeOption.AssetAdministrationShell),
        },
        {
          label: translate('SUBMODELS'),
          icon: 'fa-solid fa-gear',
          command: () => actions.openInsertSubmodelDialog(),
          visible: state.isInsertAllowed(CMTypeOption.Submodel),
        },
        {
          label: translate('SUBMODEL_REF'),
          icon: 'fa-solid fa-gear',
          command: () => actions.showReferrableSubmodels(),
          visible: state.isInsertAllowed(CMTypeOption.Submodel),
        },
        {
          label: translate('SUBMODEL_ELEMENTS'),
          icon: 'fa-solid fa-gears',
          command: hideThen(actions.openInsertElementDialog),
          visible: state.isInsertAllowed(CMTypeOption.ElementGroup),
        },
        {
          label: translate('ADD_CHILD_ELEMENT'),
          icon: 'fa-solid fa-gears',
          command: hideThen(actions.insertSmlChild),
          visible: state.canInsertSmlChild,
        },
        {
          label: translate('OPTIONAL_ELEMENTS'),
          icon: 'fa-solid fa-gear',
          items: [...state.optionalItems],
          visible: state.isInsertAllowed(CMTypeOption.OptionalElements),
        },
        {
          label: translate('MISSING_ELEMENTS'),
          icon: 'fa-solid fa-gear',
          items: [...state.missingItems],
          visible: state.isInsertAllowed(CMTypeOption.OptionalElements),
        },
        {
          label: translate('SNIPPETS'),
          icon: 'pi pi-file',
          visible: state.isInsertAllowed(CMTypeOption.SnippetGroup),
          command: hideThen(actions.openInsertSnippetDialog),
        },
        {
          label: translate('FROM_ADDON'),
          icon: 'pi pi-book',
          items: [...state.addonItems],
          visible: state.isInsertAllowed(CMTypeOption.Addon),
        },
        jsonImport('SM_FROM_JSON', 'submodel', CMTypeOption.SMFromJson),
        jsonImport('EL_FROM_JSON', 'element', CMTypeOption.ElFromJson),
        jsonImport('FROM_JSON', 'cd', CMTypeOption.CdFromJson),
      ],
      visible: state.isInsertAllowed(CMTypeOption.AddGroup) || state.canInsertSmlChild,
    },
    { separator: true },
    {
      label: translate('TRANSFORM'),
      icon: 'pi pi-arrow-right-arrow-left',
      items: TRANSFORM_ENTRIES.map(({ label, option }) => ({
        label: translate(label),
        command: () => {
          actions.transform(option);
          hideMenu();
        },
        visible: state.isTransformAllowed(option),
      })),
    },
    { separator: true },
    {
      label: translate('COPY'),
      icon: 'fa-solid fa-copy',
      command: hideThen(actions.copy),
      visible: state.canCopy,
    },
    {
      label: translate('PASTE'),
      icon: 'fa-solid fa-paste',
      command: hideThen(actions.paste),
      visible: state.canPaste,
    },
    {
      label: translate('REMOVE_TEMPLATE_QUALIFIERS'),
      icon: 'pi pi-eraser',
      command: hideThen(actions.removeTemplateQualifiers),
      visible: state.canRemoveTemplateQualifiers,
    },
    {
      label: translate('DELETE'),
      icon: 'pi pi-trash',
      command: hideThen(actions.delete),
      visible: state.canDelete,
    },
    {
      label: translate('SAVE_AS'),
      icon: 'pi pi-sign-out',
      items: [
        {
          label: translate('SAVE_AS_SNIPPET'),
          icon: 'pi pi-file',
          command: hideThen(actions.saveAsSnippet),
          visible: state.canSaveAs,
        },
        {
          label: translate('SAVE_AS_JSON'),
          icon: 'pi pi-download',
          command: hideThen(actions.saveAsJson),
          visible: state.canSaveAs,
        },
      ],
      visible: state.canSaveAs,
    },
  ];
}
