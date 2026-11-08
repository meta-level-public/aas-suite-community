import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { ApiException } from '@aas/jwt-auth';
import { TreeNode } from '@openng/optimus-ui/api';
import { vi } from 'vitest';
import { SubmodelResult } from '../../generator/model/submodel-result';
import { EditorTypeOption } from '../model/editor-type-option';
import { V3TreeItem } from '../model/v3-tree-item';
import { buildTemplateElementItems, TemplateElementItemsOptions } from './v3-template-element-items';

const ADDRESS_INFORMATION = 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation';
const CONTACT_INFORMATION = 'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/ContactInformation';

function withSemanticId<T extends aas.types.IHasSemantics>(element: T, semanticId: string): T {
  element.semanticId = new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, semanticId),
  ]);
  return element;
}

function submodelNode(): TreeNode<V3TreeItem<unknown>> {
  const submodel = new aas.types.Submodel('urn:sm');
  submodel.idShort = 'Nameplate';
  const data = new V3TreeItem<unknown>();
  data.content = submodel;
  data.editorType = EditorTypeOption.Submodel;
  const root: TreeNode<V3TreeItem<unknown>> = { data: new V3TreeItem<unknown>() };
  return { data, parent: root };
}

function options(overrides: Partial<TemplateElementItemsOptions> = {}): TemplateElementItemsOptions {
  return {
    translate: (key) => key,
    loadElements: vi.fn().mockResolvedValue([]),
    loadContactInformationSubmodel: vi.fn(),
    required: false,
    onSelect: vi.fn(),
    ...overrides,
  };
}

describe('buildTemplateElementItems', () => {
  it('loads the elements for the template path and inserts the selected one', async () => {
    const element = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    const loadElements = vi.fn().mockResolvedValue([{ label: 'Serial', data: element, type: 'Property' }]);
    const onSelect = vi.fn();

    const items = await buildTemplateElementItems(submodelNode(), options({ loadElements, onSelect }));
    items[0].command?.({});

    expect(loadElements).toHaveBeenCalledWith('$', 'Nameplate', '', expect.any(aas.types.Submodel));
    expect(onSelect).toHaveBeenCalledWith(element, 'Property');
  });

  it('shows "nothing available" without node, without elements or without template', async () => {
    expect(await buildTemplateElementItems(undefined, options())).toEqual([{ label: 'NOTHING_AVAILABLE' }]);
    expect(await buildTemplateElementItems(submodelNode(), options())).toEqual([{ label: 'NOTHING_AVAILABLE' }]);

    const notFound = new ApiException('not found', 'SERVER_REQUEST_NOT_FOUND');
    expect(
      await buildTemplateElementItems(submodelNode(), options({ loadElements: vi.fn().mockRejectedValue(notFound) })),
    ).toEqual([{ label: 'NOTHING_AVAILABLE' }]);
  });

  it('shows a disabled error entry when the template cannot be loaded', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const items = await buildTemplateElementItems(
      submodelNode(),
      options({ loadElements: vi.fn().mockRejectedValue(new Error('offline')) }),
    );

    expect(items).toEqual([
      { label: 'ERROR_LOADING_TEMPLATE_ELEMENTS', icon: 'pi pi-exclamation-triangle', disabled: true },
    ]);
  });

  it('offers the missing required contact information values of an address information', async () => {
    const street = withSemanticId(new aas.types.MultiLanguageProperty(), '0173-1#02-AAO128#002');
    street.idShort = 'Street';
    const zip = withSemanticId(new aas.types.MultiLanguageProperty(), '0173-1#02-AAO129#002');
    zip.idShort = 'Zipcode';
    const fax = new aas.types.Property(aas.types.DataTypeDefXsd.String);
    fax.idShort = 'Fax';
    const contactInformation = withSemanticId(new aas.types.SubmodelElementCollection(), CONTACT_INFORMATION);
    contactInformation.value = [street, zip, fax];
    const contactSubmodel = new aas.types.Submodel('urn:contact');
    contactSubmodel.submodelElements = [contactInformation];
    const smResult = Object.assign(new SubmodelResult(), { v3Submodels: [contactSubmodel] });

    const existingStreet = new aas.types.MultiLanguageProperty();
    existingStreet.idShort = 'Street';
    const address = withSemanticId(new aas.types.SubmodelElementCollection(), ADDRESS_INFORMATION);
    address.value = [existingStreet];
    const node = submodelNode();
    node.data!.content = address;
    node.data!.editorType = EditorTypeOption.SubmodelElementCollection;

    const items = await buildTemplateElementItems(
      node,
      options({ required: true, loadContactInformationSubmodel: vi.fn().mockResolvedValue(smResult) }),
    );

    expect(items.map((item) => item.label)).toEqual(['Zipcode']);
    expect(items[0]['type']).toBe('MultiLanguageProperty');
  });
});
