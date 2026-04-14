import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SubmodelElementCollection } from '@aas-core-works/aas-core3.1-typescript/types';
import { AsyncPipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { PrimeTemplate } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ConceptDescriptionService } from '../../../concept-description.service';
import { ViewerStoreService } from '../../../viewer-store.service';
import { PcfAddressComponent } from '../pcf-address/pcf-address.component';
import { PcfHelper } from '../pcf-helper';

@Component({
  selector: 'aas-pcf-element',
  templateUrl: './pcf-element.component.html',
  imports: [TableModule, PrimeTemplate, PcfAddressComponent, AsyncPipe, TranslateModule],
})
export class PcfElementComponent {
  pcf = input.required<SubmodelElementCollection | undefined>();
  viewerStore = inject(ViewerStoreService);

  cdService = inject(ConceptDescriptionService);

  calculationMethod = computed(() => {
    const pcf = this.pcf();
    return PcfHelper.getPcfCalculationMethod(pcf);
  });

  pcfCo2Eq = computed(() => {
    const pcf = this.pcf();
    return PcfHelper.getPcfCo2Eq(pcf);
  });
  pcfCo2EqUnit = computed(async () => {
    const pcf = this.pcf();
    const co2eqEl = PcfHelper.getPcfCo2EqElement(pcf);
    if (co2eqEl != null) {
      const unit = await this.getUnit(co2eqEl);
      return unit !== '' && unit != null ? unit : 'g';
    } else return Promise.resolve('g');
  });

  pcfReferenceValueForCalculation = computed(() => {
    const pcf = this.pcf();
    return PcfHelper.getPcfReferenceValueForCalculation(pcf);
  });

  pcfQuantityOfMeasureForCalculation = computed(() => {
    const pcf = this.pcf();
    return PcfHelper.getPcfQuantityOfMeasureForCalculation(pcf);
  });

  pcfLifecyclePhase = computed(() => {
    const pcf = this.pcf();
    return PcfHelper.getPcfLifecyclePhase(pcf);
  });

  pcfAddress = computed(() => {
    const pcf = this.pcf();
    return PcfHelper.getPcfAddress(pcf);
  });

  pcfEnergyUsageCumulated = computed(() => {
    const pcf = this.pcf();
    return PcfHelper.getPcfEnergyUsageCumulated(pcf);
  });

  pcfEnergyUsageCumulatedUnit = computed(async () => {
    const pcf = this.pcf();
    const energyUsageEl = PcfHelper.getPcfEnergyUsageCumulatedElement(pcf);
    if (energyUsageEl != null) {
      const unit = await this.getUnit(energyUsageEl);
      return unit !== '' && unit != null ? unit : 'kWh';
    } else return Promise.resolve('kWh');
  });

  pcfEmissionFactor = computed(() => {
    const pcf = this.pcf();
    return PcfHelper.getPcfEmissionFactor(pcf);
  });

  pcfEmissionFactorUnit = computed(async () => {
    const pcf = this.pcf();
    const emissionFactorEl = PcfHelper.getPcfEmissionFactorElement(pcf);
    if (emissionFactorEl != null) {
      const unit = await this.getUnit(emissionFactorEl);
      return unit !== '' && unit != null ? unit : 'g/kWh';
    } else return Promise.resolve('g/kWh');
  });

  async getUnit(property: aas.types.Property) {
    const foundEds = property?.embeddedDataSpecifications?.find(
      (eds) => (eds.dataSpecificationContent as any).unit != null,
    );
    if (foundEds) {
      return (foundEds?.dataSpecificationContent as any)?.unit ?? '';
    }

    if (property?.semanticId?.keys[0]?.value) {
      const semanticId = property.semanticId.keys[0].value;
      const conceptDescription = await this.cdService.loadCD(
        semanticId,
        this.viewerStore.cdUrl(),
        this.viewerStore.apiKey() ?? '',
      );

      if (conceptDescription == null) return '';

      const foundContent = conceptDescription?.embeddedDataSpecifications?.[0]?.dataSpecificationContent;
      if (foundContent != null && foundContent instanceof aas.types.DataSpecificationIec61360) {
        return foundContent.unit ?? '';
      }
    }
  }
}
