import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { SemanticIdHelper } from '@aas/helpers';
import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ProductOrSectorSpecificPcfStepViewerComponent } from '../product-or-sector-specific-pcf-step-viewer/product-or-sector-specific-pcf-step-viewer.component';

@Component({
  selector: 'aas-product-or-sector-specific-pcf-viewer',
  imports: [ProductOrSectorSpecificPcfStepViewerComponent, TranslateModule],
  templateUrl: './product-or-sector-specific-pcf-viewer.component.html',
  styleUrl: './product-or-sector-specific-pcf-viewer.component.css',
})
export class ProductOrSectorSpecificPcfViewerComponent {
  pcfModel = input<aas.types.Submodel | undefined>();

  readonly PRODUCT_OR_SECTOR_SPECIFIC_CARBON_FOOTPRINTS_SEMANTIC_ID =
    'https://admin-shell.io/idta/CarbonFootprint/ProductOrSectorSpecificCarbonFootprints/1/0';

  steps = computed(() => {
    const submodel = this.pcfModel();
    if (!submodel?.submodelElements) {
      return [];
    }

    const collection = submodel.submodelElements.find(
      (element) =>
        SemanticIdHelper.hasSemanticId(element, this.PRODUCT_OR_SECTOR_SPECIFIC_CARBON_FOOTPRINTS_SEMANTIC_ID) ||
        element.idShort === 'ProductOrSectorSpecificCarbonFootprints',
    );

    if (collection instanceof aas.types.SubmodelElementList) {
      return (collection.value ?? []) as aas.types.SubmodelElementCollection[];
    }

    return [];
  });
}
