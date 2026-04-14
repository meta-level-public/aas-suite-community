import * as aas from '@aas-core-works/aas-core3.1-typescript';
import {
  classifyBatteryPassportSubmodel,
  getBatteryPassportAdditionalSubmodels,
  getBatteryPassportSubmodel,
} from './battery-passport-template-registry';

export type GeneratorMode = 'typ' | 'instanz' | 'vorlage' | 'aktiv' | 'battery-passport' | 'dpp-core';

export interface GeneratorFlowStep {
  id: string;
  routeCommands: Array<string | number>;
  labelKey?: string;
  label?: string;
}

interface GeneratorFlowContext {
  mode?: GeneratorMode;
  additionalSubmodels: aas.types.Submodel[];
  usesBootstrappedStandardTemplates: boolean;
  formatLabel: (value: string) => string;
}

function createGeneratorFlowStep(
  id: string,
  routeCommands: Array<string | number>,
  labelKey?: string,
  label?: string,
): GeneratorFlowStep {
  return {
    id,
    routeCommands,
    labelKey,
    label,
  };
}

export function buildGeneratorFlow(context: GeneratorFlowContext) {
  const steps: GeneratorFlowStep[] = [
    createGeneratorFlowStep('asset-metadata', ['generator', 'asset-metadata'], 'ASSET_METADATA_DATA'),
  ];

  if (context.mode === 'battery-passport') {
    steps.push(createGeneratorFlowStep('nameplate', ['generator', 'nameplate'], 'DIGITAL_NAMEPLATE'));

    if (getBatteryPassportSubmodel(context.additionalSubmodels, 'technical-data') != null) {
      steps.push(createGeneratorFlowStep('technical-data', ['generator', 'technical-data'], 'TECHNICAL_DATA'));
    }

    if (getBatteryPassportSubmodel(context.additionalSubmodels, 'handover-documentation') != null) {
      steps.push(
        createGeneratorFlowStep('battery-handover', ['generator', 'battery-handover'], 'HANDOVER_DOCUMENTATION'),
      );
    }

    if (getBatteryPassportSubmodel(context.additionalSubmodels, 'product-carbon-footprint') != null) {
      steps.push(
        createGeneratorFlowStep(
          'battery-carbon-footprint',
          ['generator', 'battery-carbon-footprint'],
          'PRODUCT_CARBON_FOOTPRINT',
        ),
      );
    }

    getBatteryPassportAdditionalSubmodels(context.additionalSubmodels).forEach((submodel, index) => {
      const definition = classifyBatteryPassportSubmodel(submodel);
      steps.push({
        id: `battery-submodels:${index}`,
        routeCommands: ['generator', 'battery-submodels', index],
        labelKey: definition?.displayKey,
        label:
          definition == null ? context.formatLabel(submodel.idShort ?? `Battery Submodel ${index + 1}`) : undefined,
      });
    });
  } else if (context.mode === 'dpp-core') {
    steps.push(createGeneratorFlowStep('nameplate', ['generator', 'nameplate'], 'DIGITAL_NAMEPLATE'));
    steps.push(createGeneratorFlowStep('document', ['generator', 'document'], 'HANDOVER_DOCUMENTATION'));
    steps.push(createGeneratorFlowStep('dpp-core', ['generator', 'dpp-core'], 'PRODUCT_CARBON_FOOTPRINT'));
  } else {
    steps.push(
      createGeneratorFlowStep(
        'nameplate',
        ['generator', 'nameplate'],
        context.usesBootstrappedStandardTemplates ? 'DIGITAL_NAMEPLATE' : 'NAMEPLATE_DATA',
      ),
    );
    steps.push(
      createGeneratorFlowStep(
        'document',
        ['generator', 'document'],
        context.usesBootstrappedStandardTemplates ? 'HANDOVER_DOCUMENTATION' : 'DOCUMENT_DATA',
      ),
    );
  }

  steps.push(createGeneratorFlowStep('confirmation', ['generator', 'confirmation'], 'CONFIRM_AND_SAVE'));

  return steps;
}
