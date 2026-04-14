import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { SemanticIdHelper } from '@aas/helpers';
import { Component, Input, OnChanges, computed, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddon } from 'primeng/inputgroupaddon';
import { InputText } from 'primeng/inputtext';
import { GenericViewerComponent } from '../../generic-viewer/generic-viewer.component';

const SEMANTICS = {
  remainingCapacity: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingCapacity',
  remainingCapacityValue: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingCapacityValue',
  remainingEnergy: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingEnergy',
  remainingEnergyValue: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingEnergyValue',
  remainingRoundTripEnergyEfficiency:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingRoundTripEnergyEfficiency',
  remainingRoundTripEnergyEfficiencyValue:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingRoundTripEnergyEfficiencyValue',
  stateOfCertifiedEnergy: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#stateOfCertifiedEnergy',
  stateOfCertifiedEnergyValue:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#stateOfCertifiedEnergyValue',
  stateOfCharge: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#stateOfCharge',
  stateOfChargeValue: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#stateOfChargeValue',
  numberOfFullCycles: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#numberOfFullCycles',
  numberOfFullCyclesValue: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#numberOfFullCyclesValue',
  capacityThroughput: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#capacityThroughput',
  capacityThroughputValue: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#capacityThroughputValue',
  energyThroughput: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#energyThroughput',
  energyThroughputValue: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#energyThroughputValue',
  currentSelfDischargingRate:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#currentSelfDischargingRate',
  currentSelfDischargingRateValue:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#currentSelfDischargingRateValue',
  evolutionOfSelfDischarge: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#evolutionOfSelfDischarge',
  evolutionOfSelfDischargeValue:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#evolutionOfSelfDischargeValue',
  remainingPowerCapability: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingPowerCapability',
  remainingPowerCapabilityDynamicAt:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingPowerCapabilityDynamicAt',
  rpcLastUpdated: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#rPCLastUpdated',
  atSoC: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#atSoC',
  powerCapabilityAt: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#powerCapabilityAt',
  temperatureInformation: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#temperatureInformation',
  timeExtremeHighTemp: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#timeExtremeHighTemp',
  timeExtremeLowTemp: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#timeExtremeLowTemp',
  timeExtremeHighTempCharging:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#timeExtremeHighTempCharging',
  timeExtremeLowTempCharging:
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#timeExtremeLowTempCharging',
  informationOnAccidents: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#informationOnAccidents',
  documentIdentifier: 'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
  negativeEvents: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#negativeEvents',
  negativeEvent: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#NegativeEvent',
  negativeEventValue: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#negativeEventValue',
  lastUpdate: 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
} as const;

interface ProductConditionMetric {
  label: string;
  value: string;
  lastUpdate: string;
  idShortPath: string;
}

interface ProductConditionPowerCapabilityEntry {
  label: string;
  atSoC: string;
  powerCapabilityAt: string;
  rpcLastUpdated: string;
  idShortPath: string;
}

interface ProductConditionNegativeEvent {
  value: string;
  lastUpdate: string;
  idShortPath: string;
}

interface ProductConditionViewModel {
  healthMetrics: ProductConditionMetric[];
  throughputMetrics: ProductConditionMetric[];
  selfDischargeMetrics: ProductConditionMetric[];
  powerCapabilityEntries: ProductConditionPowerCapabilityEntry[];
  powerCapabilityLastUpdate: string;
  temperatureMetrics: ProductConditionMetric[];
  temperatureLastUpdate: string;
  accidentDocumentIdentifiers: string[];
  negativeEvents: ProductConditionNegativeEvent[];
  additionalDetails: aas.types.ISubmodelElement[];
}

const EMPTY_VIEW_MODEL: ProductConditionViewModel = {
  healthMetrics: [],
  throughputMetrics: [],
  selfDischargeMetrics: [],
  powerCapabilityEntries: [],
  powerCapabilityLastUpdate: '',
  temperatureMetrics: [],
  temperatureLastUpdate: '',
  accidentDocumentIdentifiers: [],
  negativeEvents: [],
  additionalDetails: [],
};

@Component({
  selector: 'aas-product-condition-viewer',
  templateUrl: './product-condition-viewer.component.html',
  styleUrls: ['./product-condition-viewer.component.css'],
  imports: [TranslateModule, InputGroup, InputGroupAddon, InputText, GenericViewerComponent],
})
export class ProductConditionViewerComponent implements OnChanges {
  @Input({ required: true }) submodel: aas.types.Submodel | undefined;
  @Input() currentLanguage = 'de';

  private readonly model = signal<ProductConditionViewModel>(EMPTY_VIEW_MODEL);

  readonly healthMetrics = computed(() => this.model().healthMetrics);
  readonly throughputMetrics = computed(() => this.model().throughputMetrics);
  readonly selfDischargeMetrics = computed(() => this.model().selfDischargeMetrics);
  readonly powerCapabilityEntries = computed(() => this.model().powerCapabilityEntries);
  readonly powerCapabilityLastUpdate = computed(() => this.model().powerCapabilityLastUpdate);
  readonly temperatureMetrics = computed(() => this.model().temperatureMetrics);
  readonly temperatureLastUpdate = computed(() => this.model().temperatureLastUpdate);
  readonly accidentDocumentIdentifiers = computed(() => this.model().accidentDocumentIdentifiers);
  readonly negativeEvents = computed(() => this.model().negativeEvents);
  readonly additionalDetails = computed(() => this.model().additionalDetails);
  readonly hasContent = computed(() => {
    const current = this.model();
    return (
      current.healthMetrics.length > 0 ||
      current.throughputMetrics.length > 0 ||
      current.selfDischargeMetrics.length > 0 ||
      current.powerCapabilityEntries.length > 0 ||
      current.powerCapabilityLastUpdate.trim() !== '' ||
      current.temperatureMetrics.length > 0 ||
      current.temperatureLastUpdate.trim() !== '' ||
      current.accidentDocumentIdentifiers.length > 0 ||
      current.negativeEvents.length > 0 ||
      current.additionalDetails.length > 0
    );
  });

  ngOnChanges(): void {
    this.model.set(this.buildViewModel());
  }

  private buildViewModel(): ProductConditionViewModel {
    const root = this.submodel?.submodelElements ?? [];
    const handledRootElements = new Set<aas.types.ISubmodelElement>();

    const remainingCapacity = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.remainingCapacity],
      ['RemainingCapacity'],
    );
    const remainingEnergy = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.remainingEnergy],
      ['RemainingEnergy'],
    );
    const remainingRoundTripEnergyEfficiency = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.remainingRoundTripEnergyEfficiency],
      ['RemainingRoundTripEnergyEfficiency'],
    );
    const stateOfCertifiedEnergy = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.stateOfCertifiedEnergy],
      ['StateOfCertifiedEnergy'],
    );
    const stateOfCharge = this.findRootElement(root, handledRootElements, [SEMANTICS.stateOfCharge], ['StateOfCharge']);
    const numberOfFullCycles = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.numberOfFullCycles],
      ['NumberOfFullCycles'],
    );
    const capacityThroughput = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.capacityThroughput],
      ['CapacityThroughput'],
    );
    const energyThroughput = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.energyThroughput],
      ['EnergyThroughput'],
    );
    const currentSelfDischargingRate = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.currentSelfDischargingRate],
      ['CurrentSelfDischargingRate'],
    );
    const evolutionOfSelfDischarge = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.evolutionOfSelfDischarge],
      ['EvolutionOfSelfDischarge'],
    );
    const remainingPowerCapability = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.remainingPowerCapability],
      ['RemainingPowerCapability'],
    );
    const temperatureInformation = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.temperatureInformation],
      ['TemperatureInformation'],
    );
    const informationOnAccidents = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.informationOnAccidents],
      ['InformationOnAccidents'],
    );
    const negativeEvents = this.findRootElement(
      root,
      handledRootElements,
      [SEMANTICS.negativeEvents],
      ['NegativeEvents'],
    );

    return {
      healthMetrics: [
        this.extractMetricFromCollection(
          remainingCapacity,
          [SEMANTICS.remainingCapacityValue],
          ['RemainingCapacityValue'],
        ),
        this.extractMetricFromCollection(remainingEnergy, [SEMANTICS.remainingEnergyValue], ['RemainingEnergyValue']),
        this.extractMetricFromCollection(
          remainingRoundTripEnergyEfficiency,
          [SEMANTICS.remainingRoundTripEnergyEfficiencyValue],
          ['RemainingRoundTripEnergyEfficiencyValue'],
        ),
        this.extractMetricFromCollection(
          stateOfCertifiedEnergy,
          [SEMANTICS.stateOfCertifiedEnergyValue],
          ['StateOfCertifiedEnergyValue'],
        ),
        this.extractMetricFromCollection(stateOfCharge, [SEMANTICS.stateOfChargeValue], ['StateOfChargeValue']),
        this.extractMetricFromCollection(
          numberOfFullCycles,
          [SEMANTICS.numberOfFullCyclesValue],
          ['NumberOfFullCyclesValue'],
        ),
      ].filter((metric): metric is ProductConditionMetric => metric != null),
      throughputMetrics: [
        this.extractMetricFromCollection(
          capacityThroughput,
          [SEMANTICS.capacityThroughputValue],
          ['CapacityThroughputValue'],
        ),
        this.extractMetricFromCollection(
          energyThroughput,
          [SEMANTICS.energyThroughputValue],
          ['EnergyThroughputValue'],
        ),
      ].filter((metric): metric is ProductConditionMetric => metric != null),
      selfDischargeMetrics: [
        this.extractMetricFromCollection(
          currentSelfDischargingRate,
          [SEMANTICS.currentSelfDischargingRateValue],
          ['CurrentSelfDischargingRateValue'],
        ),
        this.extractMetricFromCollection(
          evolutionOfSelfDischarge,
          [SEMANTICS.evolutionOfSelfDischargeValue],
          ['EvolutionOfSelfDischargeValue'],
        ),
      ].filter((metric): metric is ProductConditionMetric => metric != null),
      powerCapabilityEntries: this.extractPowerCapabilityEntries(remainingPowerCapability),
      powerCapabilityLastUpdate: this.readLastUpdate(remainingPowerCapability),
      temperatureMetrics: this.extractTemperatureMetrics(temperatureInformation),
      temperatureLastUpdate: this.readLastUpdate(temperatureInformation),
      accidentDocumentIdentifiers: this.extractAccidentDocumentIdentifiers(informationOnAccidents),
      negativeEvents: this.extractNegativeEvents(negativeEvents),
      additionalDetails: root.filter((element) => !handledRootElements.has(element)),
    };
  }

  private extractMetricFromCollection(
    element: aas.types.ISubmodelElement | undefined,
    valueSemanticIds: string[],
    valueIdShorts: string[],
  ): ProductConditionMetric | null {
    if (!element) {
      return null;
    }

    const value = this.readText(this.findElement(this.childrenOf(element), valueSemanticIds, valueIdShorts)).trim();
    const lastUpdate = this.readLastUpdate(element);

    if (value === '' && lastUpdate === '') {
      return null;
    }

    return {
      label: this.labelFor(element),
      value,
      lastUpdate,
      idShortPath: element.idShort ?? this.labelFor(element),
    };
  }

  private extractTemperatureMetrics(element: aas.types.ISubmodelElement | undefined): ProductConditionMetric[] {
    if (!element) {
      return [];
    }

    const children = this.childrenOf(element);
    const parentPath = element.idShort ?? 'TemperatureInformation';

    return [
      this.extractMetricFromProperty(children, parentPath, [SEMANTICS.timeExtremeHighTemp], ['TimeExtremeHighTemp']),
      this.extractMetricFromProperty(children, parentPath, [SEMANTICS.timeExtremeLowTemp], ['TimeExtremeLowTemp']),
      this.extractMetricFromProperty(
        children,
        parentPath,
        [SEMANTICS.timeExtremeHighTempCharging],
        ['TimeExtremeHighTempCharging'],
      ),
      this.extractMetricFromProperty(
        children,
        parentPath,
        [SEMANTICS.timeExtremeLowTempCharging],
        ['TimeExtremeLowTempCharging'],
      ),
    ].filter((metric): metric is ProductConditionMetric => metric != null);
  }

  private extractMetricFromProperty(
    source: aas.types.ISubmodelElement[],
    parentPath: string,
    semanticIds: string[],
    idShorts: string[],
  ): ProductConditionMetric | null {
    const property = this.findElement(source, semanticIds, idShorts);
    const value = this.readText(property).trim();

    if (!property || value === '') {
      return null;
    }

    return {
      label: this.labelFor(property),
      value,
      lastUpdate: '',
      idShortPath: this.joinPath(parentPath, property.idShort ?? this.labelFor(property)),
    };
  }

  private extractPowerCapabilityEntries(
    element: aas.types.ISubmodelElement | undefined,
  ): ProductConditionPowerCapabilityEntry[] {
    return this.childrenOf(element)
      .filter(
        (child): child is aas.types.SubmodelElementCollection =>
          child instanceof aas.types.SubmodelElementCollection &&
          (SemanticIdHelper.hasSemanticId(child, SEMANTICS.remainingPowerCapabilityDynamicAt) ||
            (child.idShort ?? '').toLowerCase() === 'remainingpowercapabilitydynamicat'),
      )
      .map((entry) => {
        const children = this.childrenOf(entry);
        const atSoC = this.readText(this.findElement(children, [SEMANTICS.atSoC], ['AtSoC'])).trim();
        const powerCapabilityAt = this.readText(
          this.findElement(children, [SEMANTICS.powerCapabilityAt], ['PowerCapabilityAt']),
        ).trim();
        const rpcLastUpdated = this.readText(
          this.findElement(children, [SEMANTICS.rpcLastUpdated], ['RPCLastUpdated']),
        ).trim();

        return {
          label: this.labelFor(entry),
          atSoC,
          powerCapabilityAt,
          rpcLastUpdated,
          idShortPath: this.joinPath(element?.idShort ?? 'RemainingPowerCapability', entry.idShort ?? 'Entry'),
        };
      })
      .filter((entry) => entry.atSoC !== '' || entry.powerCapabilityAt !== '' || entry.rpcLastUpdated !== '');
  }

  private extractAccidentDocumentIdentifiers(element: aas.types.ISubmodelElement | undefined): string[] {
    return this.childrenOf(element)
      .map((child) => {
        const nestedIdentifier = this.findElement(
          this.childrenOf(child),
          [SEMANTICS.documentIdentifier],
          ['DocumentIdentifier'],
        );
        return this.readText(nestedIdentifier).trim() || this.readText(child).trim();
      })
      .filter((value) => value !== '');
  }

  private extractNegativeEvents(element: aas.types.ISubmodelElement | undefined): ProductConditionNegativeEvent[] {
    return this.childrenOf(element)
      .filter(
        (child): child is aas.types.SubmodelElementCollection =>
          child instanceof aas.types.SubmodelElementCollection &&
          (SemanticIdHelper.hasSemanticId(child, SEMANTICS.negativeEvent) ||
            (child.idShort ?? '').toLowerCase() === 'negativeevent'),
      )
      .map((entry, index) => {
        const children = this.childrenOf(entry);
        const value = this.readText(
          this.findElement(children, [SEMANTICS.negativeEventValue], ['NegativeEventValue']),
        ).trim();
        const lastUpdate = this.readLastUpdate(entry);

        return {
          value,
          lastUpdate,
          idShortPath: this.joinPath(
            element?.idShort ?? 'NegativeEvents',
            entry.idShort ?? `NegativeEvent${index + 1}`,
          ),
        };
      })
      .filter((entry) => entry.value !== '' || entry.lastUpdate !== '');
  }

  private readLastUpdate(element: aas.types.ISubmodelElement | undefined): string {
    return this.readText(this.findElement(this.childrenOf(element), [SEMANTICS.lastUpdate], ['LastUpdate'])).trim();
  }

  private findRootElement(
    source: aas.types.ISubmodelElement[],
    handledRootElements: Set<aas.types.ISubmodelElement>,
    semanticIds: string[],
    idShorts: string[],
  ): aas.types.ISubmodelElement | undefined {
    const element = this.findElement(source, semanticIds, idShorts);
    if (element) {
      handledRootElements.add(element);
    }
    return element;
  }

  private labelFor(element: aas.types.ISubmodelElement): string {
    const displayNames = element.displayName ?? [];
    const currentLanguage = this.currentLanguage.toLowerCase();

    return (
      displayNames.find((entry) => entry.language.toLowerCase() === currentLanguage)?.text ??
      displayNames.find((entry) => entry.language.toLowerCase() === 'en')?.text ??
      displayNames[0]?.text ??
      this.humanizeIdShort(element.idShort ?? '')
    );
  }

  private humanizeIdShort(idShort: string): string {
    return idShort
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .trim();
  }

  private joinPath(parentPath: string, idShort: string): string {
    return [parentPath, idShort].filter((part) => part.trim() !== '').join('.');
  }

  private readText(element: aas.types.ISubmodelElement | undefined): string {
    if (element instanceof aas.types.Property) {
      return `${element.value ?? ''}`;
    }

    if (element instanceof aas.types.MultiLanguageProperty) {
      const entries = element.value ?? [];
      const currentLanguage = this.currentLanguage.toLowerCase();

      return (
        entries.find((entry) => entry.language.toLowerCase() === currentLanguage)?.text ??
        entries.find((entry) => entry.language.toLowerCase() === 'en')?.text ??
        entries[0]?.text ??
        ''
      );
    }

    return '';
  }

  private childrenOf(element: aas.types.ISubmodelElement | null | undefined): aas.types.ISubmodelElement[] {
    if (element instanceof aas.types.SubmodelElementCollection || element instanceof aas.types.SubmodelElementList) {
      return element.value ?? [];
    }

    return [];
  }

  private findElement(
    source: aas.types.ISubmodelElement[],
    semanticIds: string[],
    idShorts: string[],
  ): aas.types.ISubmodelElement | undefined {
    return source.find((element) => {
      const normalizedIdShort = `${element.idShort ?? ''}`.toLowerCase();
      return (
        idShorts.some((candidate) => candidate.toLowerCase() === normalizedIdShort) ||
        semanticIds.some((semanticId) => SemanticIdHelper.hasSemanticId(element, semanticId))
      );
    });
  }
}
