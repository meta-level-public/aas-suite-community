import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { PcfHelper } from '../pcf-helper';
import { TcfAddressComponent } from '../tcf-address/tcf-address.component';

@Component({
  selector: 'aas-tcf-element',
  templateUrl: './tcf-element.component.html',
  imports: [TableModule, PrimeTemplate, TcfAddressComponent, TranslateModule],
})
export class TcfElementComponent {
  @Input({ required: true }) tcf: SubmodelElementCollection | undefined;

  get calculationMethod() {
    return PcfHelper.getTcfCalculationMethod(this.tcf);
  }

  get tcfCo2Eq() {
    return PcfHelper.getTcfCo2Eq(this.tcf);
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
}
