import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from '@aas/helpers';

export enum AddonType {
  ADDON_HANDOVERDOCUMENTATION_DOCUMENT = 'ADDON_HANDOVERDOCUMENTATION_DOCUMENT',
  ADDON_CAPABILITY = 'ADDON_CAPABILITY',
  CONTACT_INFORMATION = 'CONTACT_INFORMATION',
}

export class AddonResolver {
  static getAddons(el: aas.types.IHasSemantics) {
    const addonNames: AddonType[] = [];

    if (
      SemanticIdHelper.hasSemanticId(el, '0173-1#01-AHF578#001') ||
      SemanticIdHelper.hasSemanticId(el, '0173-1#01-AHF578#003')
    ) {
      addonNames.push(AddonType.ADDON_HANDOVERDOCUMENTATION_DOCUMENT);
    }

    if (
      SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/CapabilityDescription/CapabilitySet/1/0') ||
      SemanticIdHelper.hasSemanticId(el, 'https://admin-shell.io/idta/SubmodelTemplate/CapabilityDescription/1/0')
    ) {
      addonNames.push(AddonType.ADDON_CAPABILITY);
    }

    if (
      SemanticIdHelper.hasSemanticId(
        el,
        'https://admin-shell.io/zvei/nameplate/1/0/ContactInformations/AddressInformation',
      )
    ) {
      addonNames.push(AddonType.CONTACT_INFORMATION);
    }

    return addonNames;
  }
}
