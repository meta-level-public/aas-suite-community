import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConceptUnitService } from '../../../concept-unit.service';
import { SemanticDescriptionPopupComponent } from '../../../semantic-description-popup/semantic-description-popup.component';
import { ViewerUnitComponent } from '../../../viewer-unit/viewer-unit.component';
import { PcfAddressComponent } from '../pcf-address/pcf-address.component';
import { PcfHelper } from '../pcf-helper';

@Component({
  selector: 'aas-pcf-element',
  templateUrl: './pcf-element.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [PcfAddressComponent, TranslateModule, SemanticDescriptionPopupComponent, ViewerUnitComponent],
})
export class PcfElementComponent {
  pcf = input.required<SubmodelElementCollection | undefined>();

  private readonly units = inject(ConceptUnitService);

  /** Semantic IDs and units of the displayed elements. */
  fields = computed(() => {
    const pcf = this.pcf();
    return {
      calculationMethod: PcfHelper.field(pcf, PcfHelper.PCF_CALCULATION_METHOD),
      co2Eq: PcfHelper.field(pcf, PcfHelper.PCF_CO2_EQ),
      referenceValueForCalculation: PcfHelper.field(pcf, PcfHelper.PCF_REFERENCE_VALUE_FOR_CALCULATION),
      quantityOfMeasureForCalculation: PcfHelper.field(pcf, PcfHelper.PCF_QUANTITY_OF_MEASURE_FOR_CALCULATION),
      lifecyclePhase: PcfHelper.field(pcf, PcfHelper.PCF_LIFECYCLE_PHASE),
      emissionFactor: PcfHelper.field(pcf, PcfHelper.PCF_EMISSION_FACTOR),
      energyUsageCumulated: PcfHelper.field(pcf, PcfHelper.PCF_ENERGY_USAGE_CUMULATED),
    };
  });

  calculationMethod = computed(() => PcfHelper.getPcfCalculationMethod(this.pcf()));
  pcfCo2Eq = computed(() => PcfHelper.getPcfCo2Eq(this.pcf()));
  pcfReferenceValueForCalculation = computed(() => PcfHelper.getPcfReferenceValueForCalculation(this.pcf()));
  pcfQuantityOfMeasureForCalculation = computed(() => PcfHelper.getPcfQuantityOfMeasureForCalculation(this.pcf()));
  pcfLifecyclePhase = computed(() => PcfHelper.getPcfLifecyclePhase(this.pcf()));
  pcfAddress = computed(() => PcfHelper.getPcfAddress(this.pcf()));
  pcfEnergyUsageCumulated = computed(() => PcfHelper.getPcfEnergyUsageCumulated(this.pcf()));
  pcfEmissionFactor = computed(() => PcfHelper.getPcfEmissionFactor(this.pcf()));

  // The FL40 elements are rarely described by a concept description, so their usual unit is shown as fallback
  pcfEnergyUsageCumulatedUnit = computed(() => this.units.fieldUnit(this.fields().energyUsageCumulated, 'kWh'));

  pcfEmissionFactorUnit = computed(() => this.units.fieldUnit(this.fields().emissionFactor, 'g/kWh'));
}
