import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { InstanceHelper, SemanticIdHelper } from '@aas/helpers';
import { ApiException } from '@aas/jwt-auth';
import { MenuItem, TreeNode } from '@openng/optimus-ui/api';
import { SubmodelResult } from '../../generator/model/submodel-result';
import { V3TreeItem } from '../model/v3-tree-item';
import { createTemplatePath, getSubmodelIdShort, getSubmodelSemanticId } from './v3-template-path';

/** Loads the optional or required template elements for a node (see V3OptionalElementsFinder). */
export type TemplateElementLoader = (
  path: string,
  submodelId: string,
  semanticId: string,
  content: unknown,
) => Promise<MenuItem[]>;

export interface TemplateElementItemsOptions {
  translate: (key: string) => string;
  loadElements: TemplateElementLoader;
  loadContactInformationSubmodel: () => Promise<SubmodelResult>;
  /** true: required (missing) elements, false: optional elements. */
  required: boolean;
  /** Called when the user selects an element, with the template element and its type. */
  onSelect: (element: aas.types.ISubmodelElement, type: string) => void;
}

const ADDRESS_INFORMATION_SEMANTIC_ID =
  'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation';
const CONTACT_INFORMATION_SEMANTIC_ID =
  'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation';

/** Contact information values that belong to the required elements of an address information. */
const REQUIRED_CONTACT_INFORMATION_SEMANTIC_IDS = [
  '0173-1#02-AAO128#002',
  '0173-1#02-AAO129#002',
  '0173-1#02-AAO132#002',
  '0173-1#02-AAO134#002',
];

/**
 * Builds the menu entries for elements from the submodel template (optional or required ones).
 * Address information additionally offers the values of a contact information.
 * A loading error is shown as a menu entry instead of pretending that nothing is available.
 */
export async function buildTemplateElementItems(
  node: TreeNode<V3TreeItem<unknown>> | undefined,
  options: TemplateElementItemsOptions,
): Promise<MenuItem[]> {
  const { translate, required } = options;
  if (node == null) {
    return [{ label: translate('NOTHING_AVAILABLE') }];
  }

  try {
    const path = createTemplatePath(node, '');
    const submodelId = getSubmodelIdShort(node);
    const semanticId = getSubmodelSemanticId(node);
    const el = await options.loadElements(path, submodelId, semanticId, node.data?.content);

    const content = node.data?.content;
    if (
      content instanceof aas.types.SubmodelElementCollection &&
      content.semanticId?.keys?.find((k) => k.value === ADDRESS_INFORMATION_SEMANTIC_ID)
    ) {
      // add elements for contact information
      const smRes = await options.loadContactInformationSubmodel();

      smRes.v3Submodels?.[0]?.submodelElements?.forEach((smColl) => {
        if (
          smColl instanceof aas.types.SubmodelElementCollection &&
          SemanticIdHelper.hasSemanticId(smColl, CONTACT_INFORMATION_SEMANTIC_ID)
        ) {
          smColl.value?.forEach((smEl) => {
            const isRequired = REQUIRED_CONTACT_INFORMATION_SEMANTIC_IDS.some((id) =>
              SemanticIdHelper.hasSemanticId(smEl, id),
            );
            const exists = content.value?.find((v) => v.idShort === smEl.idShort);
            if (isRequired === required && !exists) {
              el.push({
                label: smEl.idShort,
                data: smEl,
                type: InstanceHelper.getInstanceName(smEl),
              } as MenuItem);
            }
          });
        }
      });
    }

    el.forEach((e) => (e.command = () => options.onSelect(e['data'], e['type'])));

    if (el.length === 0) {
      el.push({ label: translate('NOTHING_AVAILABLE') });
    }

    return el;
  } catch (error) {
    // No template for this submodel is a normal case, not an error.
    if (error instanceof ApiException && error.title === 'SERVER_REQUEST_NOT_FOUND') {
      return [{ label: translate('NOTHING_AVAILABLE') }];
    }
    console.warn('Elements of the submodel template could not be loaded', error);
    return [
      {
        label: translate('ERROR_LOADING_TEMPLATE_ELEMENTS'),
        icon: 'pi pi-exclamation-triangle',
        disabled: true,
      },
    ];
  }
}
