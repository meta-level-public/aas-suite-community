import * as aas from '@aas-core-works/aas-core3.1-typescript';

import { describe, expect, it } from 'vitest';

import { createGeneratorExportState } from './generator-export.builder';

describe('generator-export.builder', () => {
  it('creates a template-backed export state for standard generator flows', () => {
    const shell = new aas.types.AssetAdministrationShell(
      'urn:test:aas',
      new aas.types.AssetInformation(aas.types.AssetKind.Type),
    );
    shell.idShort = 'exampleAas';
    shell.description = [new aas.types.LangStringTextType('en', 'Example AAS')];
    shell.assetInformation.globalAssetId = 'urn:test:asset';
    shell.assetInformation.defaultThumbnail = new aas.types.Resource('file:/aasx/files/thumb.png', 'image/png');

    const state = createGeneratorExportState({
      baseShell: shell,
      mode: 'typ',
      iriPrefix: 'https://example.com/',
      standardGeneratorTemplateRoles: [{}],
      additionalSubmodels: [],
    });

    expect(state.isBatteryPassport).toBe(false);
    expect(state.isDppCore).toBe(false);
    expect(state.usesTemplateBackedCoreSubmodels).toBe(true);
    expect(state.assetGlobalId).toBe('urn:test:asset');
    expect(state.shell.id).toBe('urn:test:aas');
    expect(state.shell.idShort).toBe('exampleAas');
    expect(state.shell.description?.[0]?.text).toBe('Example AAS');
    expect(state.shell.assetInformation.assetKind).toBe(aas.types.AssetKind.Type);
    expect(state.shell.assetInformation.globalAssetId).toBe('urn:test:asset');
    expect(state.shell.assetInformation.defaultThumbnail?.path).toBe('file:/aasx/files/thumb.png');
    expect(state.formData.get('aasxFilename')).toBe('exampleAas.aasx');
  });

  it('marks battery passport mode and avoids template-backed core submodels', () => {
    const shell = new aas.types.AssetAdministrationShell(
      'urn:test:battery-passport-aas',
      new aas.types.AssetInformation(aas.types.AssetKind.Instance),
    );
    shell.idShort = 'batteryPassportAas';

    const state = createGeneratorExportState({
      baseShell: shell,
      mode: 'battery-passport',
      iriPrefix: 'https://example.com/',
      standardGeneratorTemplateRoles: [{}],
      additionalSubmodels: [],
    });

    expect(state.isBatteryPassport).toBe(true);
    expect(state.isDppCore).toBe(false);
    expect(state.usesTemplateBackedCoreSubmodels).toBe(false);
    expect(state.shell.assetInformation.assetKind).toBe(aas.types.AssetKind.Instance);
  });

  it('normalizes invalid asset shell idShort values for export', () => {
    const shell = new aas.types.AssetAdministrationShell('', new aas.types.AssetInformation(aas.types.AssetKind.Type));
    shell.idShort = '1-';

    const state = createGeneratorExportState({
      baseShell: shell,
      mode: 'typ',
      iriPrefix: 'https://example.com/',
      standardGeneratorTemplateRoles: [],
      additionalSubmodels: [],
    });

    expect(state.shell.idShort).toBe('a1');
    expect(state.shell.id).toBe('https://example.com/ids/aas/a1');
    expect(state.formData.get('aasxFilename')).toBe('a1.aasx');
  });

  it('builds a deterministic asset identifier from the idShort when no asset id is provided', () => {
    const shell = new aas.types.AssetAdministrationShell('', new aas.types.AssetInformation(aas.types.AssetKind.Type));
    shell.idShort = 'batteryModule';

    const state = createGeneratorExportState({
      baseShell: shell,
      mode: 'typ',
      iriPrefix: 'https://example.com/',
      standardGeneratorTemplateRoles: [],
      additionalSubmodels: [],
    });

    expect(state.shell.assetInformation.globalAssetId).toBe('https://example.com/ids/asset/batteryModule');
  });

  it('does not set a default thumbnail when no asset thumbnail was provided', () => {
    const shell = new aas.types.AssetAdministrationShell(
      'urn:test:aas',
      new aas.types.AssetInformation(aas.types.AssetKind.Type),
    );
    shell.idShort = 'exampleAas';

    const state = createGeneratorExportState({
      baseShell: shell,
      mode: 'typ',
      iriPrefix: 'https://example.com/',
      standardGeneratorTemplateRoles: [],
      additionalSubmodels: [],
    });

    expect(state.shell.assetInformation.defaultThumbnail).toBeNull();
  });

  it('uses the provided generator root environment instead of rebuilding the shell', () => {
    const shell = new aas.types.AssetAdministrationShell(
      'urn:test:existing-aas',
      new aas.types.AssetInformation(aas.types.AssetKind.Type),
    );
    shell.idShort = 'existingShell';
    shell.description = [new aas.types.LangStringTextType('en', 'Existing shell')];
    shell.assetInformation.globalAssetId = 'urn:test:existing-asset';

    const environment = new aas.types.Environment([shell], [], []);

    const state = createGeneratorExportState({
      baseEnvironment: environment,
      baseShell: shell,
      mode: 'typ',
      iriPrefix: 'https://example.com/',
      standardGeneratorTemplateRoles: [],
      additionalSubmodels: [],
    });

    expect(state.shell.id).toBe('urn:test:existing-aas');
    expect(state.shell.idShort).toBe('existingShell');
    expect(state.shell.assetInformation.globalAssetId).toBe('urn:test:existing-asset');
    expect(state.formData.get('aasxFilename')).toBe('existingShell.aasx');
  });
});
