import { describe, expect, it } from 'vitest';
import { getGeneratorModeConfig } from './generator-mode.config';

describe('generator-mode.config', () => {
  it('describes battery passport as template-driven instance flow', () => {
    const config = getGeneratorModeConfig('battery-passport');

    expect(config).toMatchObject({
      sessionMode: 'battery-passport',
      bootstrapStrategy: 'template',
      bootstrapMode: 'instanz',
      bootstrapTemplateSource: 'battery-passport',
      assetKind: 'Instance',
      initializeCurrentYear: true,
      resetCurrentIdToDraft: true,
      navigationCommands: ['generator', 'asset-metadata'],
    });
  });

  it('describes dpp core as standard bootstrap with pcf augmentation', () => {
    const config = getGeneratorModeConfig('dpp-core');

    expect(config).toMatchObject({
      sessionMode: 'dpp-core',
      bootstrapStrategy: 'standard',
      bootstrapMode: 'instanz',
      mergeTemplateSources: ['dpp-pcf'],
      assetKind: 'Instance',
      initializeCurrentYear: true,
      resetCurrentIdToDraft: true,
      navigationCommands: ['generator', 'asset-metadata'],
    });
  });

  it('returns null for the unguided selection', () => {
    expect(getGeneratorModeConfig('unguided')).toBeNull();
  });
});
