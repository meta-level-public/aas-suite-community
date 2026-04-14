import * as aas from '@aas-core-works/aas-core3.1-typescript';
import { describe, expect, it, vi } from 'vitest';
import { GeneratorExportState } from './generator-export.builder';
import { appendGeneratorVariantSubmodels } from './generator-variant-export.builder';

function createState(overrides: Partial<GeneratorExportState> = {}): GeneratorExportState {
  return {
    formData: new FormData(),
    env: new aas.types.Environment([], []),
    shell: new aas.types.AssetAdministrationShell(
      'urn:test:shell',
      new aas.types.AssetInformation(aas.types.AssetKind.Type),
    ),
    requiredSemanticIds: [],
    assetGlobalId: 'urn:test:asset',
    dppId: 'urn:test:dpp',
    isBatteryPassport: false,
    isDppCore: false,
    usesTemplateBackedCoreSubmodels: false,
    additionalSubmodels: [],
    ...overrides,
  };
}

function createHooks() {
  return {
    appendTemplateBackedCoreExportSubmodels: vi.fn(),
    appendStandardAssistantCoreExportSubmodels: vi.fn(),
    appendBatteryPassportExportSubmodels: vi.fn(),
    appendDppCoreExportSubmodels: vi.fn(),
    shouldIncludeAdditionalSubmodel: vi.fn(() => true),
    appendExportSubmodel: vi.fn(),
  };
}

describe('generator-variant-export.builder', () => {
  it('uses template-backed core assembly when bootstrapped core submodels are available', () => {
    const state = createState({ usesTemplateBackedCoreSubmodels: true });
    const hooks = createHooks();

    appendGeneratorVariantSubmodels(state, hooks);

    expect(hooks.appendTemplateBackedCoreExportSubmodels).toHaveBeenCalledWith(state);
    expect(hooks.appendStandardAssistantCoreExportSubmodels).not.toHaveBeenCalled();
  });

  it('uses standard assistant core assembly for non-dpp non-battery flows', () => {
    const state = createState();
    const hooks = createHooks();

    appendGeneratorVariantSubmodels(state, hooks);

    expect(hooks.appendStandardAssistantCoreExportSubmodels).toHaveBeenCalledWith(state);
    expect(hooks.appendBatteryPassportExportSubmodels).not.toHaveBeenCalled();
    expect(hooks.appendDppCoreExportSubmodels).not.toHaveBeenCalled();
  });

  it('runs battery passport and dpp core builders only for their matching modes', () => {
    const batteryState = createState({ isBatteryPassport: true });
    const dppState = createState({ isDppCore: true });
    const hooks = createHooks();

    appendGeneratorVariantSubmodels(batteryState, hooks);
    appendGeneratorVariantSubmodels(dppState, hooks);

    expect(hooks.appendBatteryPassportExportSubmodels).toHaveBeenCalledWith(batteryState);
    expect(hooks.appendDppCoreExportSubmodels).toHaveBeenCalledWith(dppState);
  });

  it('appends only additional submodels that pass the inclusion predicate', () => {
    const includedSubmodel = new aas.types.Submodel('urn:test:included');
    const excludedSubmodel = new aas.types.Submodel('urn:test:excluded');
    const state = createState({
      additionalSubmodels: [includedSubmodel, excludedSubmodel],
    });
    const hooks = createHooks();
    hooks.shouldIncludeAdditionalSubmodel.mockImplementation((_state, submodel) => submodel.id === 'urn:test:included');

    appendGeneratorVariantSubmodels(state, hooks);

    expect(hooks.appendExportSubmodel).toHaveBeenCalledTimes(1);
    expect(hooks.appendExportSubmodel).toHaveBeenCalledWith(state, includedSubmodel);
  });
});
