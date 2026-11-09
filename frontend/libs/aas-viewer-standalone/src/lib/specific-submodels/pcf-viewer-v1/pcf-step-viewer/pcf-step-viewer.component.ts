import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { DateProxyPipe } from '@aas/common-pipes';
import { SubmodelElementCollection } from '@aas/model';
import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConceptUnitService, semanticIdOf, viewerFieldOf } from '../../../concept-unit.service';
import { SemanticDescriptionPopupComponent } from '../../../semantic-description-popup/semantic-description-popup.component';

@Component({
  selector: 'aas-pcf-step-viewer',
  templateUrl: './pcf-step-viewer.component.html',
  styleUrls: ['./pcf-step-viewer.component.css'],
  changeDetection: ChangeDetectionStrategy.Eager,
  imports: [TranslateModule, DateProxyPipe, SemanticDescriptionPopupComponent],
})
export class PcfStepViewerComponent {
  step = input.required<aas.types.SubmodelElementCollection>();

  private readonly units = inject(ConceptUnitService);
  private readonly translate = inject(TranslateService);

  // Semantic IDs for the PCF properties
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

  // Computed signal for the individual lifecycle phase values
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

  co2Value = computed(() => elementText(this.pcfCO2eq()));

  referenceUnit = computed(() => elementText(this.referenceImpactUnitForCalculation()));

  /** Names of the calculation methods (a list of properties, older models: a single property). */
  calculationMethods = computed(() => {
    const methods = this.pcfCalculationMethods() as aas.types.ISubmodelElement | null | undefined;
    const entries =
      methods instanceof aas.types.SubmodelElementList || methods instanceof aas.types.SubmodelElementCollection
        ? (methods.value ?? [])
        : methods != null
          ? [methods]
          : [];
    return entries
      .map((entry) => elementText(entry))
      .filter((text) => text !== '')
      .join(', ');
  });

  explanation = computed(() => elementText(this.explanatoryStatement(), this.translate.currentLang));

  /** Unit of the CO2 equivalent: element, then concept description, then the unit given by the specification. */
  co2Unit = computed(() => {
    return this.units.fieldUnit(viewerFieldOf(this.pcfCO2eq()), 'kg CO₂-eq');
  });

  /** Semantic ID of a displayed element, for the concept description help. */
  readonly semanticIdOf = semanticIdOf;
}

/** Readable value of a property, multi-language property or file (file name only). */
function elementText(element: aas.types.ISubmodelElement | null | undefined, language = 'en'): string {
  if (element instanceof aas.types.Property) return (element.value ?? '').trim();
  if (element instanceof aas.types.MultiLanguageProperty) {
    const texts = element.value ?? [];
    return (
      (
        texts.find((text) => text.language.startsWith(language || 'en')) ??
        texts.find((text) => text.language.startsWith('en')) ??
        texts[0]
      )?.text.trim() ?? ''
    );
  }
  if (element instanceof aas.types.File) return (element.value ?? '').split('/').pop()?.trim() ?? '';
  return '';
}
