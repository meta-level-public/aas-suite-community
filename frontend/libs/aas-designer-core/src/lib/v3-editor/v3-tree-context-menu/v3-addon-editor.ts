import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { FilenameHelper, HandoverSemantics, SemanticIdHelper } from '@aas/helpers';
import { ShellResult, SupplementalFile } from '@aas/model';
import { MenuItem } from '@openng/optimus-ui/api';
import { DialogService, DynamicDialogRef } from '@openng/optimus-ui/dynamicdialog';
import {
  createDocumentationDocument,
  getDocumentationDocumentSemanticIdForHost,
  isDocumentationDocumentCollection,
} from '../../generator/generator-documentation.builder';
import { DocumentItem } from '../../generator/model/document-item';
import { CapabilityAddonComponent } from '../addons/capability-addon/capability-addon.component';
import { HandoverdocumentationDocumentAddonComponent } from '../addons/handoverdocumentation-document-addon/handoverdocumentation-document-addon.component';
import { ContactInformationAddonComponent } from '../components/contact-information-addon/contact-information-addon.component';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeNode } from '../v3-tree/v3-tree-node';
import { V3TreeService } from '../v3-tree/v3-tree.service';
import { AddonResolver, AddonType } from './addon-resolver';
import {
  collectAvailableCapabilityRefs,
  countCapabilityContainers,
  createCapabilitySet,
  isCapabilityDescriptionSubmodel,
  isCapabilitySet,
} from './v3-capability-addon-helpers';
import { getSubmodelIdOfItem } from './v3-template-path';

/** Dependencies of the addon editors, provided by the tree context menu. */
export interface AddonEditorContext {
  dialogService: DialogService;
  translate: (key: string) => string;
  currentLanguage: string;
  treeService: V3TreeService;
  shellResult: ShellResult | undefined;
  /** Node the context menu belongs to (read at the time of use). */
  getNode: () => V3TreeNode | undefined;
  /** Inserts the element below the target node (default: the context menu node) and selects it. */
  insertElement: (element: aas.types.ISubmodelElement, editorType: EditorTypeOption, targetNode?: V3TreeNode) => void;
}

const NUMBER_OF_DOCUMENTS_SEMANTIC_ID = '0173-1#02-ABH990#001';

const ADDON_LABELS: Record<AddonType, string> = {
  [AddonType.ADDON_HANDOVERDOCUMENTATION_DOCUMENT]: 'DOCUMENT',
  [AddonType.CONTACT_INFORMATION]: 'CONTACT_INFORMATION',
  [AddonType.ADDON_CAPABILITY]: 'CAPABILITY',
};

const ADDON_DIALOG_DEFAULTS = {
  width: '75%',
  contentStyle: { overflow: 'auto' },
  baseZIndex: 10000,
  maximizable: true,
  closable: true,
  modal: true,
};

/** Menu entries of the addons available for the content ("nothing available" if there is none). */
export function buildAddonMenuItems(
  content: unknown,
  translate: (key: string) => string,
  onSelect: (addonType: AddonType) => void,
): MenuItem[] {
  try {
    if (content !== undefined) {
      const addonElements: MenuItem[] = AddonResolver.getAddons(content as aas.types.IHasSemantics).map((el) => ({
        label: translate(ADDON_LABELS[el]),
        data: el,
        command: () => onSelect(el),
      }));
      return addonElements.length > 0 ? addonElements : [{ label: translate('NOTHING_AVAILABLE') }];
    }
  } catch {
    // ignore
  }
  return [{ label: translate('NOTHING_AVAILABLE') }];
}

/**
 * Opens the dialog of the addon and inserts its result into the model and the tree.
 * Returns the dialog reference or undefined if no dialog was opened.
 */
export function openAddonEditor(ctx: AddonEditorContext, addonType: AddonType): DynamicDialogRef | null | undefined {
  switch (addonType) {
    case AddonType.ADDON_HANDOVERDOCUMENTATION_DOCUMENT:
      return openHandoverDocumentationEditor(ctx);
    case AddonType.CONTACT_INFORMATION:
      return openContactInformationEditor(ctx);
    case AddonType.ADDON_CAPABILITY:
      return openCapabilityEditor(ctx);
  }
}

function getSubmodelElements(node: V3TreeNode | undefined): aas.types.ISubmodelElement[] | null | undefined {
  return (node?.data?.content as aas.types.Submodel | undefined)?.submodelElements;
}

function openHandoverDocumentationEditor(ctx: AddonEditorContext) {
  const submodelElements = getSubmodelElements(ctx.getNode());
  const docs = submodelElements?.filter((el) => isDocumentationDocumentCollection(el));
  const documentList = submodelElements?.find(
    (el) =>
      el instanceof aas.types.SubmodelElementList && SemanticIdHelper.hasSemanticId(el, HandoverSemantics.CONTAINER_V2),
  ) as aas.types.SubmodelElementList | undefined;
  const count = docs?.length ?? 0;

  const ref = ctx.dialogService.open(HandoverdocumentationDocumentAddonComponent, {
    ...ADDON_DIALOG_DEFAULTS,
    header: ctx.translate('ADD_DOCUMENT'),
    data: { count },
  });

  ref?.onClose.subscribe((documentItem: DocumentItem) => {
    if (documentItem == null) return;

    const doc = createDocumentationDocument(
      count,
      [],
      documentItem,
      ctx.currentLanguage,
      documentList != null ? getDocumentationDocumentSemanticIdForHost(documentList) : undefined,
    );

    if (documentList != null) {
      documentList.typeValueListElement = aas.types.AasSubmodelElements.SubmodelElementCollection;
      if (documentList.value == null) {
        documentList.value = [];
      }
      documentList.value.push(doc);
      ctx.treeService.refreshWholeTree();
    } else {
      ctx.insertElement(doc, EditorTypeOption.SubmodelElementCollection);
    }

    const numberOfDocuments = getSubmodelElements(ctx.getNode())?.find(
      (el) => SemanticIdHelper.hasSemanticId(el, NUMBER_OF_DOCUMENTS_SEMANTIC_ID) === true,
    );
    if (numberOfDocuments != null) {
      (numberOfDocuments as aas.types.Property).value = (count + 1).toString();
    }

    if (documentItem.file != null) {
      // copy document into the supplemental files
      const supplementalFile = createLocalSupplementalFile(documentItem.file);
      ctx.shellResult?.supplementalFiles.push(supplementalFile);
      ctx.shellResult?.addedFiles.push(supplementalFile);
      ctx.treeService.addFileNode(supplementalFile);
    }
  });
  return ref;
}

/** Supplemental file for a file that only exists locally (not yet uploaded). */
export function createLocalSupplementalFile(file: File): SupplementalFile {
  const sanitizedFilename = FilenameHelper.sanitizeFilename(file?.name ?? 'newFile');
  return {
    path: sanitizedFilename,
    filename: sanitizedFilename,
    fileApiUrl: '',
    fileUrl: null,
    fileResourceUrl: URL.createObjectURL(file),
    contentType: FilenameHelper.getContentType(file),
    file,
    isLoaded: true,
    isLoading: false,
    isLocal: true,
    fileData: file,
    id: null,
    isThumbnail: false,
  };
}

function openContactInformationEditor(ctx: AddonEditorContext) {
  const ref = ctx.dialogService.open(ContactInformationAddonComponent, {
    ...ADDON_DIALOG_DEFAULTS,
    header: ctx.translate('ADD_CONTACT_INFORMATION'),
  });

  ref?.onClose.subscribe((contactInfoItem: aas.types.SubmodelElementCollection) => {
    // insert all returned elements
    contactInfoItem?.value?.forEach((element) => {
      if (element instanceof aas.types.SubmodelElementCollection) {
        ctx.insertElement(element, EditorTypeOption.SubmodelElementCollection);
      }
      if (element instanceof aas.types.Property) {
        ctx.insertElement(element, EditorTypeOption.Property);
      }
      if (element instanceof aas.types.MultiLanguageProperty) {
        ctx.insertElement(element, EditorTypeOption.MultiLanguageProperty);
      }
    });
  });
  return ref;
}

function openCapabilityEditor(ctx: AddonEditorContext) {
  const targetNode = ensureCapabilitySetNode(ctx);
  if (targetNode == null) {
    return undefined;
  }

  const count = countCapabilityContainers(targetNode.data?.content);
  const ref = ctx.dialogService.open(CapabilityAddonComponent, {
    ...ADDON_DIALOG_DEFAULTS,
    header: ctx.translate('ADD_CAPABILITY'),
    data: {
      count,
      currentLanguage: ctx.currentLanguage,
      currentSubmodelId: getSubmodelIdOfItem(ctx.getNode()?.data),
      availableCapabilityRefs: collectAvailableCapabilityRefs(targetNode.data?.content),
    },
  });

  ref?.onClose.subscribe((capabilityContainer: aas.types.SubmodelElementCollection | null) => {
    if (capabilityContainer != null) {
      ctx.insertElement(capabilityContainer, EditorTypeOption.SubmodelElementCollection, targetNode);
    }
  });
  return ref;
}

/**
 * Node of the CapabilitySet the capability is added to: the node itself, the existing CapabilitySet of a
 * capability description submodel, or a newly created CapabilitySet in that submodel.
 */
function ensureCapabilitySetNode(ctx: AddonEditorContext): V3TreeNode | null {
  const node = ctx.getNode();
  const content = node?.data?.content;
  if (node == null || content == null) {
    return null;
  }

  if (isCapabilitySet(content)) {
    return node;
  }

  if (isCapabilityDescriptionSubmodel(content)) {
    const existingNode = node.children?.find((child) => isCapabilitySet(child.data?.content));
    if (existingNode != null) {
      return existingNode;
    }

    const capabilitySet = createCapabilitySet();
    ctx.insertElement(capabilitySet, EditorTypeOption.SubmodelElementCollection);
    return node.children?.find((child) => child.data?.content === capabilitySet) ?? null;
  }

  return null;
}
