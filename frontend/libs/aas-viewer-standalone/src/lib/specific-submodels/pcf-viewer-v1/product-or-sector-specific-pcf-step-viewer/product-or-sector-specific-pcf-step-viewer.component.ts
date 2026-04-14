import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { Component, computed, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'aas-product-or-sector-specific-pcf-step-viewer',
  templateUrl: './product-or-sector-specific-pcf-step-viewer.component.html',
  styleUrl: './product-or-sector-specific-pcf-step-viewer.component.css',
  imports: [TranslateModule],
})
export class ProductOrSectorSpecificPcfStepViewerComponent {
  step = input.required<aas.types.SubmodelElementCollection>();

  calculationMethods = computed(() => this.readStringList(this.step(), 'PcfCalculationMethods'));
  ruleOperator = computed(() =>
    this.readNestedStringValue(this.step(), ['ProductOrSectorSpecificRule', 'PcfRuleOperator']),
  );
  ruleName = computed(() => this.readNestedStringValue(this.step(), ['ProductOrSectorSpecificRule', 'PcfRuleName']));
  ruleVersion = computed(() =>
    this.readNestedStringValue(this.step(), ['ProductOrSectorSpecificRule', 'PcfRuleVersion']),
  );
  ruleOnlineReference = computed(() =>
    this.readNestedStringValue(this.step(), ['ProductOrSectorSpecificRule', 'PcfRuleOnlineReference']),
  );
  apiEndpoint = computed(() => this.readNestedStringValue(this.step(), ['ExternalPcfApi', 'PcfApiEndpoint']));
  apiQuery = computed(() => this.readNestedStringValue(this.step(), ['ExternalPcfApi', 'PcfApiQuery']));
  arbitraryContent = computed(() => this.readNestedStringValue(this.step(), ['PcfInformation', 'ArbitraryContent']));

  private findChildByIdShort(
    parent: aas.types.SubmodelElementCollection,
    idShort: string,
  ): aas.types.ISubmodelElement | undefined {
    return (parent.value ?? []).find((child) => child.idShort === idShort);
  }

  private readStringList(parent: aas.types.SubmodelElementCollection, idShort: string): string[] {
    const list = this.findChildByIdShort(parent, idShort);
    if (!(list instanceof aas.types.SubmodelElementList)) {
      return [];
    }

    return (list.value ?? [])
      .filter((element): element is aas.types.Property => element instanceof aas.types.Property)
      .map((element) => `${element.value ?? ''}`.trim())
      .filter((value) => value !== '');
  }

  private readNestedStringValue(parent: aas.types.SubmodelElementCollection, path: string[]): string {
    let current: aas.types.ISubmodelElement | undefined = parent;

    for (const segment of path) {
      if (!(current instanceof aas.types.SubmodelElementCollection)) {
        return '';
      }

      current = this.findChildByIdShort(current, segment);
      if (current == null) {
        return '';
      }
    }

    if (current instanceof aas.types.Property) {
      return `${current.value ?? ''}`.trim();
    }

    return '';
  }
}
