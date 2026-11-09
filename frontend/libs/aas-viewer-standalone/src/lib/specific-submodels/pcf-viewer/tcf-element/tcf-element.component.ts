import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConceptUnitService } from '../../../concept-unit.service';
import { SemanticDescriptionPopupComponent } from '../../../semantic-description-popup/semantic-description-popup.component';
import { PcfHelper } from '../pcf-helper';
import { TcfAddressComponent } from '../tcf-address/tcf-address.component';

@Component({
  selector: 'aas-tcf-element',
  templateUrl: './tcf-element.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TcfAddressComponent, TranslateModule, SemanticDescriptionPopupComponent],
})
export class TcfElementComponent {
  @Input({ required: true }) tcf: SubmodelElementCollection | undefined;

  private readonly units = inject(ConceptUnitService);

  get calculationMethod() {
    return PcfHelper.getTcfCalculationMethod(this.tcf);
  }

  get tcfCo2Eq() {
    return PcfHelper.getTcfCo2Eq(this.tcf);
  }

  /** The TCF CO2 equivalent is given in kg if neither element nor concept description name a unit. */
  get tcfCo2EqUnit() {
    return this.units.fieldUnit(this.fields.co2Eq, 'kg');
  }

  get tcfReferenceValueForCalculation() {
    return PcfHelper.getTcfReferenceValueForCalculation(this.tcf);
  }

  get tcfQuantityOfMeasureForCalculation() {
    return PcfHelper.getTcfQuantityOfMeasureForCalculation(this.tcf);
  }

  get tcfProcessesForGreenhouseGasEmissionInATransportService() {
    return PcfHelper.getTcfProcessesForGreenhouseGasEmissionInATransportService(this.tcf);
  }

  get tcfHandoverAddress() {
    return PcfHelper.getTcfHandoverAddress(this.tcf);
  }
  get tcfTakeoverAddress() {
    return PcfHelper.getTcfTakeoverAddress(this.tcf);
  }

  /** Semantic IDs and units of the displayed elements. */
  get fields() {
    const tcf = this.tcf;
    return {
      calculationMethod: PcfHelper.field(tcf, PcfHelper.TCF_CALCULATION_METHOD),
      co2Eq: PcfHelper.field(tcf, ...PcfHelper.TCF_CO2_EQ),
      referenceValueForCalculation: PcfHelper.field(tcf, PcfHelper.TCF_REFERENCE_VALUE_FOR_CALCULATION),
      quantityOfMeasureForCalculation: PcfHelper.field(tcf, PcfHelper.TCF_QUANTITY_OF_MEASURE_FOR_CALCULATION),
      processesForGreenhouseGasEmission: PcfHelper.field(tcf, PcfHelper.TCF_PROCESSES_FOR_GREENHOUSE_GAS_EMISSION),
    };
  }
}
