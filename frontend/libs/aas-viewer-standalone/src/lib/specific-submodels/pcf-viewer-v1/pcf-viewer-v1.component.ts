import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { SemanticIdHelper } from '@aas/helpers';
import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AddressMapComponent } from './address-map/address-map.component';
import { PcfStepViewerComponent } from './pcf-step-viewer/pcf-step-viewer.component';

@Component({
  selector: 'aas-pcf-viewer-v1',
  imports: [PcfStepViewerComponent, AddressMapComponent, TranslateModule],
  templateUrl: './pcf-viewer-v1.component.html',
  styleUrls: ['./pcf-viewer-v1.component.css'],
})
export class PcfViewerV1Component {
  pcfModel = input<aas.types.Submodel | undefined>();

  readonly PRODUCT_CARBON_FOOTPRINTS_SEMANTIC_ID =
    'https://admin-shell.io/idta/CarbonFootprint/ProductCarbonFootprints/1/0';
  readonly PRODUCT_OR_SECTOR_SPECIFIC_CARBON_FOOTPRINTS_SEMANTIC_ID =
    'https://admin-shell.io/idta/CarbonFootprint/ProductOrSectorSpecificCarbonFootprints/1/0';

  steps = computed(() => {
    const submodel = this.pcfModel();
    if (!submodel || !submodel.submodelElements) return [];

    const collection = submodel.submodelElements.find(
      (element) =>
        SemanticIdHelper.hasSemanticId(element, this.PRODUCT_CARBON_FOOTPRINTS_SEMANTIC_ID) ||
        SemanticIdHelper.hasSemanticId(element, this.PRODUCT_OR_SECTOR_SPECIFIC_CARBON_FOOTPRINTS_SEMANTIC_ID) ||
        element.idShort === 'ProductCarbonFootprints' ||
        element.idShort === 'ProductOrSectorSpecificCarbonFootprints',
    );

    if (collection instanceof aas.types.SubmodelElementList) {
      return (collection.value ?? []) as aas.types.SubmodelElementCollection[];
    }
    return [];
  });
}
