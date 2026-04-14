import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { GeneratorExportState } from './generator-export.builder';

export interface GeneratorVariantExportBuilderHooks {
  appendTemplateBackedCoreExportSubmodels: (state: GeneratorExportState) => void;
  appendStandardAssistantCoreExportSubmodels: (state: GeneratorExportState) => void;
  appendBatteryPassportExportSubmodels: (state: GeneratorExportState) => void;
  appendDppCoreExportSubmodels: (state: GeneratorExportState) => void;
  shouldIncludeAdditionalSubmodel: (state: GeneratorExportState, submodel: aas.types.Submodel) => boolean;
  appendExportSubmodel: (state: GeneratorExportState, submodel: aas.types.Submodel) => void;
}

export function appendGeneratorVariantSubmodels(
  state: GeneratorExportState,
  hooks: GeneratorVariantExportBuilderHooks,
) {
  if (state.usesTemplateBackedCoreSubmodels) {
    hooks.appendTemplateBackedCoreExportSubmodels(state);
  } else if (!state.isBatteryPassport && !state.isDppCore) {
    hooks.appendStandardAssistantCoreExportSubmodels(state);
  }

  if (state.isBatteryPassport) {
    hooks.appendBatteryPassportExportSubmodels(state);
  }

  if (state.isDppCore) {
    hooks.appendDppCoreExportSubmodels(state);
  }

  state.additionalSubmodels
    .filter((submodel) => hooks.shouldIncludeAdditionalSubmodel(state, submodel))
    .forEach((submodel) => {
      hooks.appendExportSubmodel(state, submodel);
    });
}
