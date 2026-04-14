import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { DateProxyPipe } from '@aas/common-pipes';
import { SubmodelElementCollection } from '@aas/model';
import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AddressMapComponent } from '../address-map/address-map.component';

@Component({
  selector: 'aas-pcf-step-viewer',
  templateUrl: './pcf-step-viewer.component.html',
  styleUrls: ['./pcf-step-viewer.component.css'],
  imports: [TranslateModule, DateProxyPipe, AddressMapComponent],
})
export class PcfStepViewerComponent {
  step = input.required<aas.types.SubmodelElementCollection>();

  // Semantic IDs für die PCF-Eigenschaften
  private readonly PCF_CALCULATION_METHODS_ID = 'https://admin-shell.io/idta/CarbonFootprint/PcfCalculationMethods/1/0';
  private readonly PCF_CO2_EQ_ID = '0173-1#02-ABG855#003';
  private readonly REFERENCE_IMPACT_UNIT_ID = '0173-1#02-ABG856#003';
  private readonly LIFE_CYCLE_PHASES_ID = 'https://admin-shell.io/idta/CarbonFootprint/LifeCyclePhases/1/0';
  private readonly EXPLANATORY_STATEMENT_ID = 'https://admin-shell.io/idta/CarbonFootprint/ExplanatoryStatement/1/0';
  private readonly PUBLICATION_DATE_ID = 'https://admin-shell.io/idta/CarbonFootprint/PublicationDate/1/0';

  // Helper method to find element by semantic ID
  private findElementBySemanticId(semanticId: string) {
    const stepValue = this.step();
    if (!stepValue?.value || !Array.isArray(stepValue.value)) return null;

    return stepValue.value.find((element) => element.semanticId?.keys?.some((key) => key.value === semanticId));
  }

  // Computed signals for PCF properties
  pcfCalculationMethods = computed(() => {
    return this.findElementBySemanticId(this.PCF_CALCULATION_METHODS_ID) as aas.types.Property | null;
  });

  pcfCO2eq = computed(() => {
    return this.findElementBySemanticId(this.PCF_CO2_EQ_ID) as aas.types.Property | null;
  });

  referenceImpactUnitForCalculation = computed(() => {
    return this.findElementBySemanticId(this.REFERENCE_IMPACT_UNIT_ID) as aas.types.Property | null;
  });

  lifeCyclePhases = computed(() => {
    return this.findElementBySemanticId(this.LIFE_CYCLE_PHASES_ID) as SubmodelElementCollection | null;
  });

  stepList = computed(() => [this.step()]);

  // Computed signal für die einzelnen Lifecycle-Phasen-Werte
  lifeCyclePhasesValues = computed(() => {
    const lifeCycleElement = this.lifeCyclePhases();
    if (!lifeCycleElement?.value) {
      return [];
    }

    // Extrahiere die Werte aus der SubmodelElementList
    return lifeCycleElement.value.map((phase: any) => ({
      idShort: phase.idShort || 'Unknown Phase',
      value: phase.value || 'N/A',
      displayName: phase.displayName?.[0]?.text || phase.idShort || 'Unknown Phase',
    }));
  });

  explanatoryStatement = computed(() => {
    return this.findElementBySemanticId(this.EXPLANATORY_STATEMENT_ID) as aas.types.Property | null;
  });

  publicationDate = computed(() => {
    return this.findElementBySemanticId(this.PUBLICATION_DATE_ID) as aas.types.Property | null;
  });

  publicationDateFormatted = computed(() => {
    const dateValue = this.publicationDate()?.value;
    if (!dateValue) return null;
    return new Date(dateValue);
  });

  co2Unit = computed(() => {
    const pcfCo2eq = this.pcfCO2eq();
    if (pcfCo2eq?.embeddedDataSpecifications) {
      for (const dataSpec of pcfCo2eq.embeddedDataSpecifications) {
        if (dataSpec.dataSpecificationContent && 'unit' in dataSpec.dataSpecificationContent) {
          return (dataSpec.dataSpecificationContent as any).unit;
        }
      }
    }
    return 'kg CO₂-eq';
  });
}
