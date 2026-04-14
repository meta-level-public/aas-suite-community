import * as aas from '@aas-core-works/aas-core3.1-typescript';

function semanticRef(value: string) {
  return new aas.types.Reference(aas.types.ReferenceTypes.ExternalReference, [
    new aas.types.Key(aas.types.KeyTypes.GlobalReference, value),
  ]);
}

function property(idShort: string, semanticId: string, value: string, displayName?: string) {
  const element = new aas.types.Property(aas.types.DataTypeDefXsd.String, null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  if (displayName) {
    element.displayName = [new aas.types.LangStringNameType('en', displayName)];
  }
  return element;
}

function collection(idShort: string, semanticId: string, value: aas.types.ISubmodelElement[], displayName?: string) {
  const element = new aas.types.SubmodelElementCollection(null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  if (displayName) {
    element.displayName = [new aas.types.LangStringNameType('en', displayName)];
  }
  return element;
}

function list(
  idShort: string,
  semanticId: string,
  typeValueListElement: aas.types.AasSubmodelElements,
  value: aas.types.ISubmodelElement[],
  displayName?: string,
) {
  const element = new aas.types.SubmodelElementList(typeValueListElement, null, null, idShort);
  element.semanticId = semanticRef(semanticId);
  element.value = value;
  if (displayName) {
    element.displayName = [new aas.types.LangStringNameType('en', displayName)];
  }
  return element;
}

export function createProductConditionExampleSubmodel() {
  const submodel = new aas.types.Submodel('urn:test:product-condition', null, null, 'ProductCondition');
  submodel.semanticId = semanticRef(
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#ProductCondition',
  );

  const remainingCapacity = collection(
    'RemainingCapacity',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingCapacity',
    [
      property(
        'RemainingCapacityValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingCapacityValue',
        '84.7',
        'remaining capacity value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:15:00Z',
        'last update',
      ),
    ],
    'remaining capacity',
  );

  const remainingEnergy = collection(
    'RemainingEnergy',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingEnergy',
    [
      property(
        'RemainingEnergyValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingEnergyValue',
        '63.2',
        'remaining energy value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:15:00Z',
        'last update',
      ),
    ],
    'remaining energy',
  );

  const remainingRoundTripEnergyEfficiency = collection(
    'RemainingRoundTripEnergyEfficiency',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingRoundTripEnergyEfficiency',
    [
      property(
        'RemainingRoundTripEnergyEfficiencyValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingRoundTripEnergyEfficiencyValue',
        '91.4',
        'remaining round trip energy efficiency value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:15:00Z',
        'last update',
      ),
    ],
    'remaining round trip energy efficiency',
  );

  const stateOfCertifiedEnergy = collection(
    'StateOfCertifiedEnergy',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#stateOfCertifiedEnergy',
    [
      property(
        'StateOfCertifiedEnergyValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#stateOfCertifiedEnergyValue',
        '87.1',
        'state of certified energy value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:15:00Z',
        'last update',
      ),
    ],
    'state of certified energy',
  );

  const stateOfCharge = collection(
    'StateOfCharge',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#stateOfCharge',
    [
      property(
        'StateOfChargeValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#stateOfChargeValue',
        '56.0',
        'state of charge value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:15:00Z',
        'last update',
      ),
    ],
    'state of charge',
  );

  const numberOfFullCycles = collection(
    'NumberOfFullCycles',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#numberOfFullCycles',
    [
      property(
        'NumberOfFullCyclesValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#numberOfFullCyclesValue',
        '342',
        'number of full cycles value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:15:00Z',
        'last update',
      ),
    ],
    'number of full cycles',
  );

  const capacityThroughput = collection(
    'CapacityThroughput',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#capacityThroughput',
    [
      property(
        'CapacityThroughputValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#capacityThroughputValue',
        '1285.5',
        'capacity throughput value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:20:00Z',
        'last update',
      ),
    ],
    'capacity throughput',
  );

  const energyThroughput = collection(
    'EnergyThroughput',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#energyThroughput',
    [
      property(
        'EnergyThroughputValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#energyThroughputValue',
        '2150.8',
        'energy throughput value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:20:00Z',
        'last update',
      ),
    ],
    'energy throughput',
  );

  const currentSelfDischargingRate = collection(
    'CurrentSelfDischargingRate',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#currentSelfDischargingRate',
    [
      property(
        'CurrentSelfDischargingRateValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#currentSelfDischargingRateValue',
        '1.8',
        'current self discharging rate value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:25:00Z',
        'last update',
      ),
    ],
    'current self discharging rate',
  );

  const evolutionOfSelfDischarge = collection(
    'EvolutionOfSelfDischarge',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#evolutionOfSelfDischarge',
    [
      property(
        'EvolutionOfSelfDischargeValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#evolutionOfSelfDischargeValue',
        '4.2',
        'evolution of self discharge value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:25:00Z',
        'last update',
      ),
    ],
    'evolution of self discharge',
  );

  const remainingPowerCapability = collection(
    'RemainingPowerCapability',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingPowerCapability',
    [
      collection(
        'RemainingPowerCapabilityDynamicAt',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#remainingPowerCapabilityDynamicAt',
        [
          property(
            'RPCLastUpdated',
            'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#rPCLastUpdated',
            '2026-03-18T10:30:00Z',
            'RPC last updated',
          ),
          property('AtSoC', 'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#atSoC', '80', 'At SoC'),
          property(
            'PowerCapabilityAt',
            'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#powerCapabilityAt',
            '125000',
            'power capability at',
          ),
        ],
        'remaining power capability dynamic at',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:31:00Z',
        'last update',
      ),
    ],
    'remaining power capability',
  );

  const temperatureInformation = collection(
    'TemperatureInformation',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#temperatureInformation',
    [
      property(
        'TimeExtremeHighTemp',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#timeExtremeHighTemp',
        '12.5',
        'time extreme high temp',
      ),
      property(
        'TimeExtremeLowTemp',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#timeExtremeLowTemp',
        '4.0',
        'time extreme low temp',
      ),
      property(
        'TimeExtremeHighTempCharging',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#timeExtremeHighTempCharging',
        '3.2',
        'time extreme high temp charging',
      ),
      property(
        'TimeExtremeLowTempCharging',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#timeExtremeLowTempCharging',
        '1.1',
        'time extreme low temp charging',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T10:35:00Z',
        'last update',
      ),
    ],
    'temperature information',
  );

  const informationOnAccidents = list(
    'InformationOnAccidents',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#informationOnAccidents',
    aas.types.AasSubmodelElements.Property,
    [
      property(
        'DocumentIdentifier',
        'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
        'ACC-2026-001',
        'document identifier',
      ),
      property(
        'DocumentIdentifierSecondary',
        'urn:samm:io.admin-shell.idta.handover_documentation:2.0.0#DocumentIdentifier',
        'ACC-2026-002',
        'document identifier',
      ),
    ],
    'information on accidents',
  );

  const negativeEvent = collection(
    'NegativeEvent',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#NegativeEvent',
    [
      property(
        'NegativeEventValue',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#negativeEventValue',
        'Thermal shutdown during fast charge',
        'negative event value',
      ),
      property(
        'LastUpdate',
        'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#lastUpdate',
        '2026-03-18T11:00:00Z',
        'last update',
      ),
    ],
    'negative event',
  );

  const negativeEvents = list(
    'NegativeEvents',
    'urn:samm:io.admin-shell.idta.batterypass.product_condition:1.0.0#negativeEvents',
    aas.types.AasSubmodelElements.SubmodelElementCollection,
    [negativeEvent],
    'negative events',
  );

  const serviceNote = property(
    'ServiceNote',
    'urn:test:product-condition:serviceNote',
    'Stored under observation after software update',
    'service note',
  );

  submodel.submodelElements = [
    remainingCapacity,
    remainingEnergy,
    remainingRoundTripEnergyEfficiency,
    stateOfCertifiedEnergy,
    stateOfCharge,
    numberOfFullCycles,
    capacityThroughput,
    energyThroughput,
    currentSelfDischargingRate,
    evolutionOfSelfDischarge,
    remainingPowerCapability,
    temperatureInformation,
    informationOnAccidents,
    negativeEvents,
    serviceNote,
  ];

  return submodel;
}
