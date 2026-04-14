import { GeneratorMode } from './generator-flow.config';

export type GeneratorSelectionType = GeneratorMode | 'unguided';

export type GeneratorBootstrapStrategy = 'standard' | 'template' | 'empty' | 'existing';

export type GeneratorTemplateSource = 'battery-passport' | 'dpp-pcf';

export interface GeneratorModeConfig {
  sessionMode: GeneratorMode;
  bootstrapStrategy: GeneratorBootstrapStrategy;
  bootstrapMode?: 'typ' | 'instanz';
  bootstrapTemplateSource?: GeneratorTemplateSource;
  mergeTemplateSources?: GeneratorTemplateSource[];
  withDocumentation?: boolean;
  assetKind?: 'Type' | 'Instance';
  initializeCurrentYear?: boolean;
  resetCurrentIdToDraft: boolean;
  navigationCommands: Array<string | number>;
}

const generatorStartCommands = ['generator', 'asset-metadata'] as const;

const GENERATOR_MODE_CONFIG: Record<GeneratorMode, GeneratorModeConfig> = {
  typ: {
    sessionMode: 'typ',
    bootstrapStrategy: 'standard',
    bootstrapMode: 'typ',
    assetKind: 'Type',
    resetCurrentIdToDraft: true,
    navigationCommands: [...generatorStartCommands],
  },
  instanz: {
    sessionMode: 'instanz',
    bootstrapStrategy: 'standard',
    bootstrapMode: 'instanz',
    assetKind: 'Instance',
    initializeCurrentYear: true,
    resetCurrentIdToDraft: true,
    navigationCommands: [...generatorStartCommands],
  },
  vorlage: {
    sessionMode: 'vorlage',
    bootstrapStrategy: 'existing',
    assetKind: 'Type',
    resetCurrentIdToDraft: false,
    navigationCommands: [...generatorStartCommands],
  },
  aktiv: {
    sessionMode: 'aktiv',
    bootstrapStrategy: 'empty',
    withDocumentation: true,
    assetKind: 'Type',
    resetCurrentIdToDraft: true,
    navigationCommands: [...generatorStartCommands],
  },
  'battery-passport': {
    sessionMode: 'battery-passport',
    bootstrapStrategy: 'template',
    bootstrapMode: 'instanz',
    bootstrapTemplateSource: 'battery-passport',
    assetKind: 'Instance',
    initializeCurrentYear: true,
    resetCurrentIdToDraft: true,
    navigationCommands: [...generatorStartCommands],
  },
  'dpp-core': {
    sessionMode: 'dpp-core',
    bootstrapStrategy: 'standard',
    bootstrapMode: 'instanz',
    mergeTemplateSources: ['dpp-pcf'],
    assetKind: 'Instance',
    initializeCurrentYear: true,
    resetCurrentIdToDraft: true,
    navigationCommands: [...generatorStartCommands],
  },
};

export function getGeneratorModeConfig(selection: GeneratorSelectionType) {
  if (selection === 'unguided') {
    return null;
  }

  return GENERATOR_MODE_CONFIG[selection];
}
